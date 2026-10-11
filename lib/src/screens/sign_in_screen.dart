import 'package:beauty/src/core/bootstrap.dart';
import 'package:beauty/src/core/session.dart';
import 'package:beauty/src/widgets/brand_logo.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class SignInScreen extends ConsumerStatefulWidget {
  const SignInScreen({super.key});

  @override
  ConsumerState<SignInScreen> createState() => _SignInScreenState();
}

class _SignInScreenState extends ConsumerState<SignInScreen> {
  final _phone = TextEditingController(text: '+90');
  final _code = TextEditingController();
  String? _verificationId;
  String? _error;
  bool _busy = false;

  @override
  void dispose() {
    _phone.dispose();
    _code.dispose();
    super.dispose();
  }

  Future<void> _sendCode() async {
    if (!AppBootstrap.firebaseEnabled) {
      setState(() => _error = 'Firebase mobil yapilandirmasi etkin degil.');
      return;
    }
    setState(() {
      _busy = true;
      _error = null;
    });
    await FirebaseAuth.instance.verifyPhoneNumber(
      phoneNumber: _phone.text.trim(),
      verificationCompleted: (credential) async {
        final result = await FirebaseAuth.instance.signInWithCredential(
          credential,
        );
        if (result.user != null) {
          await ref
              .read(sessionProvider.notifier)
              .acceptFirebaseUser(result.user!);
        }
      },
      verificationFailed: (error) {
        if (mounted) {
          setState(() {
            _busy = false;
            _error = error.message ?? 'Dogrulama baslatilamadi.';
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
      codeAutoRetrievalTimeout: (verificationId) =>
          _verificationId = verificationId,
    );
  }

  Future<void> _verifyCode() async {
    final verificationId = _verificationId;
    if (verificationId == null || _code.text.trim().length < 6) return;
    setState(() {
      _busy = true;
      _error = null;
    });
    try {
      final credential = PhoneAuthProvider.credential(
        verificationId: verificationId,
        smsCode: _code.text.trim(),
      );
      final result = await FirebaseAuth.instance.signInWithCredential(
        credential,
      );
      if (result.user == null) {
        throw StateError('Kullanici oturumu olusturulamadi.');
      }
      await ref.read(sessionProvider.notifier).acceptFirebaseUser(result.user!);
    } on FirebaseAuthException catch (error) {
      setState(() => _error = error.message ?? 'Kod dogrulanamadi.');
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 430),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const Align(
                    alignment: Alignment.centerLeft,
                    child: BrandLogo(size: 76),
                  ),
                  const SizedBox(height: 30),
                  Text(
                    'Bakiminiz,\nprograminiz, siz.',
                    style: theme.textTheme.displaySmall?.copyWith(
                      fontWeight: FontWeight.w800,
                      height: 1.08,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    'Randevulariniza, paketlerinize ve merkezinizdeki deneyiminize guvenli telefon dogrulamasi ile ulasin.',
                    style: theme.textTheme.bodyLarge?.copyWith(
                      color: theme.hintColor,
                      height: 1.5,
                    ),
                  ),
                  const SizedBox(height: 32),
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(20),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          Text(
                            _verificationId == null
                                ? 'Telefonla giris'
                                : 'Dogrulama kodu',
                            style: theme.textTheme.titleLarge?.copyWith(
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            _verificationId == null
                                ? 'SMS ile gonderilen tek kullanimlik kodu kullanin.'
                                : '${_phone.text} numarasina gelen 6 haneli kodu girin.',
                            style: theme.textTheme.bodyMedium?.copyWith(
                              color: theme.hintColor,
                            ),
                          ),
                          const SizedBox(height: 20),
                          if (_verificationId == null)
                            TextField(
                              controller: _phone,
                              keyboardType: TextInputType.phone,
                              autofillHints: const [
                                AutofillHints.telephoneNumber,
                              ],
                              decoration: const InputDecoration(
                                labelText: 'Telefon numarasi',
                                prefixIcon: Icon(Icons.phone_rounded),
                              ),
                            )
                          else
                            TextField(
                              controller: _code,
                              keyboardType: TextInputType.number,
                              autofillHints: const [AutofillHints.oneTimeCode],
                              maxLength: 6,
                              decoration: const InputDecoration(
                                labelText: 'SMS kodu',
                                prefixIcon: Icon(Icons.password_rounded),
                              ),
                            ),
                          if (_error != null)
                            Padding(
                              padding: const EdgeInsets.only(top: 12),
                              child: Text(
                                _error!,
                                style: TextStyle(
                                  color: theme.colorScheme.error,
                                ),
                              ),
                            ),
                          const SizedBox(height: 18),
                          FilledButton.icon(
                            onPressed: _busy
                                ? null
                                : (_verificationId == null
                                      ? _sendCode
                                      : _verifyCode),
                            icon: _busy
                                ? const SizedBox(
                                    width: 18,
                                    height: 18,
                                    child: CircularProgressIndicator(
                                      strokeWidth: 2,
                                    ),
                                  )
                                : Icon(
                                    _verificationId == null
                                        ? Icons.arrow_forward_rounded
                                        : Icons.verified_rounded,
                                  ),
                            label: Text(
                              _verificationId == null
                                  ? 'Kod gonder'
                                  : 'Giris yap',
                            ),
                          ),
                          if (_verificationId != null)
                            TextButton(
                              onPressed: _busy
                                  ? null
                                  : () => setState(() {
                                      _verificationId = null;
                                      _error = null;
                                    }),
                              child: const Text('Telefon numarasini degistir'),
                            ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 18),
                  Row(
                    children: [
                      Icon(
                        Icons.shield_outlined,
                        size: 18,
                        color: theme.hintColor,
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          'Saglik ve finans verileri cihazda kalici olarak saklanmaz.',
                          style: theme.textTheme.bodySmall?.copyWith(
                            color: theme.hintColor,
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
