import 'dart:convert';

import 'package:beauty/src/core/bootstrap.dart';
import 'package:beauty/src/core/models.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:http/http.dart' as http;
import 'package:flutter_riverpod/flutter_riverpod.dart';

final repositoryProvider = Provider<BeautyRepository>(
  (ref) => MainApiBeautyRepository(),
);

abstract interface class BeautyRepository {
  Future<BeautySessionProfile> session();
  Future<List<ApiRecord>> list(String resource, {Map<String, String>? query});
  Future<List<AppointmentSummary>> appointments({DateTime? from, DateTime? to});
  Future<DashboardSummary> dashboard();
  Future<void> checkIn(String appointmentId, {required String branchId});
  Future<void> complete(String appointmentId, Map<String, Object?> values);
  Future<void> createAppointment(Map<String, Object?> values);
}

final class MainApiBeautyRepository implements BeautyRepository {
  MainApiBeautyRepository({http.Client? client})
    : _client = client ?? http.Client();

  static const _baseUrl = String.fromEnvironment(
    'MAIN_API_URL',
    defaultValue: 'https://mainapi.odivon.com/api/v1/beauty',
  );
  final http.Client _client;

  @override
  Future<BeautySessionProfile> session() async {
    final response = await _client.get(
      Uri.parse('$_baseUrl/me'),
      headers: await _headers(),
    );
    final data = _decode(response);
    if (data is! Map<String, Object?>) {
      throw const FormatException('Geçersiz oturum yanıtı.');
    }
    return BeautySessionProfile.fromJson(data);
  }

  Future<Map<String, String>> _headers() async {
    if (!AppBootstrap.firebaseEnabled) {
      throw StateError(
        'Firebase yapilandirmasi etkin degil. ENABLE_FIREBASE=true ile baslatin.',
      );
    }
    final token = await FirebaseAuth.instance.currentUser?.getIdToken();
    if (token == null || token.isEmpty) throw StateError('Oturum bulunamadi.');
    return {
      'content-type': 'application/json',
      'authorization': 'Bearer $token',
    };
  }

  @override
  Future<List<ApiRecord>> list(
    String resource, {
    Map<String, String>? query,
  }) async {
    final uri = Uri.parse(
      '$_baseUrl/$resource',
    ).replace(queryParameters: {'limit': '100', ...?query});
    final response = await _client.get(uri, headers: await _headers());
    final data = _decode(response);
    if (data is! List<Object?>) return const [];
    return data
        .whereType<Map<String, Object?>>()
        .map(ApiRecord.new)
        .toList(growable: false);
  }

  @override
  Future<List<AppointmentSummary>> appointments({
    DateTime? from,
    DateTime? to,
  }) async {
    final records = await list(
      'appointments',
      query: {
        if (from != null) 'from': from.toUtc().toIso8601String(),
        if (to != null) 'to': to.toUtc().toIso8601String(),
      },
    );
    return records.map(AppointmentSummary.fromRecord).toList(growable: false);
  }

  @override
  Future<DashboardSummary> dashboard() async {
    final response = await _client.get(
      Uri.parse('$_baseUrl/reports/dashboard'),
      headers: await _headers(),
    );
    final data = _decode(response);
    if (data is! Map<String, Object?>) {
      throw const FormatException('Gecersiz dashboard yaniti.');
    }
    return DashboardSummary(
      appointments: _integer(data['appointments']),
      customers: _integer(data['customers']),
      revenue: _double(data['revenue']),
      criticalStock: _integer(data['criticalStock']),
      sessions: _integer(data['sessions']),
      packages: _integer(data['packages']),
    );
  }

  @override
  Future<void> checkIn(String appointmentId, {required String branchId}) =>
      _post('appointments/$appointmentId/check-in', {'branchId': branchId});

  @override
  Future<void> complete(String appointmentId, Map<String, Object?> values) =>
      _post('appointments/$appointmentId/complete', {
        ...values,
        'idempotencyKey': _idempotencyKey(),
      });

  @override
  Future<void> createAppointment(Map<String, Object?> values) =>
      _post('appointments', {...values, 'idempotencyKey': _idempotencyKey()});

  Future<void> _post(String path, Map<String, Object?> values) async {
    final response = await _client.post(
      Uri.parse('$_baseUrl/$path'),
      headers: await _headers(),
      body: jsonEncode(values),
    );
    _decode(response);
  }

  Object? _decode(http.Response response) {
    Object? decoded;
    try {
      decoded = jsonDecode(response.body);
    } on FormatException {
      decoded = null;
    }
    if (response.statusCode >= 400) {
      final message =
          decoded is Map<String, Object?> && decoded['message'] is String
          ? decoded['message']! as String
          : 'MainApi istegi tamamlanamadi (${response.statusCode}).';
      throw StateError(message);
    }
    if (decoded is! Map<String, Object?>) {
      throw const FormatException('Gecersiz MainApi yaniti.');
    }
    return decoded['data'];
  }

  static int _integer(Object? value) => value is num ? value.toInt() : 0;
  static double _double(Object? value) => value is num ? value.toDouble() : 0;
  static String _idempotencyKey() =>
      '${DateTime.now().microsecondsSinceEpoch}-${identityHashCode(Object())}';
}
