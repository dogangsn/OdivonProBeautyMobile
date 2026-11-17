import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useSession } from '@/core/session';
import { type, usePalette } from '@/theme';

import { BrandLogo } from './BrandLogo';
import { IconButton } from './ui';

export function PageHeader({ title, subtitle, trailing }: { title: string; subtitle: string; trailing?: ReactNode }) {
  const palette = usePalette();
  const signOut = useSession((state) => state.signOut);
  return (
    <View style={styles.row}>
      <View style={[styles.logo, { backgroundColor: palette.surface, borderColor: palette.border }]}>
        <BrandLogo size={34} />
      </View>
      <View style={styles.text}>
        <Text accessibilityRole="header" style={[type.title, { color: palette.text }]} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={[type.caption, { color: palette.muted, marginTop: 1 }]} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {trailing ?? <IconButton icon="logout" label="Çıkış yap" onPress={() => void signOut()} color={palette.muted} />}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingTop: 14, paddingBottom: 16 },
  logo: { width: 46, height: 46, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  text: { flex: 1 },
});
