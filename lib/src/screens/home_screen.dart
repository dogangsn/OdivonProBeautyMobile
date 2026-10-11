import 'package:beauty/src/app.dart';
import 'package:beauty/src/core/models.dart';
import 'package:beauty/src/core/session.dart';
import 'package:beauty/src/widgets/brand_logo.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({required this.role, super.key});
  final BeautyRole role;

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  var _index = 0;

  @override
  Widget build(BuildContext context) {
    final customer = widget.role == BeautyRole.customer;
    final destinations = customer
        ? const [
            ('Randevular', Icons.calendar_month_rounded),
            ('Paketler', Icons.card_membership_rounded),
            ('Profil', Icons.person_rounded),
          ]
        : const [
            ('Bugün', Icons.today_rounded),
            ('Müşteriler', Icons.people_alt_rounded),
            ('KPI', Icons.insights_rounded),
          ];

    return Scaffold(
      body: IndexedStack(
        index: _index,
        children: customer
            ? const [AppointmentsView(), PackagesView(), ProfileView()]
            : const [
                AppointmentsView(staffMode: true),
                CustomersView(),
                KpiView(),
              ],
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _index,
        onDestinationSelected: (value) => setState(() => _index = value),
        destinations: [
          for (final item in destinations)
            NavigationDestination(icon: Icon(item.$2), label: item.$1),
        ],
      ),
    );
  }
}

class AppointmentsView extends ConsumerWidget {
  const AppointmentsView({this.staffMode = false, super.key});
  final bool staffMode;

  @override
  Widget build(BuildContext context, WidgetRef ref) =>
      FutureBuilder<List<AppointmentSummary>>(
        future: ref.read(repositoryProvider).appointments(),
        builder: (context, snapshot) {
          final items = snapshot.data ?? const <AppointmentSummary>[];

          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(
              child: Padding(
                padding: EdgeInsets.only(top: 64),
                child: CircularProgressIndicator(),
              ),
            );
          }

          return CustomScrollView(
            slivers: [
              SliverToBoxAdapter(child: _LuxuryHeader(staffMode: staffMode)),
              SliverPadding(
                padding: const EdgeInsets.fromLTRB(20, 0, 20, 24),
                sliver: SliverList(
                  delegate: SliverChildBuilderDelegate((context, index) {
                    if (index == 0) {
                      return Padding(
                        padding: const EdgeInsets.only(bottom: 16),
                        child: _HeroCard(staffMode: staffMode),
                      );
                    }

                    final item = items[index - 1];
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 14),
                      child: _AppointmentTile(
                        item: item,
                        staffMode: staffMode,
                        onCheckIn: () =>
                            ref.read(repositoryProvider).checkIn(item.id),
                      ),
                    );
                  }, childCount: items.isEmpty ? 1 : items.length + 1),
                ),
              ),
            ],
          );
        },
      );
}

class _LuxuryHeader extends ConsumerWidget {
  const _LuxuryHeader({required this.staffMode});
  final bool staffMode;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);

    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 56, 20, 16),
      child: Row(
        children: [
          BrandLogo(size: 50),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Odivon Beauty',
                  style: theme.textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w600,
                    letterSpacing: 1.1,
                  ),
                ),
                Text(
                  staffMode ? 'Operasyon paneli' : 'Lüks bakım deneyimi',
                  style: theme.textTheme.bodyMedium?.copyWith(
                    color: theme.hintColor,
                  ),
                ),
              ],
            ),
          ),
          IconButton(
            tooltip: 'Çıkış yap',
            onPressed: () => ref.read(sessionProvider.notifier).signOut(),
            icon: const Icon(Icons.logout_rounded),
          ),
        ],
      ),
    );
  }
}

class _HeroCard extends StatelessWidget {
  const _HeroCard({required this.staffMode});
  final bool staffMode;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return DecoratedBox(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(28),
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            const Color(0xFFE6D0A5),
            theme.colorScheme.primary,
          ],
        ),
      ),
      child: Padding(
        padding: const EdgeInsets.all(22),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(
                  staffMode ? Icons.auto_awesome_rounded : Icons.favorite_rounded,
                  color: Colors.white,
                ),
                const SizedBox(width: 8),
                Text(
                  staffMode ? 'Bugünün akışı' : 'Bakım gününüz',
                  style: theme.textTheme.titleMedium?.copyWith(
                    color: Colors.white,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 14),
            Text(
              staffMode
                  ? '8 randevu • %72 doluluk • 2 uzman hazır'
                  : 'Sonraki randevunuz • 15 Ekim • 10:00',
              style: theme.textTheme.bodyLarge?.copyWith(
                color: Colors.white,
              ),
            ),
            const SizedBox(height: 18),
            FilledButton(
              onPressed: () {
                if (staffMode) {
                  context.push('/service-detail');
                  return;
                }
                context.push('/booking');
              },
              style: FilledButton.styleFrom(
                backgroundColor: Colors.white,
                foregroundColor: Theme.of(context).colorScheme.primary,
              ),
              child: Text(staffMode ? 'Görevleri aç' : 'Randevu planla'),
            ),
          ],
        ),
      ),
    );
  }
}

