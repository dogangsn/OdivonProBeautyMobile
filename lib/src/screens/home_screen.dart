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
    final destinations = switch (widget.role) {
      BeautyRole.customer => const [
        ('Ana sayfa', Icons.home_rounded),
        ('Randevu', Icons.calendar_month_rounded),
        ('Paketler', Icons.card_membership_rounded),
        ('Profil', Icons.person_rounded),
      ],
      BeautyRole.specialist => const [
        ('Bugun', Icons.today_rounded),
        ('Musteriler', Icons.people_rounded),
        ('Seans', Icons.spa_rounded),
        ('Bildirim', Icons.notifications_rounded),
      ],
      BeautyRole.manager => const [
        ('Ozet', Icons.space_dashboard_rounded),
        ('Operasyon', Icons.calendar_month_rounded),
        ('Finans', Icons.payments_rounded),
        ('Yonetim', Icons.apps_rounded),
      ],
    };
    final pages = switch (widget.role) {
      BeautyRole.customer => const [
        _OverviewPage(role: BeautyRole.customer),
        _AppointmentsPage(customerMode: true),
        _RecordPage(
          resource: 'customer-packages',
          title: 'Paketlerim',
          icon: Icons.card_membership_rounded,
        ),
        _ProfilePage(),
      ],
      BeautyRole.specialist => const [
        _AppointmentsPage(customerMode: false),
        _RecordPage(
          resource: 'customers',
          title: 'Musteriler',
          icon: Icons.people_rounded,
        ),
        _SessionHub(),
        _RecordPage(
          resource: 'notifications',
          title: 'Bildirimler',
          icon: Icons.notifications_rounded,
        ),
      ],
      BeautyRole.manager => const [
        _OverviewPage(role: BeautyRole.manager),
        _AppointmentsPage(customerMode: false),
        _FinancePage(),
        _ManagementPage(),
      ],
    };

    return Scaffold(
      body: IndexedStack(index: _index, children: pages),
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

class _PageHeader extends ConsumerWidget {
  const _PageHeader({
    required this.title,
    required this.subtitle,
    this.trailing,
  });
  final String title;
  final String subtitle;
  final Widget? trailing;

  @override
  Widget build(BuildContext context, WidgetRef ref) => Padding(
    padding: const EdgeInsets.fromLTRB(20, 18, 20, 18),
    child: Row(
      children: [
        const BrandLogo(size: 48),
        const SizedBox(width: 13),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: Theme.of(
                  context,
                ).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w800),
              ),
              Text(
                subtitle,
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: Theme.of(context).hintColor,
                ),
              ),
            ],
          ),
        ),
        trailing ??
            IconButton(
              tooltip: 'Cikis yap',
              onPressed: () => ref.read(sessionProvider.notifier).signOut(),
              icon: const Icon(Icons.logout_rounded),
            ),
      ],
    ),
  );
}

