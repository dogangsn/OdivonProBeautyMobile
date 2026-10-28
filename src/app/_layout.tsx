import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useSession } from '@/core/session';
import { usePalette } from '@/theme';

export default function RootLayout() {
  const [queryClient] = useState(
    () => new QueryClient({ defaultOptions: { queries: { retry: 1, staleTime: 30_000 } } }),
  );
  const start = useSession((state) => state.start);
  const status = useSession((state) => state.status);
  const palette = usePalette();

  useEffect(() => start(), [start]);

  // Drop cached business data when the user signs out (health and finance data stay in memory only).
  useEffect(() => {
    if (status === 'signedOut') queryClient.clear();
  }, [status, queryClient]);

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="auto" />
        {status === 'loading' ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.background }}>
            <ActivityIndicator color={palette.primary} />
          </View>
        ) : (
          <Stack
            screenOptions={{
              headerShadowVisible: false,
              headerStyle: { backgroundColor: palette.background },
              headerTintColor: palette.text,
              contentStyle: { backgroundColor: palette.background },
            }}
          >
            <Stack.Protected guard={status === 'signedIn'}>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="booking" options={{ title: 'Yeni randevu' }} />
              <Stack.Screen name="service-detail/[appointmentId]" options={{ title: 'Seans uygulaması' }} />
              <Stack.Screen name="records/[resource]" options={{ title: '' }} />
            </Stack.Protected>
            <Stack.Protected guard={status !== 'signedIn'}>
              <Stack.Screen name="sign-in" options={{ headerShown: false }} />
            </Stack.Protected>
          </Stack>
        )}
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
