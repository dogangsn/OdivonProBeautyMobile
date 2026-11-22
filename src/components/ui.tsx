import { LinearGradient } from 'expo-linear-gradient';
import { useState, type ComponentRef, type ReactNode, type Ref } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { statusLabels } from '@/core/models';
import {
  cardShadow,
  fonts,
  gradients,
  radius,
  statusTones,
  type,
  usePalette,
  useTones,
  type Tone,
} from '@/theme';

import { Icon, type IconName } from './Icon';
import { useRevealFocusedInput } from './KeyboardScroll';

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const palette = usePalette();
  return (
    <View
      style={[
        {
          backgroundColor: palette.surface,
          borderColor: palette.border,
          borderWidth: StyleSheet.hairlineWidth * 2,
          borderRadius: radius.lg,
        },
        cardShadow(palette),
        style,
      ]}
    >
      {children}
    </View>
  );
}

type ButtonProps = {
  label: string;
  onPress?: () => void;
  icon?: IconName;
  variant?: 'filled' | 'outlined' | 'text' | 'light';
  busy?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** Filled buttons use the web's indigo → purple gradient; others are flat. */
export function Button({ label, onPress, icon, variant = 'filled', busy, disabled, style }: ButtonProps) {
  const palette = usePalette();
  const inactive = disabled || busy;
  const foreground =
    variant === 'filled' ? palette.onPrimary : variant === 'light' ? '#4F46E5' : variant === 'outlined' ? palette.text : palette.primary;
  const content = (
    <>
      {busy ? (
        <ActivityIndicator size="small" color={foreground} />
      ) : icon ? (
        <Icon name={icon} size={19} color={variant === 'outlined' ? palette.primary : foreground} />
      ) : null}
      <Text style={[styles.buttonLabel, { color: foreground }]}>{label}</Text>
    </>
  );
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: inactive, busy }}
      disabled={inactive}
      onPress={onPress}
      style={({ pressed }) => [
        { borderRadius: radius.md, opacity: inactive ? 0.55 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] },
        variant === 'filled' && !palette.dark ? styles.filledShadow : null,
        style,
      ]}
    >
      {variant === 'filled' ? (
        <LinearGradient colors={gradients.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.button}>
          {content}
        </LinearGradient>
      ) : (
        <View
          style={[
            styles.button,
            {
              backgroundColor: variant === 'light' ? '#FFFFFF' : variant === 'outlined' ? palette.surface : 'transparent',
              borderColor: variant === 'outlined' ? palette.border : 'transparent',
              borderWidth: variant === 'outlined' ? 1 : 0,
              paddingVertical: variant === 'text' ? 10 : 14,
            },
          ]}
        >
          {content}
        </View>
      )}
    </Pressable>
  );
}

export function IconButton({
  icon,
  label,
  onPress,
  color,
  tinted,
}: {
  icon: IconName;
  label: string;
  onPress: () => void;
  color?: string;
  /** Draws the rounded-xl soft square used for toolbar actions on the web. */
  tinted?: boolean;
}) {
  const palette = usePalette();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={8}
      onPress={onPress}
      style={({ pressed }) => [
        styles.iconButton,
        tinted ? { backgroundColor: palette.primarySoft, borderRadius: radius.md } : null,
        { opacity: pressed ? 0.6 : 1 },
      ]}
    >
      <Icon name={icon} color={color ?? (tinted ? palette.primary : palette.text)} />
    </Pressable>
  );
}

type FieldProps = TextInputProps & {
  label: string;
  icon?: IconName;
  helper?: string;
  trailing?: ReactNode;
};

