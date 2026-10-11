enum BeautyRole { customer, specialist, manager }

extension BeautyRoleLabel on BeautyRole {
  String get label => switch (this) {
    BeautyRole.customer => 'Musteri',
    BeautyRole.specialist => 'Uzman',
    BeautyRole.manager => 'Yonetici',
  };
}

final class AppSession {
  const AppSession({
    this.role,
    this.productRole,
    this.displayName,
    this.tenantId,
    this.tenantName,
    this.centerCode,
    this.branchId,
    this.branchName,
    this.customerId,
    this.staffId,
    this.loading = false,
    this.error,
  });
  final BeautyRole? role;
  final String? productRole;
  final String? displayName;
  final String? tenantId;
  final String? tenantName;
  final String? centerCode;
  final String? branchId;
  final String? branchName;
  final String? customerId;
  final String? staffId;
  final bool loading;
  final String? error;
  bool get isAuthenticated => role != null;
  String get roleLabel => switch (productRole) {
    'owner' => 'İşletme sahibi',
    'admin' => 'Yönetici',
    'manager' => 'Şube yöneticisi',
    'receptionist' => 'Resepsiyon',
    'specialist' => 'Uzman',
    'cashier' => 'Kasa sorumlusu',
    'customer' => 'Müşteri',
    'auditor' => 'Denetçi',
    _ => role?.label ?? '',
  };
}

final class BeautySessionProfile {
  const BeautySessionProfile({
    required this.uid,
    required this.tenantId,
    required this.tenantName,
    required this.productRole,
    required this.assigned,
    required this.displayName,
    this.branchId,
    this.branchName,
    this.customerId,
    this.staffId,
    this.centerCode,
  });

  factory BeautySessionProfile.fromJson(Map<String, Object?> json) =>
      BeautySessionProfile(
        uid: json['uid'] is String ? json['uid']! as String : '',
        tenantId: json['tenantId'] is String ? json['tenantId']! as String : '',
        tenantName: json['tenantName'] is String
            ? json['tenantName']! as String
            : 'OdivonPro Beauty',
        productRole: json['role'] is String ? json['role']! as String : '',
        assigned: json['assigned'] == true,
        displayName: json['displayName'] is String
            ? json['displayName']! as String
            : '',
        branchId: json['branchId'] is String ? json['branchId']! as String : null,
        branchName: json['branchName'] is String
            ? json['branchName']! as String
            : null,
        customerId: json['customerId'] is String
            ? json['customerId']! as String
            : null,
        staffId: json['staffId'] is String ? json['staffId']! as String : null,
        centerCode: json['centerCode'] is String
            ? json['centerCode']! as String
            : null,
      );

  final String uid;
  final String tenantId;
  final String tenantName;
  final String productRole;
  final bool assigned;
  final String displayName;
  final String? branchId;
  final String? branchName;
  final String? customerId;
  final String? staffId;
  final String? centerCode;

  BeautyRole get shellRole => switch (productRole) {
    'customer' => BeautyRole.customer,
    'specialist' || 'receptionist' || 'cashier' => BeautyRole.specialist,
    _ => BeautyRole.manager,
  };
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
    required this.sessions,
    required this.packages,
  });
  final int appointments;
  final int customers;
  final double revenue;
  final int criticalStock;
  final int sessions;
  final int packages;
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
