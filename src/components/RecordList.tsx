import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import type { ApiRecord } from '@/core/models';
import { useRecords } from '@/core/queries';
import { usePalette, withAlpha } from '@/theme';

import { Icon, type IconName } from './Icon';
import { PageHeader } from './PageHeader';
import { Card, EmptyState, ErrorCard, Loading } from './ui';

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
  return (
    <SafeAreaView edges={edges} style={{ flex: 1, backgroundColor: palette.background }}>
      <PageHeader title={title} subtitle="MainApi ile canlı ve güvenli veri" />
      {query.isPending ? (
        <Loading />
      ) : query.isError ? (
        <View style={{ padding: 24 }}>
          <ErrorCard error={query.error} onRetry={() => void query.refetch()} />
        </View>
      ) : (
        <FlatList
          data={query.data}
          keyExtractor={(item, index) => item.id || String(index)}
          contentContainerStyle={query.data.length === 0 ? { flexGrow: 1 } : styles.list}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          refreshControl={<RefreshControl refreshing={query.isRefetching} onRefresh={() => void query.refetch()} />}
          ListEmptyComponent={
            <EmptyState icon={icon} title="Kayıt bulunamadı" message="Yetkiniz kapsamında görüntülenecek bir kayıt yok." />
          }
          renderItem={({ item }) => <RecordTile record={item} icon={icon} />}
        />
      )}
    </SafeAreaView>
  );
}

function RecordTile({ record, icon }: { record: ApiRecord; icon: IconName }) {
  const palette = usePalette();
  const subtitle = record.text('status', record.text('phone', record.text('packageId', 'Kayıt ayrıntısı')));
  const remaining = record.values.remainingSessions;
  return (
    <Card style={styles.tile}>
      <View style={[styles.avatar, { backgroundColor: withAlpha(palette.primary, 0.1) }]}>
        <Icon name={icon} color={palette.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: palette.text, fontWeight: '700', fontSize: 16 }}>{record.title}</Text>
        <Text style={{ color: palette.muted }}>{subtitle}</Text>
      </View>
      {typeof remaining === 'number' ? (
        <Text style={{ color: palette.text, fontWeight: '700' }}>{remaining} kalan</Text>
      ) : (
        <Icon name="chevron-right" color={palette.muted} />
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  list: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 28 },
  tile: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 16, paddingVertical: 14 },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
});
