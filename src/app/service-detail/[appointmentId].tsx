import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button, Card, InlineError, SectionTitle, TextField } from '@/components/ui';
import { errorMessage } from '@/core/api';
import { useCompleteSession } from '@/core/queries';
import { usePalette } from '@/theme';

export default function ServiceDetailScreen() {
  const palette = usePalette();
  const { appointmentId, serviceName, customerName } = useLocalSearchParams<{
    appointmentId: string;
    serviceName?: string;
    customerName?: string;
  }>();
  const complete = useCompleteSession();
  const [zone, setZone] = useState('');
  const [energy, setEnergy] = useState('');
  const [duration, setDuration] = useState('');
  const [reaction, setReaction] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string>();

  const submit = () => {
    if (!zone.trim()) {
      setError('Uygulama bölgesi zorunludur.');
      return;
    }
    setError(undefined);
    const energyValue = Number.parseFloat(energy.replace(',', '.'));
    const durationValue = Number.parseInt(duration, 10);
    complete.mutate(
      {
        appointmentId,
        values: {
          bodyZone: zone.trim(),
          ...(Number.isFinite(energyValue) ? { energyJcm2: energyValue } : {}),
          durationMin: Number.isFinite(durationValue) ? durationValue : 30,
          reaction: reaction.trim(),
          notes: notes.trim(),
          products: [],
        },
      },
      { onSuccess: () => router.back(), onError: (err) => setError(errorMessage(err)) },
    );
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        <Card style={{ padding: 18, gap: 6 }}>
          <Text style={{ color: palette.text, fontSize: 20, fontWeight: '800' }}>{serviceName || 'Randevu'}</Text>
          <Text style={{ color: palette.muted }}>{customerName || appointmentId}</Text>
        </Card>
        <SectionTitle>Uygulama parametreleri</SectionTitle>
        <TextField label="Vücut / uygulama bölgesi *" icon="accessibility-new" value={zone} onChangeText={setZone} />
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <TextField label="Enerji J/cm²" keyboardType="decimal-pad" value={energy} onChangeText={setEnergy} />
          </View>
          <View style={{ flex: 1 }}>
            <TextField label="Süre (dk)" keyboardType="number-pad" value={duration} onChangeText={setDuration} />
          </View>
        </View>
        <TextField label="Reaksiyon ve tolerans" multiline value={reaction} onChangeText={setReaction} />
        <TextField label="Uzman seans notu" multiline value={notes} onChangeText={setNotes} />
        <Button
          variant="outlined"
          icon="add-a-photo"
          label="Öncesi / sonrası fotoğraf ekle"
          onPress={() => Alert.alert('Yakında', 'Fotoğraflar MainApi imzalı yükleme akışıyla eklenecek.')}
        />
        {error ? <InlineError message={error} /> : null}
        <Button label="Seansı tamamla" icon="task-alt" busy={complete.isPending} onPress={submit} style={{ marginTop: 10 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  body: { padding: 20, gap: 12, paddingBottom: 40 },
  row: { flexDirection: 'row', gap: 12 },
});
