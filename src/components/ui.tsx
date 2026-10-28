import { useState, type ComponentRef, type ReactNode, type Ref } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
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
import { radius, statusColors, usePalette, withAlpha } from '@/theme';

import { Icon, type IconName } from './Icon';

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const palette = usePalette();
  return (
    <View
      style={[
        { backgroundColor: palette.surface, borderColor: palette.border, borderWidth: 1, borderRadius: radius.xl },
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

export function Button({ label, onPress, icon, variant = 'filled', busy, disabled, style }: ButtonProps) {
  const palette = usePalette();
  const inactive = disabled || busy;
  const background =
    variant === 'filled' ? palette.primary : variant === 'light' ? '#FFFFFF' : 'transparent';
  const foreground = variant === 'filled' ? palette.onPrimary : variant === 'light' ? '#4F46E5' : palette.primary;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: inactive, busy }}
      disabled={inactive}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: background,
          borderColor: variant === 'outlined' ? palette.border : 'transparent',
          borderWidth: variant === 'outlined' ? 1 : 0,
          paddingVertical: variant === 'text' ? 10 : 16,
          opacity: inactive ? 0.6 : pressed ? 0.85 : 1,
        },
        style,
      ]}
    >
      {busy ? (
        <ActivityIndicator size="small" color={foreground} />
      ) : icon ? (
        <Icon name={icon} size={20} color={foreground} />
      ) : null}
      <Text style={[styles.buttonLabel, { color: foreground }]}>{label}</Text>
    </Pressable>
  );
}

export function IconButton({
  icon,
  label,
  onPress,
  color,
}: {
  icon: IconName;
  label: string;
  onPress: () => void;
  color?: string;
}) {
  const palette = usePalette();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={8}
      onPress={onPress}
      style={({ pressed }) => [styles.iconButton, { opacity: pressed ? 0.6 : 1 }]}
    >
      <Icon name={icon} color={color ?? palette.text} />
    </Pressable>
  );
}

type FieldProps = TextInputProps & {
  label: string;
  icon?: IconName;
  helper?: string;
  trailing?: ReactNode;
};