export function TextField({
  label,
  icon,
  helper,
  trailing,
  style,
  multiline,
  ref,
  ...props
}: FieldProps & { ref?: Ref<ComponentRef<typeof TextInput>> }) {
  const palette = usePalette();
  const reveal = useRevealFocusedInput();
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.fieldWrap}>
      <Text style={[type.overline, { color: palette.muted }]}>{label}</Text>
      <View
        style={[
          styles.field,
          {
            backgroundColor: focused ? palette.surface : palette.surfaceSoft,
            borderColor: focused ? palette.primary : palette.border,
            borderWidth: focused ? 1.5 : 1,
            alignItems: multiline ? 'flex-start' : 'center',
          },
        ]}
      >
        {icon ? <Icon name={icon} size={20} color={focused ? palette.primary : palette.muted} style={styles.fieldIcon} /> : null}
        <TextInput
          ref={ref}
          accessibilityLabel={label}
          placeholderTextColor={palette.muted}
          multiline={multiline}
          {...props}
          onFocus={(event) => {
            setFocused(true);
            reveal();
            props.onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            props.onBlur?.(event);
          }}
          style={[
            styles.fieldInput,
            { color: palette.text, minHeight: multiline ? 84 : undefined, textAlignVertical: multiline ? 'top' : 'center' },
            style,
          ]}
        />
        {trailing}
      </View>
      {helper ? <Text style={[styles.helper, { color: palette.muted }]}>{helper}</Text> : null}
    </View>
  );
}

/** Live search input from the web filter toolbar. */
export function SearchBar({
  value,
  onChangeText,
  placeholder = 'Ara (isim, telefon, durum)...',
}: {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
}) {
  const palette = usePalette();
  return (
    <View style={[styles.search, { backgroundColor: palette.surface, borderColor: palette.border }]}>
      <Icon name="search" size={20} color={palette.muted} />
      <TextInput
        accessibilityLabel="Ara"
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={palette.muted}
        returnKeyType="search"
        autoCorrect={false}
        style={[styles.searchInput, { color: palette.text }]}
      />
      {value ? <IconButton icon="close" label="Aramayı temizle" onPress={() => onChangeText('')} color={palette.muted} /> : null}
    </View>
  );
}

/** Segmented filter chips (Bugün / Yaklaşan / Tümü). */
export function FilterChips<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: string; count?: number }[];
  onChange: (value: T) => void;
}) {
  const palette = usePalette();
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(option.value)}
            style={[
              styles.filterChip,
              {
                backgroundColor: active ? palette.primaryStrong : palette.surface,
                borderColor: active ? palette.primaryStrong : palette.border,
              },
            ]}
          >
            <Text style={[styles.filterLabel, { color: active ? '#FFFFFF' : palette.text }]}>
              {option.label}
              {option.count !== undefined ? ` · ${option.count}` : ''}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

export type SelectOption = { value: string; label: string };