class _OverviewPage extends ConsumerWidget {
  const _OverviewPage({required this.role});
  final BeautyRole role;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final repository = ref.read(repositoryProvider);
    final session = ref.watch(sessionProvider);
    return SafeArea(
      child: RefreshIndicator(
        onRefresh: () async => (context as Element).markNeedsBuild(),
        child: FutureBuilder<DashboardSummary>(
          future: repository.dashboard(),
          builder: (context, snapshot) => CustomScrollView(
            slivers: [
              SliverToBoxAdapter(
                child: _PageHeader(
                  title: session.displayName ?? 'Odivon Beauty',
                  subtitle: role == BeautyRole.customer
                      ? 'Kisisel bakim merkeziniz'
                      : 'Canli operasyon merkezi',
                ),
              ),
              SliverPadding(
                padding: const EdgeInsets.fromLTRB(20, 0, 20, 30),
                sliver: SliverList.list(
                  children: [
                    _HeroPanel(role: role),
                    const SizedBox(height: 18),
                    if (snapshot.connectionState == ConnectionState.waiting)
                      const _LoadingCard()
                    else if (snapshot.hasError)
                      _ErrorCard(
                        error: snapshot.error,
                        retry: () => (context as Element).markNeedsBuild(),
                      )
                    else ...[
                      Text(
                        role == BeautyRole.customer
                            ? 'Hesap ozeti'
                            : 'Bugunun nabzi',
                        style: Theme.of(context).textTheme.titleMedium
                            ?.copyWith(fontWeight: FontWeight.w800),
                      ),
                      const SizedBox(height: 12),
                      GridView.count(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        crossAxisCount: 2,
                        childAspectRatio: 1.55,
                        mainAxisSpacing: 12,
                        crossAxisSpacing: 12,
                        children: [
                          _MetricCard(
                            label: 'Randevu',
                            value: '${snapshot.data?.appointments ?? 0}',
                            icon: Icons.calendar_month_rounded,
                            color: const Color(0xFF6366F1),
                          ),
                          _MetricCard(
                            label: role == BeautyRole.customer
                                ? 'Musteri kaydi'
                                : 'Musteriler',
                            value: '${snapshot.data?.customers ?? 0}',
                            icon: Icons.groups_rounded,
                            color: const Color(0xFF0EA5E9),
                          ),
                          _MetricCard(
                            label: 'Ciro',
                            value: _currency(snapshot.data?.revenue ?? 0),
                            icon: Icons.trending_up_rounded,
                            color: const Color(0xFF10B981),
                          ),
                          _MetricCard(
                            label: 'Kritik stok',
                            value: '${snapshot.data?.criticalStock ?? 0}',
                            icon: Icons.inventory_2_rounded,
                            color: const Color(0xFFF59E0B),
                          ),
                        ],
                      ),
                    ],
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _HeroPanel extends StatelessWidget {
  const _HeroPanel({required this.role});
  final BeautyRole role;

  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.all(22),
    decoration: BoxDecoration(
      borderRadius: BorderRadius.circular(28),
      gradient: const LinearGradient(
        colors: [Color(0xFF4338CA), Color(0xFF8B5CF6)],
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
      ),
    ),
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Icon(Icons.auto_awesome_rounded, color: Colors.white),
        const SizedBox(height: 20),
        Text(
          role == BeautyRole.customer
              ? 'Bakim yolculugunuzu planlayin'
              : 'Merkeziniz bugune hazir',
          style: Theme.of(context).textTheme.headlineSmall?.copyWith(
            color: Colors.white,
            fontWeight: FontWeight.w800,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          role == BeautyRole.customer
              ? 'Musait saatleri gorun, paketinizi takip edin ve randevunuzu yonetin.'
              : 'Randevu, kasa, ekip ve stok sinyalleri tek mobil gorunumde.',
          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
            color: Colors.white.withValues(alpha: .82),
            height: 1.45,
          ),
        ),
        const SizedBox(height: 18),
        FilledButton.icon(
          onPressed: () => context.push('/booking'),
          style: FilledButton.styleFrom(
            backgroundColor: Colors.white,
            foregroundColor: const Color(0xFF4F46E5),
          ),
          icon: const Icon(Icons.add_rounded),
          label: Text(
            role == BeautyRole.customer ? 'Randevu al' : 'Randevu olustur',
          ),
        ),
      ],
    ),
  );
}

class _AppointmentsPage extends ConsumerStatefulWidget {
  const _AppointmentsPage({required this.customerMode});
  final bool customerMode;

  @override
  ConsumerState<_AppointmentsPage> createState() => _AppointmentsPageState();
}

class _AppointmentsPageState extends ConsumerState<_AppointmentsPage> {
  late Future<List<AppointmentSummary>> _future;
  @override
  void initState() {
    super.initState();
    _load();
  }

  void _load() {
    final now = DateTime.now();
    _future = ref
        .read(repositoryProvider)
        .appointments(
          from: now.subtract(const Duration(days: 1)),
          to: now.add(const Duration(days: 30)),
        );
  }

  Future<void> _refresh() async {
    setState(_load);
    await _future;
  }

  @override
  Widget build(BuildContext context) => SafeArea(
    child: Column(
      children: [
        _PageHeader(
          title: widget.customerMode ? 'Randevularim' : 'Gunluk Randevular',
          subtitle: widget.customerMode
              ? 'Yaklasan ve gecmis bakimlar'
              : 'Check-in ve seans akisi',
          trailing: IconButton(
            tooltip: 'Yeni randevu',
            onPressed: () => context.push('/booking'),
            icon: const Icon(Icons.add_circle_outline_rounded),
          ),
        ),
        Expanded(
          child: FutureBuilder<List<AppointmentSummary>>(
            future: _future,
            builder: (context, snapshot) {
              if (snapshot.connectionState == ConnectionState.waiting) {
                return const Center(child: CircularProgressIndicator());
              }
              if (snapshot.hasError) {
                return _CenteredError(error: snapshot.error, retry: _refresh);
              }
              final items = snapshot.data ?? const [];
              if (items.isEmpty) {
                return _EmptyState(
                  icon: Icons.event_available_rounded,
                  title: 'Randevu bulunamadi',
                  message: 'Yeni randevu olusturdugunuzda burada gorunecek.',
                  actionLabel: 'Randevu olustur',
                  action: () => context.push('/booking'),
                );
              }
              return RefreshIndicator(
                onRefresh: _refresh,
                child: ListView.separated(
                  padding: const EdgeInsets.fromLTRB(20, 4, 20, 28),
                  itemCount: items.length,
                  separatorBuilder: (_, _) => const SizedBox(height: 12),
                  itemBuilder: (context, index) => _AppointmentCard(
                    item: items[index],
                    customerMode: widget.customerMode,
                    onChanged: _refresh,
                  ),
                ),
              );
            },
          ),
        ),
      ],
    ),
  );
}

class _AppointmentCard extends ConsumerWidget {
  const _AppointmentCard({
    required this.item,
    required this.customerMode,
    required this.onChanged,
  });
  final AppointmentSummary item;
  final bool customerMode;
  final Future<void> Function() onChanged;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final date = item.startAt;
    final time = date == null
        ? '--:--'
        : TimeOfDay.fromDateTime(date.toLocal()).format(context);
    final day = date == null
        ? 'Tarih yok'
        : '${date.toLocal().day}.${date.toLocal().month}.${date.toLocal().year}';
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: 58,
              padding: const EdgeInsets.symmetric(vertical: 12),
              decoration: BoxDecoration(
                color: Theme.of(
                  context,
                ).colorScheme.primary.withValues(alpha: .1),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Column(
                children: [
                  Text(
                    time,
                    style: TextStyle(
                      color: Theme.of(context).colorScheme.primary,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                  const SizedBox(height: 3),
                  Text(day, style: Theme.of(context).textTheme.labelSmall),
                ],
              ),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    item.serviceName,
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    customerMode
                        ? (item.staffName.isEmpty
                              ? 'Uzman bilgisi bekleniyor'
                              : item.staffName)
                        : item.customerName,
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: Theme.of(context).hintColor,
                    ),
                  ),
                  const SizedBox(height: 10),
                  _StatusChip(status: item.status),
                ],
              ),
            ),
            if (!customerMode && item.status == 'confirmed')
              IconButton(
                tooltip: 'Check-in yap',
                onPressed: () async {
                  await ref
                      .read(repositoryProvider)
                      .checkIn(item.id, branchId: item.branchId);
                  await onChanged();
                },
                icon: const Icon(Icons.login_rounded),
              ),
            if (!customerMode && item.status == 'checked-in')
              IconButton(
                tooltip: 'Seans detayini ac',
                onPressed: () =>
                    context.push('/service-detail/${item.id}', extra: item),
                icon: const Icon(Icons.arrow_forward_rounded),
              ),
          ],
        ),
      ),
    );
  }
}

