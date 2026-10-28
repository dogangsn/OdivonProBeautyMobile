export type BeautyRole = 'customer' | 'specialist' | 'manager';

export type JsonRecord = Record<string, unknown>;

export const roleLabels: Record<BeautyRole, string> = {
  customer: 'Müşteri',
  specialist: 'Uzman',
  manager: 'Yönetici',
};

const productRoleLabels: Record<string, string> = {
  owner: 'İşletme sahibi',
  admin: 'Yönetici',
  manager: 'Şube yöneticisi',
  receptionist: 'Resepsiyon',
  specialist: 'Uzman',
  cashier: 'Kasa sorumlusu',
  customer: 'Müşteri',
  auditor: 'Denetçi',
};

export function productRoleLabel(productRole: string | undefined, role: BeautyRole | undefined): string {
  if (productRole && productRoleLabels[productRole]) return productRoleLabels[productRole];
  return role ? roleLabels[role] : '';
}

/** Maps the server-verified product role to the mobile shell. Never guessed from token claims. */
export function shellRoleFor(productRole: string): BeautyRole {
  switch (productRole) {
    case 'customer':
      return 'customer';
    case 'specialist':
    case 'receptionist':
    case 'cashier':
      return 'specialist';
    default:
      return 'manager';
  }
}

export type BeautySessionProfile = {
  uid: string;
  tenantId: string;
  tenantName: string;
  productRole: string;
  assigned: boolean;
  displayName: string;
  branchId?: string;
  branchName?: string;
  customerId?: string;
  staffId?: string;
  centerCode?: string;
};

const str = (value: unknown): string | undefined => (typeof value === 'string' ? value : undefined);

export function parseSessionProfile(json: JsonRecord): BeautySessionProfile {
  return {
    uid: str(json.uid) ?? '',
    tenantId: str(json.tenantId) ?? '',
    tenantName: str(json.tenantName) ?? 'OdivonPro Beauty',
    productRole: str(json.role) ?? '',
    assigned: json.assigned === true,
    displayName: str(json.displayName) ?? '',
    branchId: str(json.branchId),
    branchName: str(json.branchName),
    customerId: str(json.customerId),
    staffId: str(json.staffId),
    centerCode: str(json.centerCode),
  };
}

/** Loose record coming from a MainApi list endpoint. */
export class ApiRecord {
  constructor(readonly values: JsonRecord) {}

  get id(): string {
    return this.text('id');
  }

  text(key: string, fallback = ''): string {
    return str(this.values[key]) ?? fallback;
  }

  number(key: string, fallback = 0): number {
    const value = this.values[key];
    return typeof value === 'number' ? value : fallback;
  }

  date(key: string): Date | undefined {
    const value = this.text(key);
    if (!value) return undefined;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? undefined : date;
  }

  /** Best human-readable title for generic record lists and pickers. */
  get title(): string {
    return this.text('name', this.text('fullName', this.text('title', this.text('customerId', this.id))));
  }
}

export type AppointmentStatus = 'pending' | 'confirmed' | 'checked-in' | 'completed' | 'cancelled' | (string & {});

export type AppointmentSummary = {
  id: string;
  customerName: string;
  serviceName: string;
  startAt?: Date;
  endAt?: Date;
  status: AppointmentStatus;
  staffName: string;
  roomName: string;
  branchId: string;
};

export function appointmentFromRecord(record: ApiRecord): AppointmentSummary {
  return {
    id: record.id,
    customerName: record.text('customerName', record.text('customerId', 'Müşteri')),
    serviceName: record.text('serviceName', record.text('title', 'Bakım hizmeti')),
    startAt: record.date('startAt'),
    endAt: record.date('endAt'),
    status: record.text('status', 'pending'),
    staffName: record.text('staffName'),
    roomName: record.text('roomName'),
    branchId: record.text('branchId'),
  };
}

export type DashboardSummary = {
  appointments: number;
  customers: number;
  revenue: number;
  criticalStock: number;
  sessions: number;
  packages: number;
};

export function parseDashboard(json: JsonRecord): DashboardSummary {
  const num = (value: unknown) => (typeof value === 'number' ? value : 0);
  return {
    appointments: Math.trunc(num(json.appointments)),
    customers: Math.trunc(num(json.customers)),
    revenue: num(json.revenue),
    criticalStock: Math.trunc(num(json.criticalStock)),
    sessions: Math.trunc(num(json.sessions)),
    packages: Math.trunc(num(json.packages)),
  };
}

export const statusLabels: Record<string, string> = {
  pending: 'Bekliyor',
  confirmed: 'Onaylandı',
  'checked-in': 'Check-in yapıldı',
  completed: 'Tamamlandı',
  cancelled: 'İptal',
};

export const formatCurrency = (value: number) => `${value.toFixed(0)} TL`;
