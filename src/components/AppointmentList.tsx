import { router } from 'expo-router';
import { Alert, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { errorMessage } from '@/core/api';
import type { AppointmentSummary } from '@/core/models';
import { useAppointments, useCheckIn } from '@/core/queries';
import { radius, usePalette, withAlpha } from '@/theme';

import { PageHeader } from './PageHeader';
import { Card, EmptyState, ErrorCard, IconButton, Loading, StatusChip } from './ui';

const timeFormat = new Intl.DateTimeFormat('tr-TR', { hour: '2-digit', minute: '2-digit' });
const dayFormat = new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'numeric', year: 'numeric' });

export function AppointmentList({ customerMode }: { customerMode: boolean }) {
  const palette = usePalette();
  const query = useAppointments();
  const openBooking = () => router.push('/booking');

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: palette.background }}>
      <PageHeader
        title={customerMode ? 'Randevularım' : 'Günlük Randevular'}
        subtitle={customerMode ? 'Yaklaşan ve geçmiş bakımlar' : 'Check-in ve seans akışı'}
        trailing={<IconButton icon="add-circle-outline" label="Yeni randevu" onPress={openBooking} />}
      />
      {query.isPending ? (
        <Loading />
      ) : query.isError ? (
        <View style={{ padding: 24 }}>
          <ErrorCard error={query.error} onRetry={() => void query.refetch()} />
        </View>
      ) : (
        <FlatList
          data={query.data}
          keyExtractor={(item) => item.id}
          contentContainerStyle={query.data.length === 0 ? { flexGrow: 1 } : styles.list}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          refreshControl={<RefreshControl refreshing={query.isRefetching} onRefresh={() => void query.refetch()} />}
          ListEmptyComponent={
            <EmptyState
              icon="event-available"
              title="Randevu bulunamadı"
              message="Yeni randevu oluşturduğunuzda burada görünecek."
              actionLabel="Randevu oluştur"
              onAction={openBooking}
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
  const checkIn = useCheckIn();
  const start = item.startAt;

  const onCheckIn = () =>
    checkIn.mutate(
      { appointmentId: item.id, branchId: item.branchId },
      { onError: (error) => Alert.alert('Check-in yapılamadı', errorMessage(error)) },
    );

  return (
    <Card style={styles.card}>
      <View style={[styles.timeBox, { backgroundColor: withAlpha(palette.primary, 0.1) }]}>
        <Text style={{ color: palette.primary, fontWeight: '800' }}>{start ? timeFormat.format(start) : '--:--'}</Text>
        <Text style={{ color: palette.text, fontSize: 10, marginTop: 3 }}>
          {start ? dayFormat.format(start) : 'Tarih yok'}
        </Text>
      </View>
      <View style={{ flex: 1, gap: 4 }}>
        <Text style={[styles.service, { color: palette.text }]}>{item.serviceName}</Text>
        <Text style={{ color: palette.muted }}>
          {customerMode ? item.staffName || 'Uzman bilgisi bekleniyor' : item.customerName}
        </Text>
        <View style={{ marginTop: 6 }}>
          <StatusChip status={item.status} />
        </View>
      </View>
      {!customerMode && item.status === 'confirmed' ? (
        <IconButton icon="login" label="Check-in yap" onPress={onCheckIn} />
      ) : null}
      {!customerMode && item.status === 'checked-in' ? (
        <IconButton
          icon="arrow-forward"
          label="Seans detayını aç"
          onPress={() =>
            router.push({
              pathname: '/service-detail/[appointmentId]',
              params: { appointmentId: item.id, serviceName: item.serviceName, customerName: item.customerName },
            })
          }
        />
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  list: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 28 },
  card: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, padding: 16 },
  timeBox: { width: 64, paddingVertical: 12, borderRadius: radius.md, alignItems: 'center' },
  service: { fontSize: 16, fontWeight: '800' },
});
