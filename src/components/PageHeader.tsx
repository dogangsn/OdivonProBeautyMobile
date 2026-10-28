import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useSession } from '@/core/session';
import { usePalette } from '@/theme';

import { BrandLogo } from './BrandLogo';
import { IconButton } from './ui';

export function PageHeader({ title, subtitle, trailing }: { title: string; subtitle: string; trailing?: ReactNode }) {
  const palette = usePalette();
  const signOut = useSession((state) => state.signOut);
  return (
    <View style={styles.row}>
      <BrandLogo size={48} />
      <View style={styles.text}>
        <Text accessibilityRole="header" style={[styles.title, { color: palette.text }]} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={{ color: palette.muted, fontSize: 12 }} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {trailing ?? <IconButton icon="logout" label="Çıkış yap" onPress={() => void signOut()} />}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 13, paddingHorizontal: 20, paddingVertical: 18 },
  text: { flex: 1 },
  title: { fontSize: 22, fontWeight: '800' },
});
