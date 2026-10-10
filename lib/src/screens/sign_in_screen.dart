import 'package:beauty/src/core/models.dart';
import 'package:beauty/src/core/session.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class SignInScreen extends ConsumerWidget {
  const SignInScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) => Scaffold(
    body: SafeArea(
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 440),
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const Icon(
                  Icons.spa_rounded,
                  size: 64,
                  color: Color(0xff5b5bd6),
                ),
                const SizedBox(height: 20),
                Text(
                  'OdivonPro Guzellik Merkezi',
                  textAlign: TextAlign.center,
                  style: Theme.of(context).textTheme.headlineSmall,
                ),
                const SizedBox(height: 8),
                const Text(
                  'Telefon OTP yapilandirilana kadar guvenli demo rolunu secin.',
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 28),
                for (final role in BeautyRole.values)
                  Padding(
                    padding: const EdgeInsets.only(bottom: 12),
                    child: FilledButton.tonalIcon(
                      onPressed: () =>
                          ref.read(sessionProvider.notifier).signInAs(role),
                      icon: Icon(
                        role == BeautyRole.customer
                            ? Icons.person_outline
                            : Icons.badge_outlined,
                      ),
                      label: Text('${role.label} olarak devam et'),
                    ),
                  ),
              ],
            ),
          ),
        ),
      ),
    ),
  );
}
