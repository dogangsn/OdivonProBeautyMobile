import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { formatCurrency, type BeautyRole } from '@/core/models';
import { useDashboard } from '@/core/queries';
import { sessionRoleLabel, useSession } from '@/core/session';
import { fonts, gradients, radius, type, usePalette } from '@/theme';

import { Icon, type IconName } from './Icon';
import { PageHeader } from './PageHeader';
import { Button, Card, ErrorCard, MetricCard, SectionTitle } from './ui';

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
        <PageHeader title={greeting(session.displayName)} subtitle={subtitle} />
        <View style={styles.body}>
          <HeroPanel role={role} centerCode={session.centerCode} />
          <View style={{ gap: 12 }}>
            <SectionTitle>{customer ? 'Hesap özeti' : 'Bugünün nabzı'}</SectionTitle>
            {dashboard.isError ? (
              <ErrorCard error={dashboard.error} onRetry={() => void dashboard.refetch()} />
            ) : (
              <>
                <View style={styles.row}>
                  <MetricCard
                    label="Randevu"
                    value={dashboard.isPending ? '–' : String(data?.appointments ?? 0)}
                    icon="calendar-month"
                    tone="indigo"
                    hint={customer ? 'Planlanan bakımlar' : 'Kayıtlı randevu'}
                  />
                  <MetricCard
                    label={customer ? 'Aktif paket' : 'Müşteri'}
                    value={dashboard.isPending ? '–' : String(customer ? (data?.packages ?? 0) : (data?.customers ?? 0))}
                    icon={customer ? 'card-membership' : 'groups'}
                    tone="sky"
                    hint={customer ? 'Kullanılabilir' : 'Portföy'}
                  />
                </View>
                <View style={styles.row}>
                  <MetricCard
                    label={customer ? 'Seans' : 'Ciro'}
                    value={
                      dashboard.isPending ? '–' : customer ? String(data?.sessions ?? 0) : formatCurrency(data?.revenue ?? 0)
                    }
                    icon={customer ? 'spa' : 'trending-up'}
                    tone="emerald"
                    hint={customer ? 'Tamamlanan' : 'Tahsilat toplamı'}
                  />
                  <MetricCard
                    label={customer ? 'Profil' : 'Kritik stok'}
                    value={dashboard.isPending ? '–' : customer ? 'Aktif' : String(data?.criticalStock ?? 0)}
                    icon={customer ? 'verified-user' : 'inventory-2'}
                    tone={!customer && (data?.criticalStock ?? 0) > 0 ? 'rose' : 'amber'}
                    hint={customer ? 'Doğrulandı' : 'Eşik altı ürün'}
                  />
                </View>
              </>
            )}
          </View>
          <QuickActions customer={customer} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function greeting(name?: string) {
  const hour = new Date().getHours();
  const hello = hour < 12 ? 'Günaydın' : hour < 18 ? 'İyi günler' : 'İyi akşamlar';
  const first = name?.trim().split(/\s+/)[0];
  return first ? `${hello}, ${first}` : hello;
}

function QuickActions({ customer }: { customer: boolean }) {
  const palette = usePalette();
  const actions: { icon: IconName; title: string; onPress: () => void }[] = customer
    ? [
        { icon: 'event', title: 'Randevularım', onPress: () => router.navigate('/appointments') },
        { icon: 'card-membership', title: 'Paketlerim', onPress: () => router.navigate('/packages') },
      ]
    : [
        { icon: 'today', title: 'Bugünün akışı', onPress: () => router.navigate('/appointments') },
        { icon: 'payments', title: 'Finans', onPress: () => router.navigate('/finance') },
        { icon: 'apps', title: 'Yönetim', onPress: () => router.navigate('/management') },
      ];
  return (
    <View style={{ gap: 12 }}>
      <SectionTitle>Hızlı erişim</SectionTitle>
      <Card style={{ overflow: 'hidden' }}>
        {actions.map((action, index) => (
          <Pressable
            key={action.title}
            accessibilityRole="button"
            onPress={action.onPress}
            style={({ pressed }) => [
              styles.action,
              {
                borderTopWidth: index === 0 ? 0 : 1,
                borderTopColor: palette.divider,
                backgroundColor: pressed ? palette.surfaceSoft : 'transparent',
              },
            ]}
          >
            <View style={[styles.actionIcon, { backgroundColor: palette.primarySoft }]}>
              <Icon name={action.icon} size={20} color={palette.primary} />
            </View>
            <Text style={[type.bodyStrong, { color: palette.text, flex: 1 }]}>{action.title}</Text>
            <Icon name="chevron-right" color={palette.muted} />
          </Pressable>
        ))}
      </Card>
    </View>
  );
}

function HeroPanel({ role, centerCode }: { role: BeautyRole; centerCode?: string }) {
  const customer = role === 'customer';
  return (
    <LinearGradient colors={gradients.hero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
      <View style={styles.heroBadge}>
        <Icon name="auto-awesome" size={16} color="#FFFFFF" />
        <Text style={styles.heroBadgeText}>{customer ? 'Bakım planı' : 'Operasyon merkezi'}</Text>
      </View>
      <Text style={styles.heroTitle}>{customer ? 'Bakım yolculuğunuzu planlayın' : 'Merkeziniz bugüne hazır'}</Text>
      <Text style={styles.heroText}>
        {customer
          ? 'Müsait saatleri görün, paketinizi takip edin ve randevunuzu yönetin.'
          : 'Randevu, kasa, ekip ve stok sinyalleri tek mobil görünümde.'}
      </Text>
      {!customer && centerCode ? (
        <View accessible accessibilityLabel={`Müşteri mobil erişim kodu ${centerCode}`} style={styles.codeBadge}>
          <Icon name="key" size={16} color="#FFFFFF" />
          <Text style={styles.codeText}>Müşteri mobil kodu: {centerCode}</Text>
        </View>
      ) : null}
      <Button
        label={customer ? 'Randevu al' : 'Randevu oluştur'}
        icon="add"
        variant="light"
        onPress={() => router.push('/booking')}
        style={{ alignSelf: 'flex-start', marginTop: 8 }}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  body: { paddingHorizontal: 20, paddingBottom: 32, gap: 22 },
  row: { flexDirection: 'row', gap: 12 },
  hero: { borderRadius: radius.xxl, padding: 22, gap: 8 },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  heroBadgeText: { color: '#FFFFFF', fontFamily: fonts.bold, fontSize: 11, letterSpacing: 0.6, textTransform: 'uppercase' },
  heroTitle: { color: '#FFFFFF', fontFamily: fonts.extrabold, fontSize: 24, letterSpacing: -0.4, marginTop: 6 },
  heroText: { color: 'rgba(255,255,255,0.85)', fontFamily: fonts.medium, fontSize: 14, lineHeight: 20 },
  codeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 4,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
  },
  codeText: { color: '#FFFFFF', fontFamily: fonts.bold, fontSize: 13 },
  action: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 14 },
  actionIcon: { width: 36, height: 36, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
});