class _RecordPage extends ConsumerStatefulWidget {
  const _RecordPage({
    required this.resource,
    required this.title,
    required this.icon,
  });
  final String resource;
  final String title;
  final IconData icon;
  @override
  ConsumerState<_RecordPage> createState() => _RecordPageState();
}

class _RecordPageState extends ConsumerState<_RecordPage> {
  late Future<List<ApiRecord>> _future;
  @override
  void initState() {
    super.initState();
    _future = ref.read(repositoryProvider).list(widget.resource);
  }

  void _reload() => setState(
    () => _future = ref.read(repositoryProvider).list(widget.resource),
  );
  @override
  Widget build(BuildContext context) => SafeArea(
    child: Column(
      children: [
        _PageHeader(
          title: widget.title,
          subtitle: 'MainApi ile canli ve guvenli veri',
        ),
        Expanded(
          child: FutureBuilder<List<ApiRecord>>(
            future: _future,
            builder: (context, snapshot) {
              if (snapshot.connectionState == ConnectionState.waiting) {
                return const Center(child: CircularProgressIndicator());
              }
              if (snapshot.hasError) {
                return _CenteredError(
                  error: snapshot.error,
                  retry: () async => _reload(),
                );
              }
              final rows = snapshot.data ?? const [];
              if (rows.isEmpty) {
                return _EmptyState(
                  icon: widget.icon,
                  title: 'Kayit bulunamadi',
                  message: 'Yetkiniz kapsaminda goruntulenecek bir kayit yok.',
                );
              }
              return RefreshIndicator(
                onRefresh: () async {
                  _reload();
                  await _future;
                },
                child: ListView.separated(
                  padding: const EdgeInsets.fromLTRB(20, 4, 20, 28),
                  itemCount: rows.length,
                  separatorBuilder: (_, _) => const SizedBox(height: 10),
                  itemBuilder: (_, index) =>
                      _RecordTile(record: rows[index], icon: widget.icon),
                ),
              );
            },
          ),
        ),
      ],
    ),
  );
}

