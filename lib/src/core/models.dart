enum BeautyRole { customer, specialist, manager }

extension BeautyRoleLabel on BeautyRole {
  String get label => switch (this) {
    BeautyRole.customer => 'Musteri',
    BeautyRole.specialist => 'Uzman',
    BeautyRole.manager => 'Yonetici',
  };
}

final class AppSession {
  const AppSession({this.role});
  final BeautyRole? role;
  bool get isAuthenticated => role != null;
}

final class AppointmentSummary {
  const AppointmentSummary({
    required this.id,
    required this.title,
    required this.time,
    required this.status,
  });
  final String id;
  final String title;
  final String time;
  final String status;
}

final class ApiEnvelope<T> {
  const ApiEnvelope({
    required this.success,
    required this.data,
    required this.requestId,
  });
  final bool success;
  final T data;
  final String requestId;
}
