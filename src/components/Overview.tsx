import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { formatCurrency, type BeautyRole } from '@/core/models';
import { useDashboard } from '@/core/queries';
import { sessionRoleLabel, useSession } from '@/core/session';
import { accent, radius, usePalette } from '@/theme';

import { Icon } from './Icon';
import { PageHeader } from './PageHeader';
import { Button, Card, ErrorCard, Loading, MetricCard, SectionTitle } from './ui';

export function Overview({ role }: { role: BeautyRole }) {
  const palette = usePalette();
  const session = useSession();
  const dashboard = useDashboard();
  const customer = role === 'customer';
  const data = dashboard.data;
  const subtitle = [session.tenantName, session.branchName, sessionRoleLabel(session)].filter(Boolean).join(' · ');

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: palette.background }}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={dashboard.isRefetching} onRefresh={() => void dashboard.refetch()} />
        }
      >
        <PageHeader title={session.displayName ?? 'Odivon Beauty'} subtitle={subtitle} />
        <View style={styles.body}>
          <HeroPanel role={role} centerCode={session.centerCode} />
          {dashboard.isPending ? (
            <Card style={{ height: 120 }}>
              <Loading />
            </Card>
          ) : dashboard.isError ? (
            <ErrorCard error={dashboard.error} onRetry={() => void dashboard.refetch()} />
          ) : (
            <View style={{ gap: 12 }}>
              <SectionTitle>{customer ? 'Hesap özeti' : 'Bugünün nabzı'}</SectionTitle>
              <View style={styles.row}>
                <MetricCard label="Randevu" value={String(data?.appointments ?? 0)} icon="calendar-month" color={accent.indigo} />
                <MetricCard
                  label={customer ? 'Aktif paket' : 'Müşteriler'}
                  value={String(customer ? (data?.packages ?? 0) : (data?.customers ?? 0))}
                  icon={customer ? 'card-membership' : 'groups'}
                  color={accent.sky}
                />
              </View>
              <View style={styles.row}>
                <MetricCard
                  label={customer ? 'Tamamlanan seans' : 'Ciro'}
                  value={customer ? String(data?.sessions ?? 0) : formatCurrency(data?.revenue ?? 0)}
                  icon={customer ? 'spa' : 'trending-up'}
                  color={accent.emerald}
                />
                <MetricCard
                  label={customer ? 'Profil' : 'Kritik stok'}
                  value={customer ? 'Aktif' : String(data?.criticalStock ?? 0)}
                  icon={customer ? 'verified-user' : 'inventory-2'}
                  color={accent.amber}
                />
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function HeroPanel({ role, centerCode }: { role: BeautyRole; centerCode?: string }) {
  const customer = role === 'customer';
  return (
    <LinearGradient colors={['#4338CA', '#8B5CF6']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
      <Icon name="auto-awesome" color="#FFFFFF" />
      <Text style={styles.heroTitle}>{customer ? 'Bakım yolculuğunuzu planlayın' : 'Merkeziniz bugüne hazır'}</Text>
      {!customer && centerCode ? (
        <View accessible accessibilityLabel={`Müşteri mobil erişim kodu ${centerCode}`} style={styles.codeBadge}>
          <Icon name="key" size={17} color="#FFFFFF" />
          <Text style={{ color: '#FFFFFF', fontWeight: '800' }}>Müşteri mobil kodu: {centerCode}</Text>
        </View>
      ) : null}
      <Text style={styles.heroText}>
        {customer
          ? 'Müsait saatleri görün, paketinizi takip edin ve randevunuzu yönetin.'
          : 'Randevu, kasa, ekip ve stok sinyalleri tek mobil görünümde.'}
      </Text>
      <Button
        label={customer ? 'Randevu al' : 'Randevu oluştur'}
        icon="add"
        variant="light"
        onPress={() => router.push('/booking')}
        style={{ alignSelf: 'flex-start', marginTop: 10 }}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  body: { paddingHorizontal: 20, paddingBottom: 30, gap: 18 },
  row: { flexDirection: 'row', gap: 12 },
  hero: { borderRadius: radius.xxl, padding: 22, gap: 8 },
  heroTitle: { color: '#FFFFFF', fontSize: 24, fontWeight: '800', marginTop: 12 },
  heroText: { color: 'rgba(255,255,255,0.82)', fontSize: 14, lineHeight: 20 },
  codeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 6,
    borderRadius: radius.sm,
    backgroundColor: 'rgba(255,255,255,0.13)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
});
