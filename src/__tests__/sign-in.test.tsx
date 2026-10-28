import { fireEvent, render, screen } from '@testing-library/react-native';

import SignInScreen from '@/app/sign-in';

describe('sign-in screen', () => {
  it('shows customer and team authentication choices', async () => {
    await render(<SignInScreen />);
    expect(screen.getByText('Müşteri')).toBeTruthy();
    expect(screen.getByText('Ekip / Yönetici')).toBeTruthy();
    expect(screen.getByText('SMS kodu gönder')).toBeTruthy();
    expect(screen.getByText(/Tenant, rol ve müşteri/)).toBeTruthy();
  });

  it('switches to the team form', async () => {
    await render(<SignInScreen />);
    await fireEvent.press(screen.getByText('Ekip / Yönetici'));
    expect(screen.getByText('Güvenli giriş yap')).toBeTruthy();
    expect(screen.getByText('Şifremi unuttum')).toBeTruthy();
  });

  it('reports that authentication is unavailable without Firebase config', async () => {
    await render(<SignInScreen />);
    await fireEvent.press(screen.getByText('SMS kodu gönder'));
    expect(screen.getByText('Firebase mobil yapılandırması etkin değil.')).toBeTruthy();
  });
});
