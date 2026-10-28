import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Icon, type IconName } from '@/components/Icon';
import { PageHeader } from '@/components/PageHeader';
import { Button, Card } from '@/components/ui';
import { sessionRoleLabel, useSession } from '@/core/session';
import { usePalette } from '@/theme';

const tiles: { icon: IconName; title: string }[] = [
  { icon: 'notifications-active', title: 'Bildirim tercihleri' },
  { icon: 'favorite-border', title: 'Favori uzman' },
  { icon: 'privacy-tip', title: 'KVKK ve açık rıza' },
  { icon: 'download', title: 'Verilerimi indir' },
];

export default function ProfileTab() {
  const palette = usePalette();
  const session = useSession();
  const name = session.displayName ?? 'Odivon kullanıcısı';
  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: palette.background }}>
      <ScrollView>
        <PageHeader title="Profil ve Gizlilik" subtitle="Hesap, bildirim ve izinler" />
        <View style={styles.body}>
          <Card style={styles.profile}>
            <View style={[styles.avatar, { backgroundColor: palette.primary }]}>
              <Text style={styles.initial}>{(name.trim()[0] ?? 'O').toLocaleUpperCase('tr-TR')}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: palette.text, fontSize: 16, fontWeight: '800' }}>{name}</Text>
              <Text style={{ color: palette.muted }}>{sessionRoleLabel(session)}</Text>
              {session.tenantName ? (
                <Text style={{ color: palette.primary, fontWeight: '700', fontSize: 12, marginTop: 4 }}>
                  {session.tenantName}
                  {session.branchName ? ` · ${session.branchName}` : ''}
                </Text>
              ) : null}
            </View>
          </Card>
          {tiles.map((tile) => (
            <Card key={tile.title} style={styles.tile}>
              <Icon name={tile.icon} color={palette.text} />
              <Text style={{ flex: 1, color: palette.text, fontSize: 16 }}>{tile.title}</Text>
              <Icon name="chevron-right" color={palette.muted} />
            </Card>
          ))}
          <Button label="Güvenli çıkış" icon="logout" variant="outlined" onPress={() => void session.signOut()} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  body: { paddingHorizontal: 20, paddingBottom: 30, gap: 12 },
  profile: { flexDirection: 'row', alignItems: 'center', gap: 16, padding: 20, marginBottom: 4 },
  avatar: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
  initial: { color: '#FFFFFF', fontWeight: '800', fontSize: 20 },
  tile: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingHorizontal: 16, paddingVertical: 16 },
});
