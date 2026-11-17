import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Icon } from '@/components/Icon';
import { PageHeader } from '@/components/PageHeader';
import { Card } from '@/components/ui';
import { managementResources } from '@/core/management';
import { radius, type, usePalette, useTones } from '@/theme';

export default function ManagementTab() {
  const palette = usePalette();
  const tones = useTones();
  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: palette.background }}>
      <ScrollView>
        <PageHeader title="Yönetim Merkezi" subtitle="İşletme kayıtlarına hızlı erişim" />
        <View style={styles.grid}>
          {managementResources.map((item) => (
            <Pressable
              key={item.resource}
              accessibilityRole="button"
              accessibilityLabel={`${item.title} kayıtlarını aç`}
              style={styles.cell}
              onPress={() => router.push({ pathname: '/records/[resource]', params: { resource: item.resource } })}
            >
              {({ pressed }) => (
                <Card style={[styles.card, { opacity: pressed ? 0.85 : 1 }]}>
                  <View style={[styles.icon, { backgroundColor: tones[item.tone].bg }]}>
                    <Icon name={item.icon} size={22} color={tones[item.tone].fg} />
                  </View>
                  <View>
                    <Text style={[type.bodyStrong, { color: palette.text, fontSize: 16 }]}>{item.title}</Text>
                    <Text style={[type.caption, { color: palette.muted, marginTop: 3 }]}>{item.detail}</Text>
                  </View>
                </Card>
              )}
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 20, paddingBottom: 30, gap: 12 },
  cell: { width: '47%', flexGrow: 1 },
  card: { minHeight: 132, padding: 16, justifyContent: 'space-between' },
  icon: { width: 44, height: 44, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
});
