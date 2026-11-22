import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState, type ComponentRef } from 'react';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type TextInput,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { BrandLogo } from '@/components/BrandLogo';
import { Icon, type IconName } from '@/components/Icon';
import { Button, IconButton, InlineError, TextField } from '@/components/ui';
import { authErrorMessage, getAuthGateway, type PhoneConfirmation } from '@/core/auth';
import { useSession } from '@/core/session';
import { fonts, usePalette } from '@/theme';

type Mode = 'customer' | 'team';

const HIGHLIGHTS: { icon: IconName; label: string }[] = [
  { icon: 'event-available', label: 'Randevular' },
  { icon: 'card-giftcard', label: 'Paket & seans' },
  { icon: 'insights', label: 'Raporlar' },
];

/** Tracks the software keyboard so the form can make room for it (Android runs edge-to-edge and never resizes). */
function useKeyboardVisible() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const show = Keyboard.addListener(showEvent, () => setVisible(true));
    const hide = Keyboard.addListener(hideEvent, () => setVisible(false));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);
  return visible;
}

export default function SignInScreen() {
  const palette = usePalette();
  const insets = useSafeAreaInsets();
  const sessionError = useSession((state) => state.error);
  const setSessionError = useSession((state) => state.setError);
  const setPendingCenterCode = useSession((state) => state.setPendingCenterCode);

  const [mode, setMode] = useState<Mode>('customer');
  const [phone, setPhone] = useState('+90');
  const [centerCode, setCenterCode] = useState('');
  const [code, setCode] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [hidePassword, setHidePassword] = useState(true);
  const [confirmation, setConfirmation] = useState<PhoneConfirmation>();
  const [localError, setLocalError] = useState<string>();
  const [busy, setBusy] = useState(false);
  const passwordRef = useRef<ComponentRef<typeof TextInput>>(null);
  const scrollRef = useRef<ComponentRef<typeof ScrollView>>(null);
  const keyboardVisible = useKeyboardVisible();

  // Keep the form (fields + submit button) above the keyboard whenever it opens.
  useEffect(() => {
    if (!keyboardVisible) return;
    const timer = setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 60);
    return () => clearTimeout(timer);
  }, [keyboardVisible]);

  const error = localError ?? sessionError;

  const showError = (message: string) => {
    setLocalError(message);
  };

  const gatewayOrError = () => {
    const gateway = getAuthGateway();
    if (!gateway) showError('Firebase mobil yapılandırması etkin değil.');
    return gateway;
  };

  /** Runs a sign-in step; the session store finishes the MainApi handshake once Firebase reports the user. */
  const run = async (operation: () => Promise<void>) => {
    setBusy(true);
    setLocalError(undefined);
    setSessionError(undefined);
    try {
      await operation();
    } catch (err) {
      showError(authErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const teamSignIn = () => {
    const gateway = gatewayOrError();
    if (!gateway) return;
    if (!email.trim() || !password) {
      showError('E-posta ve şifre alanlarını doldurun.');
      return;
    }
    setPendingCenterCode(undefined);
    void run(() => gateway.signInWithEmail(email.trim(), password));
  };

  const resetPassword = () => {
    const gateway = gatewayOrError();
    if (!gateway) return;
    if (!email.trim()) {
      showError('Önce e-posta adresinizi yazın.');
      return;
    }
    void run(async () => {
      await gateway.sendPasswordReset(email.trim());
      Alert.alert('Şifre yenileme', 'Şifre yenileme bağlantısı gönderildi.');
    });
  };

  const sendCode = () => {
    const gateway = gatewayOrError();
    if (!gateway) return;
    if (centerCode.trim().length < 5) {
      showError('Güzellik merkezinizin mobil erişim kodunu girin.');
      return;
    }
    const number = phone.trim();
    if (!number.startsWith('+') || number.length < 10) {
      showError('Telefonu ülke koduyla birlikte girin. Örnek: +905xxxxxxxxx');
      return;
    }
    // Android may verify the SMS automatically; the session store links the centre code either way.
    setPendingCenterCode(centerCode);
    void run(async () => {
      setConfirmation(await gateway.startPhoneSignIn(number));
    });
  };

  const verifyCode = () => {
    if (!confirmation || code.trim().length !== 6) {
      showError('6 haneli SMS kodunu girin.');
      return;
    }
    setPendingCenterCode(centerCode);
    void run(() => confirmation.confirm(code.trim()));
  };

  const changeMode = (next: Mode) => {
    setMode(next);
    setLocalError(undefined);
    setSessionError(undefined);
    setConfirmation(undefined);
    setCode('');
  };

  const resetPhone = () => {
    setConfirmation(undefined);
    setLocalError(undefined);
    setCode('');
  };

  const customer = mode === 'customer';
  const submit = customer ? (confirmation ? verifyCode : sendCode) : teamSignIn;
  const submitLabel = !customer ? 'Giriş yap' : confirmation ? 'Kodu doğrula' : 'SMS kodu gönder';

  return (
    <View style={{ flex: 1, backgroundColor: palette.surface }}>
      <StatusBar style="light" />
      <LinearGradient
        colors={['#1E1B4B', '#3730A3', '#6D28D9']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.orb, { top: -120, right: -90, width: 300, height: 300, backgroundColor: 'rgba(217,70,239,0.28)' }]} />
      <View style={[styles.orb, { top: 160, left: -140, width: 280, height: 280, backgroundColor: 'rgba(99,102,241,0.35)' }]} />

      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
          <ScrollView
            ref={scrollRef}
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            <View style={[styles.hero, keyboardVisible && styles.heroCompact]}>
              <View style={styles.brandRow}>
                <View style={styles.logoBadge}>
                  <BrandLogo size={keyboardVisible ? 30 : 38} />
                </View>
                <View>
                  <Text style={styles.brandName}>OdivonPro</Text>
                  <Text style={styles.brandTag}>BEAUTY CENTER</Text>
                </View>
              </View>

              {keyboardVisible ? null : (
                <>
                  <Text style={styles.headline}>Tekrar hoş geldiniz</Text>
                  <Text style={styles.lead}>Merkeziniz, randevularınız ve bakım yolculuğunuz tek uygulamada.</Text>
                  <View style={styles.chips}>
                    {HIGHLIGHTS.map((item) => (
                      <View key={item.label} style={styles.chip}>
                        <Icon name={item.icon} size={14} color="#E0E7FF" />
                        <Text style={styles.chipText}>{item.label}</Text>
                      </View>
                    ))}
                  </View>
                </>
              )}
            </View>

            <View
              style={[
                styles.sheet,
                { backgroundColor: palette.surface, paddingBottom: Math.max(insets.bottom, 16) + 16 },
              ]}
            >
              <View style={[styles.handle, { backgroundColor: palette.border }]} />

              <View style={[styles.segment, { backgroundColor: palette.surfaceSoft }]} accessibilityRole="tablist">
                <Segment label="Müşteri" icon="spa" active={customer} disabled={busy} onPress={() => changeMode('customer')} />
                <Segment
                  label="Ekip / Yönetici"
                  icon="badge"
                  active={!customer}
                  disabled={busy}
                  onPress={() => changeMode('team')}
                />
              </View>

              <View style={{ gap: 4 }}>
                <Text style={[styles.sheetTitle, { color: palette.text }]}>
                  {customer ? (confirmation ? 'Kodu doğrulayın' : 'Müşteri girişi') : 'Ekip girişi'}
                </Text>
                <Text style={[styles.sheetLead, { color: palette.muted }]}>
                  {customer
                    ? confirmation
                      ? `${phone} numarasına gönderilen 6 haneli kodu girin.`
                      : 'Merkez kodunuz ve kayıtlı telefon numaranızla devam edin.'
                    : 'Merkez yöneticinizin tanımladığı hesapla giriş yapın.'}
                </Text>
              </View>

              {customer ? (
                confirmation ? (
                  <TextField
                    label="SMS doğrulama kodu"
                    icon="password"
                    keyboardType="number-pad"
                    textContentType="oneTimeCode"
                    autoComplete="sms-otp"
                    maxLength={6}
                    value={code}
                    onChangeText={setCode}
                    onSubmitEditing={busy ? undefined : submit}
                    style={styles.otp}
                  />
                ) : (
                  <>
                    <TextField
                      label="Merkez kodu"
                      icon="storefront"
                      placeholder="BY-XXXXXX"
                      autoCapitalize="characters"
                      autoCorrect={false}
                      returnKeyType="next"
                      value={centerCode}
                      onChangeText={setCenterCode}
                    />
                    <TextField
                      label="Telefon numarası"
                      icon="phone-iphone"
                      placeholder="+905xxxxxxxxx"
                      keyboardType="phone-pad"
                      textContentType="telephoneNumber"
                      autoComplete="tel"
                      returnKeyType="done"
                      value={phone}
                      onChangeText={setPhone}
                      onSubmitEditing={busy ? undefined : submit}
                    />
                  </>
                )
              ) : (
                <>
                  <TextField
                    label="E-posta adresi"
                    icon="alternate-email"
                    placeholder="ornek@merkez.com"
                    keyboardType="email-address"
                    textContentType="username"
                    autoComplete="email"
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="next"
                    value={email}
                    onChangeText={setEmail}
                    onSubmitEditing={() => passwordRef.current?.focus()}
                  />
                  <TextField
                    ref={passwordRef}
                    label="Şifre"
                    icon="lock-outline"
                    placeholder="••••••••"
                    secureTextEntry={hidePassword}
                    textContentType="password"
                    autoComplete="password"
                    autoCapitalize="none"
                    returnKeyType="done"
                    value={password}
                    onChangeText={setPassword}
                    onSubmitEditing={busy ? undefined : submit}
                    trailing={
                      <IconButton
                        icon={hidePassword ? 'visibility' : 'visibility-off'}
                        label={hidePassword ? 'Şifreyi göster' : 'Şifreyi gizle'}
                        color={palette.muted}
                        onPress={() => setHidePassword((value) => !value)}
                      />
                    }
                  />
                  <Pressable
                    accessibilityRole="button"
                    disabled={busy}
                    onPress={resetPassword}
                    hitSlop={8}
                    style={{ alignSelf: 'flex-end', marginTop: -6 }}
                  >
                    <Text style={[styles.link, { color: palette.primary }]}>Şifremi unuttum</Text>
                  </Pressable>
                </>
              )}

              {error ? <InlineError message={error} /> : null}

              <PrimaryAction label={submitLabel} busy={busy} onPress={submit} />
              {customer && confirmation ? (
                <Button label="Telefon numarasını değiştir" variant="text" disabled={busy} onPress={resetPhone} />
              ) : null}

              <View style={styles.trust}>
                <Icon name="verified-user" size={16} color={palette.muted} />
                <Text style={[styles.trustText, { color: palette.muted }]}>Bağlantınız uçtan uca şifrelenir.</Text>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

function PrimaryAction({ label, busy, onPress }: { label: string; busy: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ busy, disabled: busy }}
      disabled={busy}
      onPress={onPress}
      style={({ pressed }) => [styles.primaryShadow, { opacity: busy ? 0.75 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] }]}
    >
      <LinearGradient colors={['#6366F1', '#8B5CF6']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.primary}>
        {busy ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <>
            <Text style={styles.primaryText}>{label}</Text>
            <Icon name="arrow-forward" size={20} color="#FFFFFF" />
          </>
        )}
      </LinearGradient>
    </Pressable>
  );
}

