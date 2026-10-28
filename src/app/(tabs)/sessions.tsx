import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Icon, type IconName } from '@/components/Icon';
import { PageHeader } from '@/components/PageHeader';
import { Card } from '@/components/ui';
import { usePalette, withAlpha } from '@/theme';

const actions: { icon: IconName; title: string; detail: string; onPress?: () => void }[] = [
  {
    icon: 'play-circle-outline',
    title: 'Sıradaki seansı başlat',
    detail: 'Check-in yapılmış randevudan seans formu açılır',
    onPress: () => router.navigate('/appointments'),
  },
  { icon: 'history', title: 'Seans geçmişi', detail: 'Uygulama parametreleri ve reaksiyon notları' },
  { icon: 'photo-camera', title: 'Öncesi / sonrası medya', detail: 'MainApi imzalı yükleme akışı' },
];

export default function SessionHubTab() {
  const palette = usePalette();
  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: palette.background }}>
      <ScrollView>
        <PageHeader title="Seans Merkezi" subtitle="Uygulama, fotoğraf ve klinik notları" />
        <View style={styles.body}>
          {actions.map((action) => (
            <Pressable
              key={action.title}
              accessibilityRole="button"
              accessibilityState={{ disabled: !action.onPress }}
              disabled={!action.onPress}
              onPress={action.onPress}
            >
              <Card style={styles.card}>
                <View style={[styles.avatar, { backgroundColor: withAlpha(palette.primary, 0.1) }]}>
                  <Icon name={action.icon} color={palette.primary} />
                </View>
                <View style={{ flex: 1, gap: 4 }}>
                  <Text style={{ color: palette.text, fontWeight: '800', fontSize: 16 }}>{action.title}</Text>
                  <Text style={{ color: palette.muted }}>{action.onPress ? action.detail : `${action.detail} · Yakında`}</Text>
                </View>
                <Icon name="chevron-right" color={palette.muted} />
              </Card>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  body: { paddingHorizontal: 20, paddingBottom: 30, gap: 12 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16 },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
});