class _RecordTile extends StatelessWidget {
  const _RecordTile({required this.record, required this.icon});
  final ApiRecord record;
  final IconData icon;
  @override
  Widget build(BuildContext context) {
    final title = record.text(
      'name',
      record.text(
        'fullName',
        record.text('title', record.text('customerId', record.id)),
      ),
    );
    final subtitle = record.text(
      'status',
      record.text('phone', record.text('packageId', 'Kayit ayrintisi')),
    );
    final remaining = record.values['remainingSessions'];
    return Card(
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        leading: CircleAvatar(
          backgroundColor: Theme.of(
            context,
          ).colorScheme.primary.withValues(alpha: .1),
          child: Icon(icon, color: Theme.of(context).colorScheme.primary),
        ),
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.w700)),
        subtitle: Text(subtitle),
        trailing: remaining is num
            ? Text(
                '$remaining kalan',
                style: const TextStyle(fontWeight: FontWeight.w700),
              )
            : const Icon(Icons.chevron_right_rounded),
      ),
    );
  }
}

class _SessionHub extends StatelessWidget {
  const _SessionHub();
  @override
  Widget build(BuildContext context) => SafeArea(
    child: ListView(
      padding: EdgeInsets.zero,
      children: [
        const _PageHeader(
          title: 'Seans Merkezi',
          subtitle: 'Uygulama, fotograf ve klinik notlari',
        ),
        Padding(
          padding: const EdgeInsets.fromLTRB(20, 0, 20, 30),
          child: Column(
            children: [
              _ActionCard(
                icon: Icons.play_circle_outline_rounded,
                title: 'Siradaki seansi baslat',
                detail: 'Check-in yapilmis randevudan seans formu acilir',
                onTap: () {},
              ),
              const SizedBox(height: 12),
              _ActionCard(
                icon: Icons.history_rounded,
                title: 'Seans gecmisi',
                detail: 'Uygulama parametreleri ve reaksiyon notlari',
                onTap: () {},
              ),
              const SizedBox(height: 12),
              _ActionCard(
                icon: Icons.photo_camera_outlined,
                title: 'Oncesi / sonrasi medya',
                detail: 'MainApi imzali yukleme akisi',
                onTap: () {},
              ),
            ],
          ),
        ),
      ],
    ),
  );
}

class _FinancePage extends StatelessWidget {
  const _FinancePage();
  @override
  Widget build(BuildContext context) => const _RecordPage(
    resource: 'payments',
    title: 'Finans Hareketleri',
    icon: Icons.payments_rounded,
  );
}

