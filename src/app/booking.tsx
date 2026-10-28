import DateTimePicker, { DateTimePickerAndroid, type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useQueries } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, ErrorCard, InlineError, Loading, SelectField, TextField, type SelectOption } from '@/components/ui';
import { errorMessage } from '@/core/api';
import { getBeautyApi } from '@/core/client';
import type { ApiRecord } from '@/core/models';
import { queryKeys, useCreateAppointment } from '@/core/queries';
import { useSession } from '@/core/session';
import { usePalette } from '@/theme';

const APPOINTMENT_MINUTES = 60;
const dateTimeFormat = new Intl.DateTimeFormat('tr-TR', { dateStyle: 'full', timeStyle: 'short' });

const toOptions = (records: ApiRecord[] = []): SelectOption[] =>
  records.map((record) => ({ value: record.id, label: record.text('name', record.text('fullName', record.id)) }));

export default function BookingScreen() {
  const palette = usePalette();
  const session = useSession();
  const customerMode = session.role === 'customer';
  const createAppointment = useCreateAppointment();

  const resources = ['branches', 'services', 'staff', ...(customerMode ? [] : ['customers'])];
  const lookups = useQueries({
    queries: resources.map((resource) => ({
      queryKey: queryKeys.records(resource),
      queryFn: () => getBeautyApi().list(resource),
    })),
  });

  const [branchId, setBranchId] = useState(session.branchId);
  const [serviceId, setServiceId] = useState<string>();
  const [staffId, setStaffId] = useState<string>();
  const [customerId, setCustomerId] = useState(session.customerId);
  const [startAt, setStartAt] = useState<Date>();
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string>();
  const [iosPickerOpen, setIosPickerOpen] = useState(false);

  const pickDateTime = () => {
    const now = new Date();
    const initial = startAt ?? new Date(now.getTime() + 60 * 60 * 1000);
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: initial,
        mode: 'date',
        minimumDate: now,
        maximumDate: new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000),
        onChange: (event: DateTimePickerEvent, date?: Date) => {
          if (event.type !== 'set' || !date) return;
          DateTimePickerAndroid.open({
            value: date,
            mode: 'time',
            is24Hour: true,
            onChange: (timeEvent: DateTimePickerEvent, time?: Date) => {
              if (timeEvent.type === 'set' && time) setStartAt(time);
            },
          });
        },
      });
    } else {
      if (!startAt) setStartAt(initial);
      setIosPickerOpen(true);
    }
  };

  const save = () => {
    if (!branchId || !serviceId || !staffId || !customerId || !startAt) {
      setError('Şube, hizmet, uzman, müşteri ve tarih zorunludur.');
      return;
    }
    setError(undefined);
    createAppointment.mutate(
      {
        branchId,
        customerId,
        staffId,
        serviceIds: [serviceId],
        startAt: startAt.toISOString(),
        endAt: new Date(startAt.getTime() + APPOINTMENT_MINUTES * 60 * 1000).toISOString(),
        notes: notes.trim(),
        source: 'mobile',
      },
      { onSuccess: () => router.back(), onError: (err) => setError(errorMessage(err)) },
    );
  };

  if (lookups.some((query) => query.isPending)) return <Loading />;
  const failed = lookups.find((query) => query.isError);
  if (failed) {
    return (
      <View style={{ padding: 24 }}>
        <ErrorCard error={failed.error} onRetry={() => lookups.forEach((query) => void query.refetch())} />
      </View>
    );
  }
  const [branches, services, staff, customers] = lookups.map((query) => query.data);

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        <Text style={[styles.title, { color: palette.text }]}>Randevu bilgileri</Text>
        <Text style={{ color: palette.muted }}>Uygunluk ve çakışma kontrolleri MainApi tarafından yapılır.</Text>
        <SelectField label="Şube" value={branchId} options={toOptions(branches)} onChange={setBranchId} />
        <SelectField label="Hizmet" value={serviceId} options={toOptions(services)} onChange={setServiceId} />
        <SelectField label="Uzman" value={staffId} options={toOptions(staff)} onChange={setStaffId} />
        {!customerMode ? (
          <SelectField label="Müşteri" value={customerId} options={toOptions(customers)} onChange={setCustomerId} />
        ) : null}
        <Button
          variant="outlined"
          icon="event"
          label={startAt ? dateTimeFormat.format(startAt) : 'Tarih ve saat seçin'}
          onPress={pickDateTime}
        />
        <TextField label="Randevu notu" value={notes} onChangeText={setNotes} multiline numberOfLines={3} />
        {error ? <InlineError message={error} /> : null}
        <Button
          label="Uygunluğu kontrol et ve kaydet"
          icon="check"
          busy={createAppointment.isPending}
          onPress={save}
          style={{ marginTop: 10 }}
        />
      </ScrollView>
      {Platform.OS === 'ios' ? (
        <Modal visible={iosPickerOpen} transparent animationType="slide" onRequestClose={() => setIosPickerOpen(false)}>
          <View style={styles.backdrop} />
          <SafeAreaView edges={['bottom']} style={[styles.sheet, { backgroundColor: palette.surface }]}>
            <DateTimePicker
              value={startAt ?? new Date()}
              mode="datetime"
              display="inline"
              locale="tr-TR"
              minimumDate={new Date()}
              onChange={(_, date) => date && setStartAt(date)}
            />
            <Button label="Tamam" onPress={() => setIosPickerOpen(false)} style={{ margin: 16 }} />
          </SafeAreaView>
        </Modal>
      ) : null}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  body: { padding: 20, gap: 14, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: '800' },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)' },
  sheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingTop: 8 },
});
