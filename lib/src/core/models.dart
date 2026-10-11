enum BeautyRole { customer, specialist, manager }

extension BeautyRoleLabel on BeautyRole {
  String get label => switch (this) {
    BeautyRole.customer => 'Musteri',
    BeautyRole.specialist => 'Uzman',
    BeautyRole.manager => 'Yonetici',
  };
}

final class AppSession {
  const AppSession({this.role, this.displayName, this.loading = false});
  final BeautyRole? role;
  final String? displayName;
  final bool loading;
  bool get isAuthenticated => role != null;
}

final class ApiRecord {
  const ApiRecord(this.values);
  final Map<String, Object?> values;

  String get id => text('id');
  String text(String key, [String fallback = '']) =>
      values[key] is String ? values[key]! as String : fallback;
  num number(String key, [num fallback = 0]) =>
      values[key] is num ? values[key]! as num : fallback;
  DateTime? date(String key) => DateTime.tryParse(text(key));
}

final class AppointmentSummary {
  const AppointmentSummary({
    required this.id,
    required this.customerName,
    required this.serviceName,
    required this.startAt,
    required this.endAt,
    required this.status,
    this.staffName = '',
    this.roomName = '',
    this.branchId = '',
  });

  factory AppointmentSummary.fromRecord(ApiRecord record) => AppointmentSummary(
    id: record.id,
    customerName: record.text(
      'customerName',
      record.text('customerId', 'Musteri'),
    ),
    serviceName: record.text(
      'serviceName',
      record.text('title', 'Bakim hizmeti'),
    ),
    startAt: record.date('startAt'),
    endAt: record.date('endAt'),
    status: record.text('status', 'pending'),
    staffName: record.text('staffName'),
    roomName: record.text('roomName'),
    branchId: record.text('branchId'),
  );

  final String id;
  final String customerName;
  final String serviceName;
  final DateTime? startAt;
  final DateTime? endAt;
  final String status;
  final String staffName;
  final String roomName;
  final String branchId;
}

final class DashboardSummary {
  const DashboardSummary({
    required this.appointments,
    required this.customers,
    required this.revenue,
    required this.criticalStock,
  });
  final int appointments;
  final int customers;
  final double revenue;
  final int criticalStock;
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