function Segment({
  label,
  icon,
  active,
  disabled,
  onPress,
}: {
  label: string;
  icon: IconName;
  active: boolean;
  disabled: boolean;
  onPress: () => void;
}) {
  const palette = usePalette();
  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected: active, disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.segmentItem,
        active && [styles.segmentActive, { backgroundColor: palette.dark ? palette.border : '#FFFFFF' }],
      ]}
    >
      <Icon name={icon} size={18} color={active ? palette.primary : palette.muted} />
      <Text style={{ color: active ? palette.text : palette.muted, fontFamily: fonts.semibold, fontSize: 14 }}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  orb: { position: 'absolute', borderRadius: 999 },
  hero: { flexGrow: 1, justifyContent: 'flex-end', paddingHorizontal: 24, paddingTop: 20, paddingBottom: 28, gap: 12 },
  heroCompact: { flexGrow: 0, paddingTop: 12, paddingBottom: 16 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 'auto' },
  logoBadge: {
    padding: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
  },
  brandName: { color: '#FFFFFF', fontFamily: fonts.extrabold, fontSize: 18, letterSpacing: -0.3 },
  brandTag: { color: '#C7D2FE', fontFamily: fonts.bold, fontSize: 10, letterSpacing: 2 },
  headline: { color: '#FFFFFF', fontFamily: fonts.extrabold, fontSize: 32, lineHeight: 38, letterSpacing: -1, marginTop: 36 },
  lead: { color: 'rgba(255,255,255,0.75)', fontFamily: fonts.medium, fontSize: 15, lineHeight: 22 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 6 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  chipText: { color: '#E0E7FF', fontFamily: fonts.semibold, fontSize: 12 },
  sheet: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 12,
    gap: 18,
    shadowColor: '#0F172A',
    shadowOpacity: 0.18,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: -6 },
    elevation: 16,
  },
  handle: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, marginBottom: 2 },
  segment: { flexDirection: 'row', borderRadius: 16, padding: 4 },
  segmentItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 11,
    borderRadius: 12,
  },
  segmentActive: {
    shadowColor: '#0F172A',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  sheetTitle: { fontFamily: fonts.extrabold, fontSize: 24, letterSpacing: -0.6 },
  sheetLead: { fontFamily: fonts.medium, fontSize: 14, lineHeight: 20 },
  otp: { fontFamily: fonts.bold, fontSize: 22, letterSpacing: 8 },
  link: { fontFamily: fonts.semibold, fontSize: 13 },
  primaryShadow: {
    borderRadius: 16,
    shadowColor: '#6366F1',
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  primary: {
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryText: { color: '#FFFFFF', fontFamily: fonts.bold, fontSize: 16 },
  trust: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  trustText: { fontFamily: fonts.medium, fontSize: 12 },
});
