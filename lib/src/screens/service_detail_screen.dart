import 'package:flutter/material.dart';

class ServiceDetailScreen extends StatelessWidget {
  const ServiceDetailScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      body: SafeArea(
        child: CustomScrollView(
          slivers: [
            SliverAppBar(
              pinned: true,
              expandedHeight: 260,
              flexibleSpace: FlexibleSpaceBar(
                background: DecoratedBox(
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                      colors: [
                        const Color(0xFFE9D7AF),
                        const Color(0xFFB5884D),
                      ],
                    ),
                  ),
                  child: Stack(
                    children: [
                      Positioned(
                        right: -30,
                        top: 28,
                        child: Container(
                          width: 180,
                          height: 180,
                          decoration: BoxDecoration(
                            color: Colors.white.withValues(alpha: 0.18),
                            shape: BoxShape.circle,
                          ),
                        ),
                      ),
                      Positioned(
                        left: 24,
                        bottom: 24,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Golden Glow Facial',
                              style: theme.textTheme.headlineSmall?.copyWith(
                                color: Colors.white,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                            const SizedBox(height: 8),
                            Text(
                              '60 dakika • 1 uzman • 4.9/5',
                              style: theme.textTheme.bodyLarge?.copyWith(
                                color: Colors.white.withValues(alpha: 0.9),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
            SliverPadding(
              padding: const EdgeInsets.all(20),
              sliver: SliverList(
                delegate: SliverChildListDelegate([
                  _InfoRow(
                    label: 'Fiyat',
                    value: '₺1.250',
                    icon: Icons.attach_money_rounded,
                  ),
                  const SizedBox(height: 14),
                  _InfoRow(
                    label: 'Öne çıkan içerik',
                    value: 'Cilt yenileme • Peeling • Maske',
                    icon: Icons.auto_awesome_rounded,
                  ),
                  const SizedBox(height: 22),
                  Text(
                    'Bakım detayları',
                    style: theme.textTheme.titleLarge,
                  ),
                  const SizedBox(height: 12),
                  Text(
                    'Kızarıklık azaltıcı bakım, mikrodermal temizleme ve cilt aydınlatıcı serum uygulaması ile cildinizi canlandırır. Çalışma sonrası yumuşaklık ve ışıltı hissi sağlar.',
                    style: theme.textTheme.bodyLarge?.copyWith(
                      color: theme.hintColor,
                      height: 1.6,
                    ),
                  ),
                  const SizedBox(height: 24),
                  Text(
                    'İçerik',
                    style: theme.textTheme.titleMedium,
                  ),
                  const SizedBox(height: 12),
                  Wrap(
                    spacing: 10,
                    runSpacing: 10,
                    children: const [
                      _Pill(label: 'Peeling'),
                      _Pill(label: 'Hydration'),
                      _Pill(label: 'Vitamin C'),
                      _Pill(label: 'LED Therapy'),
                    ],
                  ),
                  const SizedBox(height: 32),
                  SizedBox(
                    width: double.infinity,
                    child: FilledButton.icon(
                      onPressed: () {},
                      icon: const Icon(Icons.calendar_month_rounded),
                      label: const Text('Randevu al'),
                    ),
                  ),
                ]),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  const _InfoRow({
    required this.label,
    required this.value,
    required this.icon,
  });

  final String label;
  final String value;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            Container(
              width: 42,
              height: 42,
              decoration: BoxDecoration(
                color: theme.colorScheme.primary.withValues(alpha: 0.12),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(icon, color: theme.colorScheme.primary),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(label, style: theme.textTheme.bodyMedium?.copyWith(color: theme.hintColor)),
                  const SizedBox(height: 4),
                  Text(value, style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700)),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _Pill extends StatelessWidget {
  const _Pill({required this.label});
  final String label;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.primary.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(label),
    );
  }
}