export function TextField({ label, icon, helper, trailing, style, multiline, ref, ...props }: FieldProps & { ref?: Ref<ComponentRef<typeof TextInput>> }) {
  const palette = usePalette();
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.fieldWrap}>
      <Text style={[styles.fieldLabel, { color: palette.muted }]}>{label}</Text>
      <View
        style={[
          styles.field,
          {
            backgroundColor: palette.surface,
            borderColor: focused ? palette.primary : palette.border,
            borderWidth: focused ? 1.5 : 1,
            alignItems: multiline ? 'flex-start' : 'center',
          },
        ]}
      >
        {icon ? <Icon name={icon} size={20} color={palette.muted} style={styles.fieldIcon} /> : null}
        <TextInput
          ref={ref}
          accessibilityLabel={label}
          placeholderTextColor={palette.muted}
          multiline={multiline}
          {...props}
          onFocus={(event) => {
            setFocused(true);
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
      <Text style={[styles.fieldLabel, { color: palette.muted }]}>{label}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${selected?.label ?? placeholder}`}
        onPress={() => setOpen(true)}
        style={[styles.field, { backgroundColor: palette.surface, borderColor: palette.border, borderWidth: 1 }]}
      >
        <Text style={[styles.fieldInput, { color: selected ? palette.text : palette.muted }]} numberOfLines={1}>
          {selected?.label ?? placeholder}
        </Text>
        <Icon name="expand-more" color={palette.muted} />
      </Pressable>
      <Modal visible={open} animationType="slide" transparent onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)} accessibilityLabel="Kapat" />
        <SafeAreaView edges={['bottom']} style={[styles.sheet, { backgroundColor: palette.surface }]}>
          <Text style={[styles.sheetTitle, { color: palette.text }]}>{label}</Text>
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
                  <Text style={{ color: palette.text, fontSize: 16 }}>{item.label}</Text>
                  {item.value === value ? <Icon name="check" color={palette.primary} /> : null}
                </Pressable>
              )}
            />
          )}
        </SafeAreaView>
      </Modal>
    </View>
  );
}

export function StatusChip({ status }: { status: string }) {
  const color = statusColors[status] ?? '#D97706';
  return (
    <View style={[styles.chip, { backgroundColor: withAlpha(color, 0.1) }]}>
      <Text style={[styles.chipText, { color }]}>{statusLabels[status] ?? status}</Text>
    </View>
  );
}

export function MetricCard({ label, value, icon, color }: { label: string; value: string; icon: IconName; color: string }) {
  const palette = usePalette();
  return (
    <Card style={styles.metric}>
      <Icon name={icon} size={20} color={color} />
      <View>
        <Text style={[styles.metricValue, { color: palette.text }]}>{value}</Text>
        <Text style={{ color: palette.muted, fontSize: 12 }}>{label}</Text>
      </View>
    </Card>
  );
}

export function InlineError({ message }: { message: string }) {
  const palette = usePalette();
  return (
    <View
      accessibilityRole="alert"
      style={[styles.inlineError, { backgroundColor: palette.errorSoft }]}
    >
      <Icon name="error-outline" size={19} color={palette.error} />
      <Text style={{ flex: 1, color: palette.text, fontSize: 13 }}>{message}</Text>
    </View>
  );
}

export function ErrorCard({ error, onRetry }: { error: unknown; onRetry: () => void }) {
  const palette = usePalette();
  return (
    <Card style={styles.errorCard}>
      <Icon name="cloud-off" color={palette.error} />
      <Text style={{ color: palette.text, textAlign: 'center' }}>
        {error instanceof Error ? error.message : String(error)}
      </Text>
      <Button label="Tekrar dene" variant="text" onPress={onRetry} />
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
      <Icon name={icon} size={48} color={palette.primary} />
      <Text style={[styles.emptyTitle, { color: palette.text }]}>{title}</Text>
      <Text style={{ color: palette.muted, textAlign: 'center' }}>{message}</Text>
      {onAction ? <Button label={actionLabel ?? 'Devam et'} onPress={onAction} style={{ marginTop: 12 }} /> : null}
    </View>
  );
}

export function SectionTitle({ children }: { children: ReactNode }) {
  const palette = usePalette();
  return <Text style={[styles.sectionTitle, { color: palette.text }]}>{children}</Text>;
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 18,
    borderRadius: radius.lg,
  },
  buttonLabel: { fontSize: 15, fontWeight: '600' },
  iconButton: { padding: 8 },
  fieldWrap: { gap: 6 },
  fieldLabel: { fontSize: 13, fontWeight: '600' },
  field: { flexDirection: 'row', borderRadius: radius.md, paddingHorizontal: 14, minHeight: 54 },
  fieldIcon: { marginRight: 10, alignSelf: 'center' },
  fieldInput: { flex: 1, fontSize: 16, paddingVertical: 14, alignSelf: 'center' },
  helper: { fontSize: 12 },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)' },
  sheet: { maxHeight: '70%', borderTopLeftRadius: radius.xxl, borderTopRightRadius: radius.xxl, paddingTop: 12 },
  sheetTitle: { fontSize: 18, fontWeight: '800', paddingHorizontal: 20, paddingVertical: 12 },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  chip: { alignSelf: 'flex-start', paddingHorizontal: 9, paddingVertical: 5, borderRadius: radius.pill },
  chipText: { fontSize: 11, fontWeight: '700' },
  metric: { flex: 1, minHeight: 108, padding: 14, justifyContent: 'space-between' },
  metricValue: { fontSize: 22, fontWeight: '800' },
  inlineError: { flexDirection: 'row', gap: 9, padding: 12, borderRadius: 14 },
  errorCard: { padding: 20, alignItems: 'center', gap: 10 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { fontSize: 20, fontWeight: '800', marginTop: 6 },
  sectionTitle: { fontSize: 16, fontWeight: '800' },
});
