import 'dart:convert';

import 'package:beauty/src/core/bootstrap.dart';
import 'package:beauty/src/core/models.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:http/http.dart' as http;

abstract interface class BeautyRepository {
  Future<List<AppointmentSummary>> appointments();
  Future<void> checkIn(String appointmentId);
}

final class MainApiBeautyRepository implements BeautyRepository {
  MainApiBeautyRepository({http.Client? client})
    : _client = client ?? http.Client();
  static const _baseUrl = String.fromEnvironment(
    'MAIN_API_URL',
    defaultValue: 'https://mainapi.odivon.com/api/v1/beauty',
  );
  final http.Client _client;

  Future<Map<String, String>> _headers() async {
    final token = AppBootstrap.firebaseEnabled
        ? await FirebaseAuth.instance.currentUser?.getIdToken()
        : null;
    return {
      'content-type': 'application/json',
      if (token != null) 'authorization': 'Bearer $token',
    };
  }

  @override
  Future<List<AppointmentSummary>> appointments() async {
    if (!AppBootstrap.firebaseEnabled) return _demoAppointments;
    final response = await _client.get(
      Uri.parse('$_baseUrl/appointments?limit=20'),
      headers: await _headers(),
    );
    if (response.statusCode >= 400) {
      throw StateError('MainApi ${response.statusCode}');
    }
    final body = jsonDecode(response.body) as Map<String, Object?>;
    final data = body['data'] as List<Object?>? ?? const [];
    return data
        .map((item) {
          final value = item! as Map<String, Object?>;
          return AppointmentSummary(
            id: value['id']! as String,
            title: value['title'] as String? ?? 'Randevu',
            time: value['startAt']! as String,
            status: value['status']! as String,
          );
        })
        .toList(growable: false);
  }

  @override
  Future<void> checkIn(String appointmentId) async {
    if (!AppBootstrap.firebaseEnabled) return;
    final response = await _client.post(
      Uri.parse('$_baseUrl/appointments/$appointmentId/check-in'),
      headers: await _headers(),
      body: jsonEncode({'branchId': 'active-branch'}),
    );
    if (response.statusCode >= 400) throw StateError('Check-in failed');
  }
}

const _demoAppointments = [
  AppointmentSummary(
    id: 'apt-1',
    title: 'Lazer Epilasyon - Bacak',
    time: '10:00',
    status: 'confirmed',
  ),
  AppointmentSummary(
    id: 'apt-2',
    title: 'Cilt Bakimi',
    time: '11:30',
    status: 'checked-in',
  ),
  AppointmentSummary(
    id: 'apt-3',
    title: 'Masaj',
    time: '14:00',
    status: 'pending',
  ),
];
