import { useMemo, useState } from 'react';
import { FlatList, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { formatCurrency, statusLabels, type ApiRecord } from '@/core/models';
import { useRecords } from '@/core/queries';
import { radius, statusTones, type, usePalette } from '@/theme';

import { Icon, type IconName } from './Icon';
import { PageHeader } from './PageHeader';
import { Badge, Card, DetailRow, EmptyState, ErrorCard, Loading, SearchBar, Sheet } from './ui';

const dateFormat = new Intl.DateTimeFormat('tr-TR', { dateStyle: 'medium', timeStyle: 'short' });

/** Turkish labels for fields that commonly appear in MainApi beauty records. */
const fieldLabels: Record<string, string> = {
  name: 'Ad',
  fullName: 'Ad soyad',
  title: 'Başlık',
  phone: 'Telefon',
  email: 'E-posta',
  status: 'Durum',
  amount: 'Tutar',
  method: 'Ödeme yöntemi',
  price: 'Fiyat',
  stockQuantity: 'Stok',
  criticalStock: 'Kritik eşik',
  unit: 'Birim',
  totalSessions: 'Toplam seans',
  usedSessions: 'Kullanılan seans',
  remainingSessions: 'Kalan seans',
  expiresAt: 'Bitiş',
  startAt: 'Başlangıç',
  endAt: 'Bitiş',
  durationMin: 'Süre (dk)',
  role: 'Rol',
  rate: 'Oran',
  commissionRate: 'Komisyon oranı',
  description: 'Açıklama',
  notes: 'Not',
  message: 'Mesaj',
  channel: 'Kanal',
  serialNumber: 'Seri no',
  model: 'Model',
  createdAt: 'Oluşturma',
  updatedAt: 'Güncelleme',
};

const hiddenFields = new Set(['id', 'tenantId', 'createdBy', 'updatedBy', 'deletedAt', 'deletedBy', 'version', 'userId']);
const moneyFields = new Set(['amount', 'price', 'tip', 'total', 'balance']);

function formatValue(key: string, value: unknown): string | undefined {
  if (value === null || value === undefined || value === '') return undefined;
  if (typeof value === 'boolean') return value ? 'Evet' : 'Hayır';
  if (typeof value === 'number') return moneyFields.has(key) ? formatCurrency(value) : value.toLocaleString('tr-TR');
  if (typeof value === 'string') {
    if (key === 'status') return statusLabels[value] ?? value;
    if (/^\d{4}-\d{2}-\d{2}T/.test(value)) {
      const date = new Date(value);
      if (!Number.isNaN(date.getTime())) return dateFormat.format(date);
    }
    return value;
  }
  return undefined;
}

function detailRows(record: ApiRecord): { label: string; value: string }[] {
  return Object.entries(record.values)
    .filter(([key]) => !hiddenFields.has(key) && !key.endsWith('Id') && !key.endsWith('Ids'))
    .map(([key, value]) => ({ label: fieldLabels[key] ?? key, value: formatValue(key, value) }))
    .filter((row): row is { label: string; value: string } => row.value !== undefined)
    .slice(0, 24);
}

function subtitleFor(record: ApiRecord): string {
  const amount = record.values.amount;
  if (typeof amount === 'number') return formatCurrency(amount);
  return record.text('phone', record.text('email', record.text('description', record.text('category', ''))));
}

export function RecordList({
  resource,
  title,
  icon,
  edges = ['top'],
}: {
  resource: string;
  title: string;
  icon: IconName;
  edges?: Edge[];
}) {
  const palette = usePalette();
  const query = useRecords(resource);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<ApiRecord>();

  const items = useMemo(() => {
    const needle = search.trim().toLocaleLowerCase('tr');
    const data = query.data ?? [];
    if (!needle) return data;
    return data.filter((record) => JSON.stringify(record.values).toLocaleLowerCase('tr').includes(needle));
  }, [query.data, search]);

  const total = query.data?.length ?? 0;

  return (
    <SafeAreaView edges={edges} style={{ flex: 1, backgroundColor: palette.background }}>
      <PageHeader title={title} subtitle={query.data ? `${total} kayıt · canlı veri` : 'MainApi ile canlı veri'} />
      <View style={styles.toolbar}>
        <SearchBar value={search} onChangeText={setSearch} />
      </View>
      {query.isPending ? (
        <Loading />
      ) : query.isError ? (
        <View style={{ padding: 20 }}>
          <ErrorCard error={query.error} onRetry={() => void query.refetch()} />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item, index) => item.id || String(index)}
          contentContainerStyle={items.length === 0 ? { flexGrow: 1 } : styles.list}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          refreshControl={<RefreshControl refreshing={query.isRefetching} onRefresh={() => void query.refetch()} />}
          ListEmptyComponent={
            <EmptyState
              icon={icon}
              title={search ? 'Eşleşen kayıt yok' : 'Kayıt bulunamadı'}
              message={search ? 'Aramanızı değiştirip tekrar deneyin.' : 'Yetkiniz kapsamında görüntülenecek bir kayıt yok.'}
            />
          }
          renderItem={({ item }) => <RecordTile record={item} icon={icon} onPress={() => setSelected(item)} />}
        />
      )}
      <Sheet
        visible={selected !== undefined}
        title={selected?.title ?? ''}
        subtitle={title}
        onClose={() => setSelected(undefined)}
      >
        <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}>
          {selected
            ? detailRows(selected).map((row) => <DetailRow key={row.label} label={row.label} value={row.value} />)
            : null}
        </ScrollView>
      </Sheet>
    </SafeAreaView>
  );
}

function RecordTile({ record, icon, onPress }: { record: ApiRecord; icon: IconName; onPress: () => void }) {
  const palette = usePalette();
  const subtitle = subtitleFor(record);
  const status = record.text('status');
  const remaining = record.values.remainingSessions;
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`${record.title} ayrıntıları`} onPress={onPress}>
      {({ pressed }) => (
        <Card style={[styles.tile, { opacity: pressed ? 0.85 : 1 }]}>
          <View style={[styles.avatar, { backgroundColor: palette.primarySoft }]}>
            <Icon name={icon} size={20} color={palette.primary} />
          </View>
          <View style={{ flex: 1, gap: 3 }}>
            <Text style={[type.bodyStrong, { color: palette.text }]} numberOfLines={1}>
              {record.title}
            </Text>
            {subtitle ? (
              <Text style={[type.caption, { color: palette.muted }]} numberOfLines={1}>
                {subtitle}
              </Text>
            ) : null}
            {status || typeof remaining === 'number' ? (
              <View style={{ flexDirection: 'row', gap: 6, marginTop: 4 }}>
                {status ? <Badge label={statusLabels[status] ?? status} tone={statusTones[status] ?? 'slate'} dot /> : null}
                {typeof remaining === 'number' ? <Badge label={`${remaining} seans kaldı`} tone="purple" /> : null}
              </View>
            ) : null}
          </View>
          <Icon name="chevron-right" color={palette.muted} />
        </Card>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  toolbar: { paddingHorizontal: 20, paddingBottom: 12 },
  list: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 28 },
  tile: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 14, paddingVertical: 14 },
  avatar: { width: 42, height: 42, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
});
