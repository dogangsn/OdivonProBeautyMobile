import 'package:beauty/src/core/bootstrap.dart';
import 'package:beauty/src/core/api_repository.dart';
import 'package:beauty/src/core/session.dart';
import 'package:beauty/src/widgets/brand_logo.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

enum _SignInMode { customer, team }

class SignInScreen extends ConsumerStatefulWidget {
  const SignInScreen({super.key});

  @override
  ConsumerState<SignInScreen> createState() => _SignInScreenState();
}

class _SignInScreenState extends ConsumerState<SignInScreen> {
  final _phone = TextEditingController(text: '+90');
  final _centerCode = TextEditingController();
  final _code = TextEditingController();
  final _email = TextEditingController();
  final _password = TextEditingController();
  _SignInMode _mode = _SignInMode.customer;
  String? _verificationId;
  String? _error;
  bool _busy = false;
  bool _hidePassword = true;

  @override
  void dispose() {
    _phone.dispose();
    _centerCode.dispose();
    _code.dispose();
    _email.dispose();
    _password.dispose();
    super.dispose();
  }

  Future<void> _teamSignIn() async {
    if (!_ready()) return;
    final email = _email.text.trim();
    if (email.isEmpty || _password.text.isEmpty) {
      _showError('E-posta ve şifre alanlarını doldurun.');
      return;
    }
    await _run(() async {
      final result = await FirebaseAuth.instance.signInWithEmailAndPassword(
        email: email,
        password: _password.text,
      );
      if (result.user == null) throw StateError('Kullanıcı oturumu oluşturulamadı.');
      await ref.read(sessionProvider.notifier).acceptFirebaseUser(result.user!);
    });
  }

