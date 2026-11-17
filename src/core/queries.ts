import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';

import { getBeautyApi } from './client';
import {
  appointmentFromRecord,
  namesById,
  withNames,
  type AppointmentSummary,
  type JsonRecord,
} from './models';

const DAY = 24 * 60 * 60 * 1000;

export const queryKeys = {
  dashboard: ['dashboard'] as const,
  appointments: ['appointments'] as const,
  records: (resource: string) => ['records', resource] as const,
};

export function useDashboard() {
  return useQuery({ queryKey: queryKeys.dashboard, queryFn: () => getBeautyApi().dashboard() });
}

/**
 * Appointments from yesterday to 30 days ahead, with customer, service and staff names
 * filled in from lookup lists. MainApi ignores from/to and stores only ids, so both the
 * range and the names are applied here. A lookup the caller may not read stays empty.
 */
export function useAppointments({ includeCustomers }: { includeCustomers: boolean }) {
  const records = useQuery({
    queryKey: queryKeys.appointments,
    queryFn: async () => {
      const now = Date.now();
      const from = new Date(now - DAY);
      const to = new Date(now + 30 * DAY);
      const items = await getBeautyApi().list('appointments', { from: from.toISOString(), to: to.toISOString() });
      return items.filter((record) => {
        const start = record.date('startAt');
        return !start || (start >= from && start <= to);
      });
    },
  });
  const [services, staff, customers] = useQueries({
    queries: ['services', 'staff', 'customers'].map((resource) => ({
      queryKey: queryKeys.records(resource),
      queryFn: () => getBeautyApi().list(resource),
      enabled: resource !== 'customers' || includeCustomers,
      retry: false,
    })),
  });

  const data = useMemo<AppointmentSummary[] | undefined>(() => {
    if (!records.data) return undefined;
    const lookup = {
      services: namesById(services.data),
      staff: namesById(staff.data),
      customers: namesById(customers.data),
    };
    return records.data
      .map((record) => withNames(appointmentFromRecord(record), record, lookup))
      .sort((a, b) => (a.startAt?.getTime() ?? 0) - (b.startAt?.getTime() ?? 0));
  }, [records.data, services.data, staff.data, customers.data]);

  return {
    data,
    isPending: records.isPending,
    isError: records.isError,
    error: records.error,
    isRefetching: records.isRefetching,
    refetch: () => Promise.all([records.refetch(), services.refetch(), staff.refetch()]),
  };
}

export function useRecords(resource: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.records(resource),
    queryFn: () => getBeautyApi().list(resource),
    enabled,
  });
}

function useInvalidateOperations() {
  const client = useQueryClient();
  return () =>
    Promise.all([
      client.invalidateQueries({ queryKey: queryKeys.appointments }),
      client.invalidateQueries({ queryKey: queryKeys.dashboard }),
    ]);
}

export function useCheckIn() {
  const invalidate = useInvalidateOperations();
  return useMutation({
    mutationFn: ({ appointmentId, branchId }: { appointmentId: string; branchId: string }) =>
      getBeautyApi().checkIn(appointmentId, branchId),
    onSuccess: invalidate,
  });
}

export function useCompleteSession() {
  const invalidate = useInvalidateOperations();
  return useMutation({
    mutationFn: ({ appointmentId, values }: { appointmentId: string; values: JsonRecord }) =>
      getBeautyApi().complete(appointmentId, values),
    onSuccess: invalidate,
  });
}

export function useCreateAppointment() {
  const invalidate = useInvalidateOperations();
  return useMutation({
    mutationFn: (values: JsonRecord) => getBeautyApi().createAppointment(values),
    onSuccess: invalidate,
  });
}
