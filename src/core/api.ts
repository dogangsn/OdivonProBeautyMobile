import { appConfig } from './config';
import {
  ApiRecord,
  appointmentFromRecord,
  parseDashboard,
  parseSessionProfile,
  type AppointmentSummary,
  type BeautySessionProfile,
  type DashboardSummary,
  type JsonRecord,
} from './models';

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export interface BeautyApi {
  session(): Promise<BeautySessionProfile>;
  connectCustomer(centerCode: string): Promise<void>;
  list(resource: string, query?: Record<string, string>): Promise<ApiRecord[]>;
  appointments(range?: { from?: Date; to?: Date }): Promise<AppointmentSummary[]>;
  dashboard(): Promise<DashboardSummary>;
  checkIn(appointmentId: string, branchId: string): Promise<void>;
  complete(appointmentId: string, values: JsonRecord): Promise<void>;
  createAppointment(values: JsonRecord): Promise<void>;
}

export type BeautyApiOptions = {
  baseUrl?: string;
  /** Returns a Firebase ID token, or null when nobody is signed in. */
  getToken: () => Promise<string | null>;
  fetch?: typeof fetch;
  idempotencyKey?: () => string;
};

const isRecord = (value: unknown): value is JsonRecord =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const defaultIdempotencyKey = () => `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;

/** Typed MainApi client. Bearer tokens are only ever sent to the `/api/v1/beauty` base URL. */
export function createBeautyApi(options: BeautyApiOptions): BeautyApi {
  const baseUrl = (options.baseUrl ?? appConfig.mainApiUrl).replace(/\/+$/, '');
  const doFetch = options.fetch ?? fetch;
  const idempotencyKey = options.idempotencyKey ?? defaultIdempotencyKey;

  async function headers(): Promise<Record<string, string>> {
    const token = await options.getToken();
    if (!token) throw new ApiError('Oturum bulunamadı.');
    return { 'content-type': 'application/json', authorization: `Bearer ${token}` };
  }

  async function decode(response: Response): Promise<unknown> {
    let body: unknown = null;
    try {
      body = JSON.parse(await response.text());
    } catch {
      body = null;
    }
    if (response.status >= 400) {
      const message =
        isRecord(body) && typeof body.message === 'string'
          ? body.message
          : `MainApi isteği tamamlanamadı (${response.status}).`;
      throw new ApiError(message, response.status);
    }
    if (!isRecord(body)) throw new ApiError('Geçersiz MainApi yanıtı.', response.status);
    return body.data;
  }

  async function get(path: string, query?: Record<string, string>): Promise<unknown> {
    const search = query && Object.keys(query).length > 0 ? `?${new URLSearchParams(query).toString()}` : '';
    const response = await doFetch(`${baseUrl}/${path}${search}`, { method: 'GET', headers: await headers() });
    return decode(response);
  }

  async function post(path: string, values: JsonRecord): Promise<unknown> {
    const response = await doFetch(`${baseUrl}/${path}`, {
      method: 'POST',
      headers: await headers(),
      body: JSON.stringify(values),
    });
    return decode(response);
  }

  const api: BeautyApi = {
    async session() {
      const data = await get('me');
      if (!isRecord(data)) throw new ApiError('Geçersiz oturum yanıtı.');
      return parseSessionProfile(data);
    },

    async connectCustomer(centerCode) {
      await post('mobile/connect', { centerCode: centerCode.trim().toUpperCase() });
    },

    async list(resource, query) {
      const data = await get(resource, { limit: '100', ...query });
      if (!Array.isArray(data)) return [];
      return data.filter(isRecord).map((value) => new ApiRecord(value));
    },

    async appointments(range) {
      const query: Record<string, string> = {};
      if (range?.from) query.from = range.from.toISOString();
      if (range?.to) query.to = range.to.toISOString();
      const records = await api.list('appointments', query);
      return records.map(appointmentFromRecord);
    },

    async dashboard() {
      const data = await get('reports/dashboard');
      if (!isRecord(data)) throw new ApiError('Geçersiz dashboard yanıtı.');
      return parseDashboard(data);
    },

    async checkIn(appointmentId, branchId) {
      await post(`appointments/${encodeURIComponent(appointmentId)}/check-in`, { branchId });
    },

    async complete(appointmentId, values) {
      await post(`appointments/${encodeURIComponent(appointmentId)}/complete`, {
        ...values,
        idempotencyKey: idempotencyKey(),
      });
    },

    async createAppointment(values) {
      await post('appointments', { ...values, idempotencyKey: idempotencyKey() });
    },
  };

  return api;
}

export function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}