class _ManagementPage extends StatelessWidget {
  const _ManagementPage();
  @override
  Widget build(BuildContext context) {
    final actions = const [
      ('Personel', Icons.badge_rounded, '/staff'),
      ('Stok', Icons.inventory_2_rounded, '/products'),
      ('Kampanya', Icons.campaign_rounded, '/campaigns'),
      ('Komisyon', Icons.percent_rounded, '/commissions'),
      ('Cihazlar', Icons.developer_board_rounded, '/devices'),
      ('Raporlar', Icons.insights_rounded, '/reports'),
    ];
    return SafeArea(
      child: ListView(
        padding: EdgeInsets.zero,
        children: [
          const _PageHeader(
            title: 'Yonetim Merkezi',
            subtitle: 'Isletme operasyonlarina hizli erisim',
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 0, 20, 30),
            child: GridView.count(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              crossAxisCount: 2,
              mainAxisSpacing: 12,
              crossAxisSpacing: 12,
              children: [
                for (final action in actions)
                  _ManagementCard(
                    title: action.$1,
                    icon: action.$2,
                    resource: action.$3.substring(1),
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _ManagementCard extends StatelessWidget {
  const _ManagementCard({
    required this.title,
    required this.icon,
    required this.resource,
  });
  final String title;
  final IconData icon;
  final String resource;
  @override
  Widget build(BuildContext context) => Card(
    child: InkWell(
      borderRadius: BorderRadius.circular(22),
      onTap: () => Navigator.of(context).push(
        MaterialPageRoute<void>(
          builder: (_) => Scaffold(
            body: _RecordPage(resource: resource, title: title, icon: icon),
          ),
        ),
      ),
      child: Padding(
        padding: const EdgeInsets.all(18),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(icon, color: Theme.of(context).colorScheme.primary),
            const Spacer(),
            Text(
              title,
              style: Theme.of(
                context,
              ).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w800),
            ),
            const SizedBox(height: 4),
            Text(
              'Canli kayitlari ac',
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                color: Theme.of(context).hintColor,
              ),
            ),
          ],
        ),
      ),
    ),
  );
}

class _ProfilePage extends ConsumerWidget {
  const _ProfilePage();
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final session = ref.watch(sessionProvider);
    return SafeArea(
      child: ListView(
        padding: EdgeInsets.zero,
        children: [
          const _PageHeader(
            title: 'Profil ve Gizlilik',
            subtitle: 'Hesap, bildirim ve izinler',
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 0, 20, 30),
            child: Column(
              children: [
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(20),
                    child: Row(
                      children: [
                        CircleAvatar(
                          radius: 30,
                          backgroundColor: Theme.of(
                            context,
                          ).colorScheme.primary,
                          child: Text(
                            (session.displayName ?? 'O').characters.first
                                .toUpperCase(),
                            style: const TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.w800,
                            ),
                          ),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                session.displayName ?? 'Odivon kullanicisi',
                                style: Theme.of(context).textTheme.titleMedium
                                    ?.copyWith(fontWeight: FontWeight.w800),
                              ),
                              Text(
                                session.role?.label ?? '',
                                style: TextStyle(
                                  color: Theme.of(context).hintColor,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                const _ProfileTile(
                  icon: Icons.notifications_active_outlined,
                  title: 'Bildirim tercihleri',
                ),
                const _ProfileTile(
                  icon: Icons.favorite_outline_rounded,
                  title: 'Favori uzman',
                ),
                const _ProfileTile(
                  icon: Icons.privacy_tip_outlined,
                  title: 'KVKK ve acik riza',
                ),
                const _ProfileTile(
                  icon: Icons.download_outlined,
                  title: 'Verilerimi indir',
                ),
                const SizedBox(height: 16),
                OutlinedButton.icon(
                  onPressed: () => ref.read(sessionProvider.notifier).signOut(),
                  icon: const Icon(Icons.logout_rounded),
                  label: const Text('Guvenli cikis'),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _ProfileTile extends StatelessWidget {
  const _ProfileTile({required this.icon, required this.title});
  final IconData icon;
  final String title;
  @override
  Widget build(BuildContext context) => Card(
    child: ListTile(
      leading: Icon(icon),
      title: Text(title),
      trailing: const Icon(Icons.chevron_right_rounded),
    ),
  );
}

class _MetricCard extends StatelessWidget {
  const _MetricCard({
    required this.label,
    required this.value,
    required this.icon,
    required this.color,
  });
  final String label;
  final String value;
  final IconData icon;
  final Color color;
  @override
  Widget build(BuildContext context) => Card(
    child: Padding(
      padding: const EdgeInsets.all(14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 20, color: color),
          const Spacer(),
          Text(
            value,
            style: Theme.of(
              context,
            ).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w800),
          ),
          Text(
            label,
            style: Theme.of(
              context,
            ).textTheme.bodySmall?.copyWith(color: Theme.of(context).hintColor),
          ),
        ],
      ),
    ),
  );
}

class _ActionCard extends StatelessWidget {
  const _ActionCard({
    required this.icon,
    required this.title,
    required this.detail,
    required this.onTap,
  });
  final IconData icon;
  final String title;
  final String detail;
  final VoidCallback onTap;
  @override
  Widget build(BuildContext context) => Card(
    child: ListTile(
      onTap: onTap,
      contentPadding: const EdgeInsets.all(16),
      leading: CircleAvatar(
        backgroundColor: Theme.of(
          context,
        ).colorScheme.primary.withValues(alpha: .1),
        child: Icon(icon, color: Theme.of(context).colorScheme.primary),
      ),
      title: Text(title, style: const TextStyle(fontWeight: FontWeight.w800)),
      subtitle: Padding(
        padding: const EdgeInsets.only(top: 4),
        child: Text(detail),
      ),
      trailing: const Icon(Icons.chevron_right_rounded),
    ),
  );
}

class _StatusChip extends StatelessWidget {
  const _StatusChip({required this.status});
  final String status;
  @override
  Widget build(BuildContext context) {
    final color = switch (status) {
      'completed' => const Color(0xFF059669),
      'confirmed' => const Color(0xFF4F46E5),
      'checked-in' => const Color(0xFF0891B2),
      'cancelled' => const Color(0xFFE11D48),
      _ => const Color(0xFFD97706),
    };
    return Align(
      alignment: Alignment.centerLeft,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 5),
        decoration: BoxDecoration(
          color: color.withValues(alpha: .1),
          borderRadius: BorderRadius.circular(999),
        ),
        child: Text(
          status,
          style: TextStyle(
            color: color,
            fontSize: 11,
            fontWeight: FontWeight.w700,
          ),
        ),
      ),
    );
  }
}

class _LoadingCard extends StatelessWidget {
  const _LoadingCard();
  @override
  Widget build(BuildContext context) => const Card(
    child: Padding(
      padding: EdgeInsets.all(34),
      child: Center(child: CircularProgressIndicator()),
    ),
  );
}

class _ErrorCard extends StatelessWidget {
  const _ErrorCard({required this.error, required this.retry});
  final Object? error;
  final VoidCallback retry;
  @override
  Widget build(BuildContext context) => Card(
    child: Padding(
      padding: const EdgeInsets.all(20),
      child: Column(
        children: [
          Icon(
            Icons.cloud_off_rounded,
            color: Theme.of(context).colorScheme.error,
          ),
          const SizedBox(height: 10),
          Text('$error', textAlign: TextAlign.center),
          TextButton(onPressed: retry, child: const Text('Tekrar dene')),
        ],
      ),
    ),
  );
}

class _CenteredError extends StatelessWidget {
  const _CenteredError({required this.error, required this.retry});
  final Object? error;
  final Future<void> Function() retry;
  @override
  Widget build(BuildContext context) => Center(
    child: Padding(
      padding: const EdgeInsets.all(24),
      child: _ErrorCard(error: error, retry: retry),
    ),
  );
}

class _EmptyState extends StatelessWidget {
  const _EmptyState({
    required this.icon,
    required this.title,
    required this.message,
    this.actionLabel,
    this.action,
  });
  final IconData icon;
  final String title;
  final String message;
  final String? actionLabel;
  final VoidCallback? action;
  @override
  Widget build(BuildContext context) => Center(
    child: Padding(
      padding: const EdgeInsets.all(28),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 48, color: Theme.of(context).colorScheme.primary),
          const SizedBox(height: 14),
          Text(
            title,
            style: Theme.of(
              context,
            ).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w800),
          ),
          const SizedBox(height: 6),
          Text(
            message,
            textAlign: TextAlign.center,
            style: TextStyle(color: Theme.of(context).hintColor),
          ),
          if (action != null) ...[
            const SizedBox(height: 18),
            FilledButton(
              onPressed: action,
              child: Text(actionLabel ?? 'Devam et'),
            ),
          ],
        ],
      ),
    ),
  );
}

String _currency(num value) => '${value.toStringAsFixed(0)} TL';
