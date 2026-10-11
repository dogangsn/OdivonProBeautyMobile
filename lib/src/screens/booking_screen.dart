import 'package:flutter/material.dart';

class BookingScreen extends StatelessWidget {
  const BookingScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final dates = ['15 Eki', '16 Eki', '17 Eki', '18 Eki'];
    final times = ['10:00', '11:30', '13:00', '15:30', '17:00'];

    return Scaffold(
      appBar: AppBar(
        title: const Text('Randevu oluştur'),
      ),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(20),
          children: [
            Card(
              child: Padding(
                padding: const EdgeInsets.all(18),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Golden Glow Facial', style: theme.textTheme.titleLarge),
                    const SizedBox(height: 8),
                    Text('60 dakika • 1 uzman', style: theme.textTheme.bodyMedium?.copyWith(color: theme.hintColor)),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),
            Text('Tarih seçin', style: theme.textTheme.titleMedium),
            const SizedBox(height: 12),
            Wrap(
              spacing: 10,
              runSpacing: 10,
              children: [
                for (final date in dates)
                  ChoiceChip(
                    label: Text(date),
                    selected: date == '16 Eki',
                    onSelected: (_) {},
                  ),
              ],
            ),
            const SizedBox(height: 24),
            Text('Saat seçin', style: theme.textTheme.titleMedium),
            const SizedBox(height: 12),
            Wrap(
              spacing: 10,
              runSpacing: 10,
              children: [
                for (final time in times)
                  FilterChip(
                    label: Text(time),
                    selected: time == '11:30',
                    onSelected: (_) {},
                  ),
              ],
            ),
            const SizedBox(height: 24),
            TextField(
              maxLines: 3,
              decoration: const InputDecoration(
                hintText: 'Eklemek istediğiniz notlar',
              ),
            ),
            const SizedBox(height: 28),
            FilledButton.icon(
              onPressed: () {},
              icon: const Icon(Icons.check_rounded),
              label: const Text('Randevuyu onayla'),
            ),
          ],
        ),
      ),
    );
  }
}