export function SelectField({
  label,
  value,
  options,
  onChange,
  placeholder = 'Seçin',
}: {
  label: string;
  value?: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  const palette = usePalette();
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value);
  return (
    <View style={styles.fieldWrap}>
      <Text style={[type.overline, { color: palette.muted }]}>{label}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${selected?.label ?? placeholder}`}
        onPress={() => setOpen(true)}
        style={[styles.field, { backgroundColor: palette.surfaceSoft, borderColor: palette.border, borderWidth: 1 }]}
      >
        <Text style={[styles.fieldInput, { color: selected ? palette.text : palette.muted }]} numberOfLines={1}>
          {selected?.label ?? placeholder}
        </Text>
        <Icon name="expand-more" color={palette.muted} />
      </Pressable>
      <Sheet visible={open} title={label} onClose={() => setOpen(false)}>
        {options.length === 0 ? (
          <Text style={[styles.helper, { color: palette.muted, padding: 20 }]}>Seçilebilecek kayıt yok.</Text>
        ) : (
          <FlatList
            data={options}
            keyExtractor={(item) => item.value}
            renderItem={({ item }) => (
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  onChange(item.value);
                  setOpen(false);
                }}
                style={({ pressed }) => [
                  styles.option,
                  { backgroundColor: pressed || item.value === value ? palette.primarySoft : 'transparent' },
                ]}
              >
                <Text style={[type.body, { color: palette.text }]}>{item.label}</Text>
                {item.value === value ? <Icon name="check" color={palette.primary} /> : null}
              </Pressable>
            )}
          />
        )}
      </Sheet>
    </View>
  );
}

/** Bottom sheet: the mobile counterpart of the web's slide-over drawer. */
export function Sheet({
  visible,
  title,
  subtitle,
  onClose,
  children,
  footer,
}: {
  visible: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const palette = usePalette();
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={[styles.backdrop, { backgroundColor: palette.backdrop }]} onPress={onClose} accessibilityLabel="Kapat" />
      <SafeAreaView edges={['bottom']} style={[styles.sheet, { backgroundColor: palette.surface, borderColor: palette.border }]}>
        <View style={[styles.grabber, { backgroundColor: palette.border }]} />
        <View style={[styles.sheetHeader, { borderBottomColor: palette.border }]}>
          <View style={{ flex: 1 }}>
            <Text style={[type.section, { color: palette.text }]} numberOfLines={1}>
              {title}
            </Text>
            {subtitle ? <Text style={[type.caption, { color: palette.muted, marginTop: 2 }]}>{subtitle}</Text> : null}
          </View>
          <IconButton icon="close" label="Kapat" onPress={onClose} color={palette.muted} />
        </View>
        {children}
        {footer ? <View style={[styles.sheetFooter, { borderTopColor: palette.border }]}>{footer}</View> : null}
      </SafeAreaView>
    </Modal>
  );
}

export function Badge({ label, tone = 'slate', dot }: { label: string; tone?: Tone; dot?: boolean }) {
  const tones = useTones();
  const colors = tones[tone];
  return (
    <View style={[styles.chip, { backgroundColor: colors.bg, borderColor: colors.border }]}>
      {dot ? <View style={[styles.dot, { backgroundColor: colors.fg }]} /> : null}
      <Text style={[styles.chipText, { color: colors.fg }]}>{label}</Text>
    </View>
  );
}

export function StatusChip({ status }: { status: string }) {
  return <Badge label={statusLabels[status] ?? status} tone={statusTones[status] ?? 'amber'} dot />;
}

/** Executive KPI card from the web dashboard: overline label, tone icon badge, big number. */
export function MetricCard({
  label,
  value,
  icon,
  tone,
  hint,
}: {
  label: string;
  value: string;
  icon: IconName;
  tone: Tone;
  hint?: string;
}) {
  const palette = usePalette();
  const colors = useTones()[tone];
  return (
    <Card style={styles.metric}>
      <View style={styles.metricHead}>
        <Text style={[type.overline, { color: palette.muted, flex: 1 }]} numberOfLines={1}>
          {label}
        </Text>
        <View style={[styles.metricIcon, { backgroundColor: colors.bg }]}>
          <Icon name={icon} size={19} color={colors.fg} />
        </View>
      </View>
      <View>
        <Text
          style={[type.kpi, { color: palette.text }, value.length > 7 ? { fontSize: 23, lineHeight: 28 } : null]}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {value}
        </Text>
        {hint ? <Text style={[type.caption, { color: colors.fg, marginTop: 4 }]}>{hint}</Text> : null}
      </View>
    </Card>
  );
}

export function InlineError({ message }: { message: string }) {
  const tones = useTones();
  const palette = usePalette();
  return (
    <View
      accessibilityRole="alert"
      style={[styles.inlineError, { backgroundColor: tones.rose.bg, borderColor: tones.rose.border }]}
    >
      <Icon name="error-outline" size={19} color={tones.rose.fg} />
      <Text style={[type.body, { flex: 1, color: palette.text, fontSize: 13, lineHeight: 18 }]}>{message}</Text>
    </View>
  );
}

export function ErrorCard({ error, onRetry }: { error: unknown; onRetry: () => void }) {
  const palette = usePalette();
  const tones = useTones();
  return (
    <Card style={styles.errorCard}>
      <View style={[styles.metricIcon, { backgroundColor: tones.rose.bg, width: 48, height: 48 }]}>
        <Icon name="cloud-off" color={tones.rose.fg} />
      </View>
      <Text style={[type.body, { color: palette.text, textAlign: 'center' }]}>
        {error instanceof Error ? error.message : String(error)}
      </Text>
      <Button label="Tekrar dene" icon="refresh" variant="outlined" onPress={onRetry} />
    </Card>
  );
}

export function Loading() {
  const palette = usePalette();
  return (
    <View style={styles.center}>
      <ActivityIndicator color={palette.primary} />
    </View>
  );
}

export function EmptyState({
  icon,
  title,
  message,
  actionLabel,
  onAction,
}: {
  icon: IconName;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  const palette = usePalette();
  return (
    <View style={[styles.center, { padding: 28, gap: 8 }]}>
      <View style={[styles.emptyIcon, { backgroundColor: palette.primarySoft }]}>
        <Icon name={icon} size={32} color={palette.primary} />
      </View>
      <Text style={[type.section, { color: palette.text, marginTop: 6 }]}>{title}</Text>
      <Text style={[type.body, { color: palette.muted, textAlign: 'center' }]}>{message}</Text>
      {onAction ? (
        <Button label={actionLabel ?? 'Devam et'} icon="add" onPress={onAction} style={{ marginTop: 12 }} />
      ) : null}
    </View>
  );
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  const palette = usePalette();
  return (
    <View style={styles.sectionRow}>
      <Text accessibilityRole="header" style={[type.section, { color: palette.text, flex: 1 }]}>
        {children}
      </Text>
      {action}
    </View>
  );
}

/** Label / value row used in detail sheets. */
export function DetailRow({ label, value }: { label: string; value: string }) {
  const palette = usePalette();
  return (
    <View style={[styles.detailRow, { borderBottomColor: palette.divider }]}>
      <Text style={[type.caption, { color: palette.muted, flex: 1 }]}>{label}</Text>
      <Text style={[type.bodyStrong, { color: palette.text, flex: 1.4, textAlign: 'right', fontSize: 14 }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: radius.md,
  },
  filledShadow: {
    shadowColor: '#6366F1',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  buttonLabel: { fontFamily: fonts.bold, fontSize: 15 },
  iconButton: { padding: 8 },
  fieldWrap: { gap: 6 },
  field: { flexDirection: 'row', borderRadius: radius.md, paddingHorizontal: 14, minHeight: 52 },
  fieldIcon: { marginRight: 10, alignSelf: 'center' },
  fieldInput: { flex: 1, fontFamily: fonts.medium, fontSize: 15, paddingVertical: 13, alignSelf: 'center' },
  helper: { fontFamily: fonts.medium, fontSize: 12 },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingLeft: 14,
    paddingRight: 4,
    minHeight: 48,
  },
  searchInput: { flex: 1, fontFamily: fonts.medium, fontSize: 14, paddingVertical: 10 },
  filterChip: { borderWidth: 1, borderRadius: radius.pill, paddingHorizontal: 14, paddingVertical: 8 },
  filterLabel: { fontFamily: fonts.bold, fontSize: 13 },
  backdrop: { flex: 1 },
  sheet: {
    maxHeight: '80%',
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    borderWidth: 1,
    borderBottomWidth: 0,
  },
  grabber: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, marginTop: 10 },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  sheetFooter: { padding: 16, borderTopWidth: 1, flexDirection: 'row', gap: 10, justifyContent: 'flex-end' },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  chipText: { fontFamily: fonts.bold, fontSize: 11, letterSpacing: 0.3 },
  metric: { flex: 1, minHeight: 124, padding: 16, justifyContent: 'space-between', gap: 14 },
  metricHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  metricIcon: { width: 38, height: 38, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  inlineError: { flexDirection: 'row', gap: 9, padding: 12, borderRadius: radius.md, borderWidth: 1 },
  errorCard: { padding: 20, alignItems: 'center', gap: 12 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyIcon: { width: 68, height: 68, borderRadius: radius.xl, alignItems: 'center', justifyContent: 'center' },
  sectionRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1 },
});
