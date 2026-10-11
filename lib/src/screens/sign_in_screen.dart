import 'package:beauty/src/core/models.dart';
import 'package:beauty/src/core/session.dart';
import 'package:beauty/src/widgets/brand_logo.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class SignInScreen extends ConsumerWidget {
  const SignInScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final colorScheme = Theme.of(context).colorScheme;

    return Scaffold(
      body: DecoratedBox(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [
              const Color(0xFFF8F3EE),
              colorScheme.surface,
            ],
          ),
        ),
        child: SafeArea(
          child: Center(
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 420),
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    const BrandLogo(size: 104),
                    const SizedBox(height: 28),
                    Text(
                      'Odivon Beauty',
                      textAlign: TextAlign.center,
                      style: Theme.of(context).textTheme.displaySmall?.copyWith(
                        fontWeight: FontWeight.w700,
                        letterSpacing: 0.7,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Luxury beauty experience',
                      textAlign: TextAlign.center,
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        color: Theme.of(context).hintColor,
                        letterSpacing: 1.2,
                      ),
                    ),
                    const SizedBox(height: 28),
                    Card(
                      child: Padding(
                        padding: const EdgeInsets.all(20),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Güvenli demo erişimi',
                              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                            const SizedBox(height: 8),
                            Text(
                              'Telefon OTP doğrulaması hazır olana kadar rolleri deneyimleyin.',
                              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                color: Theme.of(context).hintColor,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 20),
                    for (final role in BeautyRole.values)
                      Padding(
                        padding: const EdgeInsets.only(bottom: 12),
                        child: FilledButton.icon(
                          onPressed: () =>
                              ref.read(sessionProvider.notifier).signInAs(role),
                          icon: Icon(
                            role == BeautyRole.customer
                                ? Icons.person_rounded
                                : role == BeautyRole.specialist
                                    ? Icons.badge_rounded
                                    : Icons.business_center_rounded,
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
      ),
    );
  }
}
