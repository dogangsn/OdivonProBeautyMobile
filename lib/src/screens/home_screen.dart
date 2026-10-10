import 'package:beauty/src/app.dart';
import 'package:beauty/src/core/models.dart';
import 'package:beauty/src/core/session.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

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
            ('Randevular', Icons.calendar_month),
            ('Paketler', Icons.card_membership),
            ('Profil', Icons.person),
          ]
        : const [
            ('Bugun', Icons.today),
            ('Musteriler', Icons.people_outline),
            ('KPI', Icons.insights),
          ];
    return Scaffold(
      appBar: AppBar(
        title: Text('${widget.role.label} paneli'),
        actions: [
          IconButton(
            tooltip: 'Cikis yap',
            onPressed: () => ref.read(sessionProvider.notifier).signOut(),
            icon: const Icon(Icons.logout),
          ),
        ],
      ),
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
            return const Center(child: CircularProgressIndicator());
          }
          return ListView.separated(
            padding: const EdgeInsets.all(16),
            itemCount: items.length + 1,
            separatorBuilder: (_, _) => const SizedBox(height: 12),
            itemBuilder: (context, index) {
              if (index == 0) return _HeroCard(staffMode: staffMode);
              final item = items[index - 1];
              return Card(
                child: ListTile(
                  leading: CircleAvatar(child: Text(item.time)),
                  title: Text(item.title),
                  subtitle: Text(item.status),
                  trailing: staffMode
                      ? FilledButton(
                          onPressed: () =>
                              ref.read(repositoryProvider).checkIn(item.id),
                          child: const Text('Check-in'),
                        )
                      : const Icon(Icons.chevron_right),
                ),
              );
            },
          );
        },
      );
}

class _HeroCard extends StatelessWidget {
  const _HeroCard({required this.staffMode});
  final bool staffMode;
  @override
  Widget build(BuildContext context) => Card(
    color: Theme.of(context).colorScheme.primaryContainer,
    child: Padding(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            staffMode
                ? 'Bugunun akisina hazirsiniz'
                : 'Bakiminiz planli, gununuz rahat',
            style: Theme.of(context).textTheme.titleLarge,
          ),
          const SizedBox(height: 8),
          Text(
            staffMode
                ? '8 randevu, %72 doluluk'
                : 'Siradaki randevunuz 15 Ekim 10:00',
          ),
        ],
      ),
    ),
  );
}

class PackagesView extends StatelessWidget {
  const PackagesView({super.key});
  @override
  Widget build(BuildContext context) =>
      const Center(child: Text('Aktif paket: Lazer Epilasyon - 5 seans kaldi'));
}

class ProfileView extends StatelessWidget {
  const ProfileView({super.key});
  @override
  Widget build(BuildContext context) =>
      const Center(child: Text('Sadakat, bildirim ve KVKK tercihleri'));
}

class CustomersView extends StatelessWidget {
  const CustomersView({super.key});
  @override
  Widget build(BuildContext context) =>
      const Center(child: Text('Yetkili musteri gecmisi ve seans notlari'));
}

class KpiView extends StatelessWidget {
  const KpiView({super.key});
  @override
  Widget build(BuildContext context) =>
      const Center(child: Text('Ciro, doluluk ve memnuniyet KPI ozeti'));
}
