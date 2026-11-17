import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Pressable, RefreshControl, SectionList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { errorMessage } from '@/core/api';
import type { AppointmentSummary } from '@/core/models';
import { useAppointments, useCheckIn } from '@/core/queries';
import { fonts, radius, type, usePalette, useTones } from '@/theme';

import { Icon } from './Icon';
import { PageHeader } from './PageHeader';
import { Card, EmptyState, ErrorCard, FilterChips, IconButton, Loading, SearchBar, StatusChip } from './ui';

const timeFormat = new Intl.DateTimeFormat('tr-TR', { hour: '2-digit', minute: '2-digit' });
const dayFormat = new Intl.DateTimeFormat('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' });

type Range = 'today' | 'upcoming' | 'all';

const dayKey = (date?: Date) => (date ? date.toDateString() : 'none');

function dayTitle(date: Date | undefined, today: Date): string {
  if (!date) return 'Tarihsiz';
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
  if (dayKey(date) === dayKey(today)) return `Bugün · ${dayFormat.format(date)}`;
  if (dayKey(date) === dayKey(tomorrow)) return `Yarın · ${dayFormat.format(date)}`;
  return dayFormat.format(date);
}

export function AppointmentList({ customerMode }: { customerMode: boolean }) {
  const palette = usePalette();
  const query = useAppointments({ includeCustomers: !customerMode });
  const [range, setRange] = useState<Range>(customerMode ? 'upcoming' : 'today');
  const [search, setSearch] = useState('');
  const openBooking = () => router.push('/booking');

  const { sections, counts } = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const items = query.data ?? [];
    const inRange = (item: AppointmentSummary, which: Range) => {
      if (which === 'all') return true;
      if (!item.startAt) return which === 'upcoming';
      if (which === 'today') return dayKey(item.startAt) === dayKey(now);
      return item.startAt >= startOfToday;
    };
    const needle = search.trim().toLocaleLowerCase('tr');
    const visible = items
      .filter((item) => inRange(item, range))
      .filter(
        (item) =>
          !needle ||
          [item.customerName, item.serviceName, item.staffName, item.roomName]
            .join(' ')
            .toLocaleLowerCase('tr')
            .includes(needle),
      );
    const groups = new Map<string, { title: string; data: AppointmentSummary[] }>();
    for (const item of visible) {
      const key = dayKey(item.startAt);
      if (!groups.has(key)) groups.set(key, { title: dayTitle(item.startAt, now), data: [] });
      groups.get(key)!.data.push(item);
    }
    return {
      sections: [...groups.values()],
      counts: {
        today: items.filter((item) => inRange(item, 'today')).length,
        upcoming: items.filter((item) => inRange(item, 'upcoming')).length,
        all: items.length,
      },
    };
  }, [query.data, range, search]);

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: palette.background }}>
      <PageHeader
        title={customerMode ? 'Randevularım' : 'Randevu Akışı'}
        subtitle={customerMode ? 'Yaklaşan ve geçmiş bakımlar' : 'Check-in ve seans akışı'}
        trailing={<IconButton icon="add" label="Yeni randevu" onPress={openBooking} tinted />}
      />
      <View style={styles.toolbar}>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Ara (müşteri, hizmet, uzman)..." />
        <FilterChips
          value={range}
          onChange={setRange}
          options={[
            { value: 'today', label: 'Bugün', count: counts.today },
            { value: 'upcoming', label: 'Yaklaşan', count: counts.upcoming },
            { value: 'all', label: 'Tümü', count: counts.all },
          ]}
        />
      </View>
      {query.isPending ? (
        <Loading />
      ) : query.isError ? (
        <View style={{ padding: 20 }}>
          <ErrorCard error={query.error} onRetry={() => void query.refetch()} />
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          contentContainerStyle={sections.length === 0 ? { flexGrow: 1 } : styles.list}
          stickySectionHeadersEnabled={false}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          refreshControl={<RefreshControl refreshing={query.isRefetching} onRefresh={() => void query.refetch()} />}
          renderSectionHeader={({ section }) => (
            <Text style={[type.overline, styles.sectionHeader, { color: palette.muted }]}>{section.title}</Text>
          )}
          ListEmptyComponent={
            <EmptyState
              icon="event-available"
              title={search ? 'Eşleşen randevu yok' : 'Randevu bulunamadı'}
              message={search ? 'Aramanızı değiştirip tekrar deneyin.' : 'Yeni randevu oluşturduğunuzda burada görünecek.'}
              actionLabel="Randevu oluştur"
              onAction={search ? undefined : openBooking}
            />
          }
          renderItem={({ item }) => <AppointmentCard item={item} customerMode={customerMode} />}
        />
      )}
    </SafeAreaView>
  );
}

