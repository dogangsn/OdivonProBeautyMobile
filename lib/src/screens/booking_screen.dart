import 'package:beauty/src/app.dart';
import 'package:beauty/src/core/models.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class BookingScreen extends ConsumerStatefulWidget {
  const BookingScreen({super.key});
  @override
  ConsumerState<BookingScreen> createState() => _BookingScreenState();
}

class _BookingScreenState extends ConsumerState<BookingScreen> {
  final _notes = TextEditingController();
  late Future<List<List<ApiRecord>>> _lookups;
  String? _branchId;
  String? _serviceId;
  String? _staffId;
  String? _customerId;
  DateTime? _startAt;
  bool _saving = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _lookups = _load();
  }

  @override
  void dispose() {
    _notes.dispose();
    super.dispose();
  }

  Future<List<List<ApiRecord>>> _load() => Future.wait([
    ref.read(repositoryProvider).list('branches'),
    ref.read(repositoryProvider).list('services'),
    ref.read(repositoryProvider).list('staff'),
    ref.read(repositoryProvider).list('customers'),
  ]);

  Future<void> _pickDateTime() async {
    final now = DateTime.now();
    final date = await showDatePicker(
      context: context,
      firstDate: now,
      lastDate: now.add(const Duration(days: 365)),
      initialDate: _startAt ?? now,
    );
    if (date == null || !mounted) return;
    final time = await showTimePicker(
      context: context,
      initialTime: TimeOfDay.fromDateTime(
        _startAt ?? now.add(const Duration(hours: 1)),
      ),
    );
    if (time != null) {
      setState(
        () => _startAt = DateTime(
          date.year,
          date.month,
          date.day,
          time.hour,
          time.minute,
        ),
      );
    }
  }

  Future<void> _save() async {
    if (_branchId == null ||
        _serviceId == null ||
        _staffId == null ||
        _customerId == null ||
        _startAt == null) {
      setState(
        () => _error = 'Sube, hizmet, uzman, musteri ve tarih zorunludur.',
      );
      return;
    }
    setState(() {
      _saving = true;
      _error = null;
    });
    try {
      await ref.read(repositoryProvider).createAppointment({
        'branchId': _branchId,
        'customerId': _customerId,
        'staffId': _staffId,
        'serviceIds': [_serviceId],
        'startAt': _startAt!.toUtc().toIso8601String(),
        'endAt': _startAt!
            .add(const Duration(minutes: 60))
            .toUtc()
            .toIso8601String(),
        'notes': _notes.text.trim(),
        'source': 'mobile',
      });
      if (mounted) Navigator.of(context).pop();
    } catch (error) {
      setState(() => _error = '$error');
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(title: const Text('Yeni randevu')),
    body: FutureBuilder<List<List<ApiRecord>>>(
      future: _lookups,
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(child: CircularProgressIndicator());
        }
        if (snapshot.hasError) {
          return Center(
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: Text('${snapshot.error}', textAlign: TextAlign.center),
            ),
          );
        }
        final values = snapshot.data!;
        return SafeArea(
          child: ListView(
            padding: const EdgeInsets.all(20),
            children: [
              Text(
                'Randevu bilgileri',
                style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                  fontWeight: FontWeight.w800,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'Uygunluk ve cakisma kontrolleri MainApi tarafinda yapilir.',
                style: TextStyle(color: Theme.of(context).hintColor),
              ),
              const SizedBox(height: 24),
              _Picker(
                label: 'Sube',
                value: _branchId,
                records: values[0],
                onChanged: (value) => setState(() => _branchId = value),
              ),
              const SizedBox(height: 14),
              _Picker(
                label: 'Hizmet',
                value: _serviceId,
                records: values[1],
                onChanged: (value) => setState(() => _serviceId = value),
              ),
              const SizedBox(height: 14),
              _Picker(
                label: 'Uzman',
                value: _staffId,
                records: values[2],
                onChanged: (value) => setState(() => _staffId = value),
              ),
              const SizedBox(height: 14),
              _Picker(
                label: 'Musteri',
                value: _customerId,
                records: values[3],
                onChanged: (value) => setState(() => _customerId = value),
              ),
              const SizedBox(height: 14),
              OutlinedButton.icon(
                onPressed: _pickDateTime,
                icon: const Icon(Icons.event_rounded),
                label: Padding(
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  child: Text(
                    _startAt == null
                        ? 'Tarih ve saat secin'
                        : '${MaterialLocalizations.of(context).formatFullDate(_startAt!)} · ${TimeOfDay.fromDateTime(_startAt!).format(context)}',
                  ),
                ),
              ),
              const SizedBox(height: 14),
              TextField(
                controller: _notes,
                maxLines: 3,
                decoration: const InputDecoration(
                  labelText: 'Randevu notu',
                  alignLabelWithHint: true,
                ),
              ),
              if (_error != null)
                Padding(
                  padding: const EdgeInsets.only(top: 14),
                  child: Text(
                    _error!,
                    style: TextStyle(
                      color: Theme.of(context).colorScheme.error,
                    ),
                  ),
                ),
              const SizedBox(height: 24),
              FilledButton.icon(
                onPressed: _saving ? null : _save,
                icon: _saving
                    ? const SizedBox(
                        width: 18,
                        height: 18,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : const Icon(Icons.check_rounded),
                label: const Text('Uygunlugu kontrol et ve kaydet'),
              ),
            ],
          ),
        );
      },
    ),
  );
}

class _Picker extends StatelessWidget {
  const _Picker({
    required this.label,
    required this.value,
    required this.records,
    required this.onChanged,
  });
  final String label;
  final String? value;
  final List<ApiRecord> records;
  final ValueChanged<String?> onChanged;
  @override
  Widget build(BuildContext context) => DropdownButtonFormField<String>(
    initialValue: value,
    decoration: InputDecoration(labelText: label),
    items: records
        .map(
          (record) => DropdownMenuItem(
            value: record.id,
            child: Text(
              record.text('name', record.text('fullName', record.id)),
            ),
          ),
        )
        .toList(growable: false),
    onChanged: onChanged,
  );
}
