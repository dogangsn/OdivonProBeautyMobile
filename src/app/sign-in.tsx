import { LinearGradient } from 'expo-linear-gradient';
import { useRef, useState, type ComponentRef } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandLogo } from '@/components/BrandLogo';
import { Icon, type IconName } from '@/components/Icon';
import { Button, IconButton, InlineError, TextField } from '@/components/ui';
import { authErrorMessage, getAuthGateway, type PhoneConfirmation } from '@/core/auth';
import { useSession } from '@/core/session';
import { radius, usePalette } from '@/theme';

type Mode = 'customer' | 'team';

export default function SignInScreen() {
  const palette = usePalette();
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
    <LinearGradient colors={['#17112E', '#28153D', '#541D56']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flex: 1 }}>
      <View style={[styles.glow, { top: -90, right: -80, width: 260, height: 260, backgroundColor: '#F472B655' }]} />
      <View style={[styles.glow, { bottom: 80, left: -110, width: 300, height: 300, backgroundColor: '#7C3AED44' }]} />
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
            <View style={styles.content}>
              <View style={styles.brand}>
                <BrandLogo size={52} />
                <View>
                  <Text style={styles.brandName}>OdivonPro</Text>
                  <Text style={styles.brandTag}>BEAUTY CENTER</Text>
                </View>
              </View>
              <Text style={styles.headline}>Güzelliği yönetmenin{'\n'}zarif hali.</Text>
              <Text style={styles.lead}>
                Merkeziniz, randevularınız ve bakım yolculuğunuz tek bir güvenli akışta.
              </Text>

              <View style={[styles.card, { backgroundColor: palette.surface }]}>
                <View style={[styles.segment, { borderColor: palette.border }]} accessibilityRole="tablist">
                  <Segment label="Müşteri" icon="spa" active={customer} disabled={busy} onPress={() => changeMode('customer')} />
                  <Segment
                    label="Ekip / Yönetici"
                    icon="badge"
                    active={!customer}
                    disabled={busy}
                    onPress={() => changeMode('team')}
                  />
                </View>

                <View style={{ gap: 6 }}>
                  <Text style={[styles.cardTitle, { color: palette.text }]}>
                    {customer ? 'Bakım yolculuğunuza dönün' : 'Yönetim merkezine giriş yapın'}
                  </Text>
                  <Text style={{ color: palette.muted, fontSize: 12, lineHeight: 17 }}>
                    {customer
                      ? 'Merkezinizde kayıtlı telefon numaranızı kullanın.'
                      : 'Merkez yöneticiniz tarafından tanımlanan hesabı kullanın.'}
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
                      helper={`${phone} numarasına gönderildi`}
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
                        icon="phone"
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
                    <Button
                      label="Şifremi unuttum"
                      variant="text"
                      disabled={busy}
                      onPress={resetPassword}
                      style={{ alignSelf: 'flex-end', paddingHorizontal: 4 }}
                    />
                  </>
                )}

                {error ? <InlineError message={error} /> : null}

                <Button label={submitLabel} icon="arrow-forward" busy={busy} onPress={submit} />
                {customer && confirmation ? (
                  <Button label="Telefon numarasını değiştir" variant="text" disabled={busy} onPress={resetPhone} />
                ) : null}
              </View>

              <View style={styles.privacy}>
                <Icon name="shield" size={18} color="#DBB7F5" />
                <Text style={styles.privacyText}>
                  Tenant, rol ve müşteri eşleşmesi MainApi tarafından güvenle doğrulanır.
                </Text>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
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
      style={[styles.segmentItem, { backgroundColor: active ? palette.primarySoft : 'transparent' }]}
    >
      <Icon name={icon} size={18} color={active ? palette.primary : palette.muted} />
      <Text style={{ color: active ? palette.text : palette.muted, fontWeight: '600' }}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  glow: { position: 'absolute', borderRadius: 999 },
  scroll: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 20, paddingTop: 28, paddingBottom: 32 },
  content: { width: '100%', maxWidth: 460, alignSelf: 'center' },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  brandName: { color: '#FFFFFF', fontWeight: '900', fontSize: 17 },
  brandTag: { color: '#DBB7F5', fontWeight: '700', fontSize: 9, letterSpacing: 1.6 },
  headline: { color: '#FFFFFF', fontSize: 36, fontWeight: '900', lineHeight: 38, letterSpacing: -1.5, marginTop: 34 },
  lead: { color: 'rgba(255,255,255,0.7)', fontSize: 16, lineHeight: 24, marginTop: 10 },
  card: {
    marginTop: 26,
    padding: 22,
    gap: 16,
    borderRadius: radius.xxl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
    shadowColor: '#000000',
    shadowOpacity: 0.2,
    shadowRadius: 42,
    shadowOffset: { width: 0, height: 20 },
    elevation: 12,
  },
  segment: { flexDirection: 'row', borderWidth: 1, borderRadius: radius.pill, padding: 3 },
  segmentItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: radius.pill,
  },
  cardTitle: { fontSize: 20, fontWeight: '800' },
  privacy: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 18 },
  privacyText: { flex: 1, color: 'rgba(255,255,255,0.65)', fontSize: 12 },
});
