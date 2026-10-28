import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { JsonRecord } from './models';
import { getBeautyApi } from './client';

const DAY = 24 * 60 * 60 * 1000;

export const queryKeys = {
  dashboard: ['dashboard'] as const,
  appointments: ['appointments'] as const,
  records: (resource: string) => ['records', resource] as const,
};

export function useDashboard() {
  return useQuery({ queryKey: queryKeys.dashboard, queryFn: () => getBeautyApi().dashboard() });
}

export function useAppointments() {
  return useQuery({
    queryKey: queryKeys.appointments,
    queryFn: () => {
      const now = Date.now();
      return getBeautyApi().appointments({ from: new Date(now - DAY), to: new Date(now + 30 * DAY) });
    },
  });
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