function AppointmentCard({ item, customerMode }: { item: AppointmentSummary; customerMode: boolean }) {
  const palette = usePalette();
  const tones = useTones();
  const checkIn = useCheckIn();
  const start = item.startAt;

  const onCheckIn = () =>
    checkIn.mutate(
      { appointmentId: item.id, branchId: item.branchId },
      { onError: (error) => Alert.alert('Check-in yapılamadı', errorMessage(error)) },
    );
  const openSession = () =>
    router.push({
      pathname: '/service-detail/[appointmentId]',
      params: { appointmentId: item.id, serviceName: item.serviceName, customerName: item.customerName },
    });

  const action =
    !customerMode && item.status === 'confirmed'
      ? { label: 'Check-in', icon: 'login' as const, onPress: onCheckIn, tone: tones.sky }
      : !customerMode && (item.status === 'checked-in' || item.status === 'in-progress')
        ? { label: 'Seansı başlat', icon: 'play-arrow' as const, onPress: openSession, tone: tones.emerald }
        : undefined;

  return (
    <Card style={styles.card}>
      <View style={[styles.timeBox, { backgroundColor: palette.primarySoft }]}>
        <Text style={{ color: palette.primary, fontFamily: fonts.extrabold, fontSize: 16 }}>
          {start ? timeFormat.format(start) : '--:--'}
        </Text>
        {item.endAt ? (
          <Text style={[type.caption, { color: palette.muted, fontSize: 11, marginTop: 2 }]}>
            {timeFormat.format(item.endAt)}
          </Text>
        ) : null}
      </View>
      <View style={{ flex: 1, gap: 3 }}>
        <Text style={[type.bodyStrong, { color: palette.text }]} numberOfLines={1}>
          {item.serviceName}
        </Text>
        <View style={styles.metaRow}>
          <Icon name={customerMode ? 'badge' : 'person-outline'} size={14} color={palette.muted} />
          <Text style={[type.caption, { color: palette.muted, flex: 1 }]} numberOfLines={1}>
            {customerMode ? item.staffName || 'Uzman atanıyor' : item.customerName}
            {!customerMode && item.staffName ? ` · ${item.staffName}` : ''}
          </Text>
        </View>
        <View style={[styles.metaRow, { marginTop: 6, justifyContent: 'space-between' }]}>
          <StatusChip status={item.status} />
          {action ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={action.label}
              onPress={action.onPress}
              disabled={checkIn.isPending}
              style={({ pressed }) => [
                styles.action,
                { backgroundColor: action.tone.bg, borderColor: action.tone.border, opacity: pressed || checkIn.isPending ? 0.6 : 1 },
              ]}
            >
              <Icon name={action.icon} size={16} color={action.tone.fg} />
              <Text style={{ color: action.tone.fg, fontFamily: fonts.bold, fontSize: 12 }}>{action.label}</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  toolbar: { paddingHorizontal: 20, gap: 12, paddingBottom: 8 },
  list: { paddingHorizontal: 20, paddingBottom: 28 },
  sectionHeader: { marginTop: 16, marginBottom: 10 },
  card: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, padding: 14 },
  timeBox: { width: 62, paddingVertical: 10, borderRadius: radius.md, alignItems: 'center' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
});