class _AppointmentTile extends StatelessWidget {
  const _AppointmentTile({
    required this.item,
    required this.staffMode,
    required this.onCheckIn,
  });

  final AppointmentSummary item;
  final bool staffMode;
  final VoidCallback onCheckIn;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            Container(
              width: 56,
              height: 56,
              decoration: BoxDecoration(
                color: theme.colorScheme.primary.withValues(alpha: .12),
                borderRadius: BorderRadius.circular(18),
              ),
              child: Center(
                child: Text(
                  item.time,
                  style: theme.textTheme.labelLarge?.copyWith(
                    fontWeight: FontWeight.w700,
                    color: theme.colorScheme.primary,
                  ),
                ),
              ),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    item.title,
                    style: theme.textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    item.status,
                    style: theme.textTheme.bodyMedium?.copyWith(
                      color: theme.hintColor,
                    ),
                  ),
                ],
              ),
            ),
            if (staffMode)
              FilledButton(
                onPressed: onCheckIn,
                child: const Text('Check-in'),
              )
            else
              const Icon(Icons.chevron_right_rounded),
          ],
        ),
      ),
    );
  }
}

class PackagesView extends StatelessWidget {
  const PackagesView({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final packages = [
      ('Lazer Epilasyon', '5 seans kaldı', '₺1.950'),
      ('Dermal Boost', '2 bakım kaldı', '₺860'),
      ('Gold Facial', '1 özel paket', '₺1.200'),
    ];

    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        Text('Paketlerim', style: theme.textTheme.headlineSmall),
        const SizedBox(height: 18),
        for (final item in packages)
          Padding(
            padding: const EdgeInsets.only(bottom: 14),
            child: Card(
              child: ListTile(
                leading: CircleAvatar(
                  backgroundColor: theme.colorScheme.primary.withValues(alpha: .12),
                  child: const Icon(Icons.auto_awesome_rounded),
                ),
                title: Text(item.$1),
                subtitle: Text(item.$2),
                trailing: Text(item.$3, style: theme.textTheme.titleMedium),
              ),
            ),
          ),
      ],
    );
  }
}

class ProfileView extends StatelessWidget {
  const ProfileView({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        Card(
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Row(
              children: [
                Container(
                  width: 64,
                  height: 64,
                  decoration: const BoxDecoration(
                    shape: BoxShape.circle,
                    gradient: LinearGradient(
                      colors: [Color(0xFFE7D0A7), Color(0xFFB98A4B)],
                    ),
                  ),
                  child: const Icon(Icons.person_rounded, color: Colors.white),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Leyla Demir', style: theme.textTheme.titleLarge),
                      Text('Gold Member', style: theme.textTheme.bodyMedium?.copyWith(color: theme.hintColor)),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 18),
        const ListTile(
          leading: Icon(Icons.notifications_active_rounded),
          title: Text('Bildirim tercihleri'),
          trailing: Icon(Icons.chevron_right_rounded),
        ),
        const ListTile(
          leading: Icon(Icons.favorite_rounded),
          title: Text('Favoriler'),
          trailing: Icon(Icons.chevron_right_rounded),
        ),
        const ListTile(
          leading: Icon(Icons.privacy_tip_rounded),
          title: Text('KVKK / Gizlilik'),
          trailing: Icon(Icons.chevron_right_rounded),
        ),
      ],
    );
  }
}

class CustomersView extends StatelessWidget {
  const CustomersView({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final customers = [
      ('Zeynep A.', 'Lazer • 1 saat önce', 'Tamamlandı'),
      ('Nisa K.', 'Gold facial • 2 saat önce', 'Randevu bekliyor'),
      ('Mira T.', 'Cilt bakım • dün', 'İyi geri bildirim'),
    ];

    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        Text('Müşteriler', style: theme.textTheme.headlineSmall),
        const SizedBox(height: 18),
        for (final item in customers)
          Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: Card(
              child: ListTile(
                leading: CircleAvatar(
                  backgroundColor: theme.colorScheme.primary.withValues(alpha: .15),
                  child: const Icon(Icons.person_rounded),
                ),
                title: Text(item.$1),
                subtitle: Text(item.$2),
                trailing: Text(item.$3),
              ),
            ),
          ),
      ],
    );
  }
}

class KpiView extends StatelessWidget {
  const KpiView({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final stats = [
      ('Ciro', '₺42.800'),
      ('Doluluk', '%72'),
      ('Memnuniyet', '%96'),
    ];

    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        Text('KPI Özeti', style: theme.textTheme.headlineSmall),
        const SizedBox(height: 16),
        Wrap(
          spacing: 12,
          runSpacing: 12,
          children: [
            for (final stat in stats)
              SizedBox(
                width: 160,
                child: Card(
                  child: Padding(
                    padding: const EdgeInsets.all(18),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(stat.$1, style: theme.textTheme.bodyMedium?.copyWith(color: theme.hintColor)),
                        const SizedBox(height: 8),
                        Text(stat.$2, style: theme.textTheme.headlineSmall),
                      ],
                    ),
                  ),
                ),
              ),
          ],
        ),
      ],
    );
  }
}
