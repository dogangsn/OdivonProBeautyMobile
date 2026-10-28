import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Icon } from '@/components/Icon';
import { PageHeader } from '@/components/PageHeader';
import { Card } from '@/components/ui';
import { managementResources } from '@/core/management';
import { usePalette } from '@/theme';

export default function ManagementTab() {
  const palette = usePalette();
  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: palette.background }}>
      <ScrollView>
        <PageHeader title="Yönetim Merkezi" subtitle="İşletme operasyonlarına hızlı erişim" />
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
                <Card style={[styles.card, { opacity: pressed ? 0.8 : 1 }]}>
                  <Icon name={item.icon} color={palette.primary} />
                  <View>
                    <Text style={{ color: palette.text, fontWeight: '800', fontSize: 16 }}>{item.title}</Text>
                    <Text style={{ color: palette.muted, fontSize: 12, marginTop: 4 }}>Canlı kayıtları aç</Text>
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
  card: { aspectRatio: 1, padding: 18, justifyContent: 'space-between' },
});