  Future<void> _resetPassword() async {
    final email = _email.text.trim();
    if (email.isEmpty) {
      _showError('Önce e-posta adresinizi yazın.');
      return;
    }
    await _run(() async {
      await FirebaseAuth.instance.sendPasswordResetEmail(email: email);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Şifre yenileme bağlantısı gönderildi.')),
      );
    });
  }

  Future<void> _sendCode() async {
    if (!_ready()) return;
    if (_centerCode.text.trim().length < 5) {
      _showError('Güzellik merkezinizin mobil erişim kodunu girin.');
      return;
    }
    if (!_phone.text.trim().startsWith('+') || _phone.text.trim().length < 10) {
      _showError('Telefonu ülke koduyla birlikte girin. Örnek: +905xxxxxxxxx');
      return;
    }
    setState(() {
      _busy = true;
      _error = null;
    });
    await FirebaseAuth.instance.verifyPhoneNumber(
      phoneNumber: _phone.text.trim(),
      verificationCompleted: (credential) async {
        try {
          final result = await FirebaseAuth.instance.signInWithCredential(credential);
          if (result.user != null) {
            await ref.read(repositoryProvider).connectCustomer(_centerCode.text);
            await ref.read(sessionProvider.notifier).acceptFirebaseUser(result.user!);
          }
        } on Object catch (error) {
          if (mounted) _showError(_message(error));
        }
      },
      verificationFailed: (error) {
        if (mounted) {
          setState(() {
            _busy = false;
            _error = error.message ?? 'Doğrulama başlatılamadı.';
          });
        }
      },
      codeSent: (verificationId, _) {
        if (mounted) {
          setState(() {
            _verificationId = verificationId;
            _busy = false;
          });
        }
      },
      codeAutoRetrievalTimeout: (verificationId) => _verificationId = verificationId,
    );
  }

  Future<void> _verifyCode() async {
    final verificationId = _verificationId;
    if (verificationId == null || _code.text.trim().length != 6) {
      _showError('6 haneli SMS kodunu girin.');
      return;
    }
    await _run(() async {
      final credential = PhoneAuthProvider.credential(
        verificationId: verificationId,
        smsCode: _code.text.trim(),
      );
      final result = await FirebaseAuth.instance.signInWithCredential(credential);
      if (result.user == null) throw StateError('Kullanıcı oturumu oluşturulamadı.');
      await ref.read(repositoryProvider).connectCustomer(_centerCode.text);
      await ref.read(sessionProvider.notifier).acceptFirebaseUser(result.user!);
    });
  }

  bool _ready() {
    if (AppBootstrap.firebaseEnabled) return true;
    _showError('Firebase mobil yapılandırması etkin değil.');
    return false;
  }

  Future<void> _run(Future<void> Function() operation) async {
    setState(() {
      _busy = true;
      _error = null;
    });
    try {
      await operation();
    } on FirebaseAuthException catch (error) {
      _showError(error.message ?? 'Giriş tamamlanamadı.');
    } on Object catch (error) {
      _showError(_message(error));
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  void _showError(String message) {
    if (mounted) setState(() => _error = message);
  }

  void _changeMode(_SignInMode mode) {
    setState(() {
      _mode = mode;
      _error = null;
      _verificationId = null;
      _code.clear();
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final sessionError = ref.watch(sessionProvider).error;
    final error = _error ?? sessionError;
    return Scaffold(
      body: Stack(
        children: [
          const Positioned.fill(child: _BeautyBackground()),
          SafeArea(
            child: Center(
              child: SingleChildScrollView(
                padding: const EdgeInsets.fromLTRB(20, 28, 20, 32),
                child: ConstrainedBox(
                  constraints: const BoxConstraints(maxWidth: 460),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      const _BrandHeader(),
                      const SizedBox(height: 34),
                      Text(
                        'Güzelliği yönetmenin\nzarif hali.',
                        style: theme.textTheme.displaySmall?.copyWith(
                          color: Colors.white,
                          fontWeight: FontWeight.w900,
                          height: 1.05,
                          letterSpacing: -1.5,
                        ),
                      ),
                      const SizedBox(height: 10),
                      Text(
                        'Merkeziniz, randevularınız ve bakım yolculuğunuz tek bir güvenli akışta.',
                        style: theme.textTheme.bodyLarge?.copyWith(
                          color: Colors.white.withValues(alpha: .7),
                          height: 1.5,
                        ),
                      ),
                      const SizedBox(height: 26),
                      _SignInCard(
                        mode: _mode,
                        busy: _busy,
                        verificationId: _verificationId,
                        error: error,
                        phone: _phone,
                        centerCode: _centerCode,
                        code: _code,
                        email: _email,
                        password: _password,
                        hidePassword: _hidePassword,
                        onModeChanged: _changeMode,
                        onTogglePassword: () =>
                            setState(() => _hidePassword = !_hidePassword),
                        onCustomerSubmit: _verificationId == null ? _sendCode : _verifyCode,
                        onTeamSubmit: _teamSignIn,
                        onResetPassword: _resetPassword,
                        onChangePhone: () => setState(() {
                          _verificationId = null;
                          _error = null;
                          _code.clear();
                        }),
                      ),
                      const SizedBox(height: 18),
                      const _PrivacyNote(),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _SignInCard extends StatelessWidget {
  const _SignInCard({
    required this.mode,
    required this.busy,
    required this.verificationId,
    required this.error,
    required this.phone,
    required this.centerCode,
    required this.code,
    required this.email,
    required this.password,
    required this.hidePassword,
    required this.onModeChanged,
    required this.onTogglePassword,
    required this.onCustomerSubmit,
    required this.onTeamSubmit,
    required this.onResetPassword,
    required this.onChangePhone,
  });

  final _SignInMode mode;
  final bool busy;
  final String? verificationId;
  final String? error;
  final TextEditingController phone;
  final TextEditingController centerCode;
  final TextEditingController code;
  final TextEditingController email;
  final TextEditingController password;
  final bool hidePassword;
  final ValueChanged<_SignInMode> onModeChanged;
  final VoidCallback onTogglePassword;
  final VoidCallback onCustomerSubmit;
  final VoidCallback onTeamSubmit;
  final VoidCallback onResetPassword;
  final VoidCallback onChangePhone;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Container(
      padding: const EdgeInsets.all(22),
      decoration: BoxDecoration(
        color: theme.colorScheme.surface.withValues(alpha: .96),
        borderRadius: BorderRadius.circular(28),
        border: Border.all(color: Colors.white.withValues(alpha: .28)),
        boxShadow: const [
          BoxShadow(color: Color(0x33000000), blurRadius: 42, offset: Offset(0, 20)),
        ],
      ),
      child: AutofillGroup(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            SegmentedButton<_SignInMode>(
              segments: const [
                ButtonSegment(
                  value: _SignInMode.customer,
                  icon: Icon(Icons.spa_outlined),
                  label: Text('Müşteri'),
                ),
                ButtonSegment(
                  value: _SignInMode.team,
                  icon: Icon(Icons.badge_outlined),
                  label: Text('Ekip / Yönetici'),
                ),
              ],
              selected: {mode},
              onSelectionChanged: busy ? null : (values) => onModeChanged(values.first),
              showSelectedIcon: false,
              style: const ButtonStyle(visualDensity: VisualDensity.compact),
            ),
            const SizedBox(height: 24),
            Text(
              mode == _SignInMode.customer ? 'Bakım yolculuğunuza dönün' : 'Yönetim merkezine giriş yapın',
              style: theme.textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w800),
            ),
            const SizedBox(height: 6),
            Text(
              mode == _SignInMode.customer
                  ? 'Merkezinizde kayıtlı telefon numaranızı kullanın.'
                  : 'Merkez yöneticiniz tarafından tanımlanan hesabı kullanın.',
              style: theme.textTheme.bodySmall?.copyWith(color: theme.hintColor, height: 1.4),
            ),
            const SizedBox(height: 20),
            if (mode == _SignInMode.customer) ...[
              if (verificationId == null)
                ...[
                  TextField(
                    controller: centerCode,
                    textCapitalization: TextCapitalization.characters,
                    textInputAction: TextInputAction.next,
                    decoration: const InputDecoration(
                      labelText: 'Merkez kodu',
                      hintText: 'BY-XXXXXX',
                      prefixIcon: Icon(Icons.storefront_rounded),
                    ),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: phone,
                    keyboardType: TextInputType.phone,
                    autofillHints: const [AutofillHints.telephoneNumber],
                    textInputAction: TextInputAction.done,
                    onSubmitted: busy ? null : (_) => onCustomerSubmit(),
                    decoration: const InputDecoration(
                      labelText: 'Telefon numarası',
                      hintText: '+905xxxxxxxxx',
                      prefixIcon: Icon(Icons.phone_rounded),
                    ),
                  ),
                ]
              else
                TextField(
                  controller: code,
                  keyboardType: TextInputType.number,
                  autofillHints: const [AutofillHints.oneTimeCode],
                  maxLength: 6,
                  textInputAction: TextInputAction.done,
                  onSubmitted: busy ? null : (_) => onCustomerSubmit(),
                  decoration: InputDecoration(
                    labelText: 'SMS doğrulama kodu',
                    helperText: '${phone.text} numarasına gönderildi',
                    prefixIcon: const Icon(Icons.password_rounded),
                  ),
                ),
            ] else ...[
              TextField(
                controller: email,
                keyboardType: TextInputType.emailAddress,
                autofillHints: const [AutofillHints.username, AutofillHints.email],
                textInputAction: TextInputAction.next,
                decoration: const InputDecoration(
                  labelText: 'E-posta adresi',
                  prefixIcon: Icon(Icons.alternate_email_rounded),
                ),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: password,
                obscureText: hidePassword,
                autofillHints: const [AutofillHints.password],
                textInputAction: TextInputAction.done,
                onSubmitted: busy ? null : (_) => onTeamSubmit(),
                decoration: InputDecoration(
                  labelText: 'Şifre',
                  prefixIcon: const Icon(Icons.lock_outline_rounded),
                  suffixIcon: IconButton(
                    tooltip: hidePassword ? 'Şifreyi göster' : 'Şifreyi gizle',
                    onPressed: onTogglePassword,
                    icon: Icon(hidePassword ? Icons.visibility_outlined : Icons.visibility_off_outlined),
                  ),
                ),
              ),
              Align(
                alignment: Alignment.centerRight,
                child: TextButton(onPressed: busy ? null : onResetPassword, child: const Text('Şifremi unuttum')),
              ),
            ],
            if (error != null) ...[
              const SizedBox(height: 12),
              _InlineError(message: error!),
            ],
            const SizedBox(height: 18),
            FilledButton.icon(
              onPressed: busy
                  ? null
                  : mode == _SignInMode.team
                  ? onTeamSubmit
                  : onCustomerSubmit,
              icon: busy
                  ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2))
                  : const Icon(Icons.arrow_forward_rounded),
              label: Text(
                mode == _SignInMode.team
                    ? 'Güvenli giriş yap'
                    : verificationId == null
                    ? 'SMS kodu gönder'
                    : 'Kodu doğrula',
              ),
            ),
            if (mode == _SignInMode.customer && verificationId != null)
              TextButton(onPressed: busy ? null : onChangePhone, child: const Text('Telefon numarasını değiştir')),
          ],
        ),
      ),
    );
  }
}

class _BeautyBackground extends StatelessWidget {
  const _BeautyBackground();

  @override
  Widget build(BuildContext context) => DecoratedBox(
    decoration: const BoxDecoration(
      gradient: LinearGradient(
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
        colors: [Color(0xFF17112E), Color(0xFF28153D), Color(0xFF541D56)],
      ),
    ),
    child: Stack(
      children: [
        Positioned(top: -90, right: -80, child: _Glow(size: 260, color: Color(0x55F472B6))),
        Positioned(bottom: 80, left: -110, child: _Glow(size: 300, color: Color(0x447C3AED))),
      ],
    ),
  );
}

class _Glow extends StatelessWidget {
  const _Glow({required this.size, required this.color});
  final double size;
  final Color color;

  @override
  Widget build(BuildContext context) => Container(
    width: size,
    height: size,
    decoration: BoxDecoration(shape: BoxShape.circle, color: color),
  );
}

class _BrandHeader extends StatelessWidget {
  const _BrandHeader();

  @override
  Widget build(BuildContext context) => const Row(
    children: [
      BrandLogo(size: 52),
      SizedBox(width: 12),
      Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('OdivonPro', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 17)),
          Text('BEAUTY CENTER', style: TextStyle(color: Color(0xFFDBB7F5), fontWeight: FontWeight.w700, fontSize: 9, letterSpacing: 1.6)),
        ],
      ),
    ],
  );
}

class _InlineError extends StatelessWidget {
  const _InlineError({required this.message});
  final String message;

  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.all(12),
    decoration: BoxDecoration(
      color: Theme.of(context).colorScheme.errorContainer,
      borderRadius: BorderRadius.circular(14),
    ),
    child: Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(Icons.error_outline_rounded, size: 19, color: Theme.of(context).colorScheme.error),
        const SizedBox(width: 9),
        Expanded(child: Text(message, style: Theme.of(context).textTheme.bodySmall)),
      ],
    ),
  );
}

class _PrivacyNote extends StatelessWidget {
  const _PrivacyNote();

  @override
  Widget build(BuildContext context) => Row(
    children: [
      const Icon(Icons.shield_outlined, size: 18, color: Color(0xFFDBB7F5)),
      const SizedBox(width: 8),
      Expanded(
        child: Text(
          'Tenant, rol ve müşteri eşleşmesi MainApi tarafından güvenle doğrulanır.',
          style: Theme.of(context).textTheme.bodySmall?.copyWith(color: Colors.white.withValues(alpha: .65)),
        ),
      ),
    ],
  );
}

String _message(Object error) {
  final value = error.toString();
  return value.startsWith('Bad state: ') ? value.substring(11) : value;
}
