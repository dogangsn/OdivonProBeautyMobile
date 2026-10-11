import 'package:beauty/src/core/api_repository.dart';
import 'package:beauty/src/core/models.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class ServiceDetailScreen extends ConsumerStatefulWidget {
  const ServiceDetailScreen({
    required this.appointmentId,
    this.appointment,
    super.key,
  });
  final String appointmentId;
  final AppointmentSummary? appointment;
  @override
  ConsumerState<ServiceDetailScreen> createState() =>
      _ServiceDetailScreenState();
}

class _ServiceDetailScreenState extends ConsumerState<ServiceDetailScreen> {
  final _zone = TextEditingController();
  final _energy = TextEditingController();
  final _duration = TextEditingController();
  final _reaction = TextEditingController();
  final _notes = TextEditingController();
  bool _saving = false;
  String? _error;

  @override
  void dispose() {
    _zone.dispose();
    _energy.dispose();
    _duration.dispose();
    _reaction.dispose();
    _notes.dispose();
    super.dispose();
  }

  Future<void> _complete() async {
    final appointment = widget.appointment;
    if (_zone.text.trim().isEmpty || appointment == null) {
      setState(() => _error = 'Randevu ve uygulama bolgesi zorunludur.');
      return;
    }
    setState(() {
      _saving = true;
      _error = null;
    });
    try {
      await ref.read(repositoryProvider).complete(widget.appointmentId, {
        'bodyZone': _zone.text.trim(),
        if (_energy.text.isNotEmpty)
          'energyJcm2': double.tryParse(_energy.text),
        'durationMin': int.tryParse(_duration.text) ?? 30,
        'reaction': _reaction.text.trim(),
        'notes': _notes.text.trim(),
        'products': <Object?>[],
      });
      if (mounted) Navigator.of(context).pop();
    } catch (error) {
      setState(() => _error = '$error');
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final appointment = widget.appointment;
    return Scaffold(
      appBar: AppBar(title: const Text('Seans uygulamasi')),
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
                    Text(
                      appointment?.serviceName ?? 'Randevu',
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      appointment?.customerName ?? widget.appointmentId,
                      style: TextStyle(color: Theme.of(context).hintColor),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 20),
            Text(
              'Uygulama parametreleri',
              style: Theme.of(
                context,
              ).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w800),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _zone,
              decoration: const InputDecoration(
                labelText: 'Vucut / uygulama bolgesi *',
                prefixIcon: Icon(Icons.accessibility_new_rounded),
              ),
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _energy,
                    keyboardType: TextInputType.number,
                    decoration: const InputDecoration(
                      labelText: 'Enerji J/cm2',
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: TextField(
                    controller: _duration,
                    keyboardType: TextInputType.number,
                    decoration: const InputDecoration(labelText: 'Sure (dk)'),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _reaction,
              maxLines: 3,
              decoration: const InputDecoration(
                labelText: 'Reaksiyon ve tolerans',
                alignLabelWithHint: true,
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _notes,
              maxLines: 4,
              decoration: const InputDecoration(
                labelText: 'Uzman seans notu',
                alignLabelWithHint: true,
              ),
            ),
            const SizedBox(height: 16),
            OutlinedButton.icon(
              onPressed: () {},
              icon: const Icon(Icons.add_a_photo_outlined),
              label: const Text('Oncesi / sonrasi fotograf ekle'),
            ),
            if (_error != null)
              Padding(
                padding: const EdgeInsets.only(top: 14),
                child: Text(
                  _error!,
                  style: TextStyle(color: Theme.of(context).colorScheme.error),
                ),
              ),
            const SizedBox(height: 24),
            FilledButton.icon(
              onPressed: _saving ? null : _complete,
              icon: _saving
                  ? const SizedBox(
                      width: 18,
                      height: 18,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : const Icon(Icons.task_alt_rounded),
              label: const Text('Seansi tamamla'),
            ),
          ],
        ),
      ),
    );
  }
}
