import { LinearGradient } from 'expo-linear-gradient';
import { useRef, useState, type ComponentRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Alert, Pressable, StyleSheet, Text, View, type TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BrandLogo } from '@/components/BrandLogo';
import { Icon, type IconName } from '@/components/Icon';
import { KeyboardScroll } from '@/components/KeyboardScroll';
import { Button, IconButton, InlineError, TextField } from '@/components/ui';
import { authErrorMessage, getAuthGateway, type PhoneConfirmation } from '@/core/auth';
import { useSession } from '@/core/session';
import { fonts, radius, usePalette } from '@/theme';

type Mode = 'customer' | 'team';

export default function SignInScreen() {
  const palette = usePalette();
  const insets = useSafeAreaInsets();
  const sheetColor = palette.dark ? palette.background : palette.surface;
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
  const phoneRef = useRef<ComponentRef<typeof TextInput>>(null);

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
  const submitLabel = !customer ? 'Güvenli giriş yap' : confirmation ? 'Kodu doğrula' : 'SMS kodu gönder';

  return (
    <View style={{ flex: 1, backgroundColor: sheetColor }}>
      <StatusBar style="light" />
      <KeyboardScroll contentContainerStyle={{ flexGrow: 1 }} bounces={false} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={['#1E1B4B', '#4338CA', '#7C3AED']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.hero, { paddingTop: insets.top + 20 }]}
        >
          <View style={[styles.glow, { top: -70, right: -60, width: 220, height: 220, backgroundColor: '#F0ABFC33' }]} />
          <View style={[styles.glow, { bottom: -40, left: -70, width: 200, height: 200, backgroundColor: '#818CF840' }]} />
          <View style={styles.inner}>
            <View style={styles.brand}>
              <View style={styles.logoTile}>
                <BrandLogo size={34} />
              </View>
              <View>
                <Text style={styles.brandName}>OdivonPro</Text>
                <Text style={styles.brandTag}>BEAUTY CENTER</Text>
              </View>
            </View>
            <Text style={styles.headline}>
              {customer ? 'Tekrar\nhoş geldiniz' : 'Merkezinizi\nyönetin'}
            </Text>
            <Text style={styles.lead}>
              {customer
                ? 'Randevularınız ve bakım geçmişiniz tek dokunuşla elinizde.'
                : 'Randevular, ekip ve müşteriler tek bir güvenli panelde.'}
            </Text>
          </View>
        </LinearGradient>

        <View style={[styles.sheet, { backgroundColor: sheetColor }]}>
          <View style={styles.inner}>
            <View style={[styles.segment, { backgroundColor: palette.surfaceSoft, borderColor: palette.border }]} accessibilityRole="tablist">
              <Segment label="Müşteri" icon="spa" active={customer} disabled={busy} onPress={() => changeMode('customer')} />
              <Segment
                label="Ekip / Yönetici"
                icon="badge"
                active={!customer}
                disabled={busy}
                onPress={() => changeMode('team')}
              />
            </View>

            <View style={{ gap: 4, marginTop: 24 }}>
              <Text style={[styles.title, { color: palette.text }]}>
                {customer ? (confirmation ? 'Kodu doğrulayın' : 'Telefonla giriş') : 'Hesabınıza giriş yapın'}
              </Text>
              <Text style={[styles.subtitle, { color: palette.muted }]}>
                {customer
                  ? confirmation
                    ? 'Telefonunuza gelen 6 haneli kodu girin.'
                    : 'Merkezinizde kayıtlı telefon numaranızı kullanın.'
                  : 'Merkez yöneticinizin tanımladığı hesabı kullanın.'}
              </Text>
            </View>

            <View style={styles.form}>
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
                    helper={`${phone} numarasına gönderildi`}
                    style={styles.codeInput}
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
                      onSubmitEditing={() => phoneRef.current?.focus()}
                    />
                    <TextField
                      ref={phoneRef}
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
                    hitSlop={10}
                    style={{ alignSelf: 'flex-end', marginTop: -4 }}
                  >
                    <Text style={[styles.link, { color: palette.primary }]}>Şifremi unuttum</Text>
                  </Pressable>
                </>
              )}

              {error ? <InlineError message={error} /> : null}

              <Button label={submitLabel} icon="arrow-forward" busy={busy} onPress={submit} style={{ marginTop: 4 }} />
              {customer && confirmation ? (
                <Button label="Telefon numarasını değiştir" variant="text" disabled={busy} onPress={resetPhone} />
              ) : null}
            </View>

            <View style={[styles.privacy, { backgroundColor: palette.surfaceSoft, borderColor: palette.border }]}>
              <View style={[styles.privacyIcon, { backgroundColor: palette.primarySoft }]}>
                <Icon name="verified-user" size={16} color={palette.primary} />
              </View>
              <Text style={[styles.privacyText, { color: palette.muted }]}>
                Tenant, rol ve müşteri eşleşmesi MainApi tarafından güvenle doğrulanır.
              </Text>
            </View>
          </View>
          <View style={{ height: insets.bottom + 12 }} />
        </View>
      </KeyboardScroll>
    </View>
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
        active ? [styles.segmentActive, { backgroundColor: palette.dark ? palette.surface : '#FFFFFF' }] : null,
      ]}
    >
      <Icon name={icon} size={17} color={active ? palette.primary : palette.muted} />
      <Text style={{ color: active ? palette.text : palette.muted, fontFamily: active ? fonts.bold : fonts.semibold, fontSize: 13 }}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hero: { paddingHorizontal: 24, paddingBottom: 64, overflow: 'hidden' },
  glow: { position: 'absolute', borderRadius: 999 },
  inner: { width: '100%', maxWidth: 460, alignSelf: 'center' },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logoTile: {
    width: 48,
    height: 48,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
  },
  brandName: { color: '#FFFFFF', fontFamily: fonts.extrabold, fontSize: 17, letterSpacing: -0.2 },
  brandTag: { color: '#C7D2FE', fontFamily: fonts.bold, fontSize: 9, letterSpacing: 1.8 },
  headline: { color: '#FFFFFF', fontSize: 34, fontFamily: fonts.extrabold, lineHeight: 39, letterSpacing: -1.2, marginTop: 36 },
  lead: { color: 'rgba(255,255,255,0.75)', fontFamily: fonts.medium, fontSize: 15, lineHeight: 22, marginTop: 10, maxWidth: 320 },
  sheet: {
    flexGrow: 1,
    marginTop: -32,
    paddingHorizontal: 24,
    paddingTop: 28,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  segment: { flexDirection: 'row', borderRadius: radius.lg, borderWidth: 1, padding: 4 },
  segmentItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 11,
    borderRadius: radius.md,
  },
  segmentActive: {
    shadowColor: '#0F172A',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  title: { fontSize: 24, fontFamily: fonts.extrabold, letterSpacing: -0.6 },
  subtitle: { fontSize: 14, fontFamily: fonts.medium, lineHeight: 20 },
  form: { gap: 16, marginTop: 22 },
  codeInput: { fontSize: 22, letterSpacing: 8, fontFamily: fonts.bold },
  link: { fontFamily: fonts.bold, fontSize: 13 },
  privacy: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 28,
    padding: 14,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  privacyIcon: { width: 32, height: 32, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  privacyText: { flex: 1, fontFamily: fonts.medium, fontSize: 12, lineHeight: 17 },
});
