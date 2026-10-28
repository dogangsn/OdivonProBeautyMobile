import { appConfig } from './config';

/** Minimal user shape the app needs from Firebase. */
export type AuthUser = {
  uid: string;
  displayName: string | null;
  email: string | null;
  phoneNumber: string | null;
  getIdToken(forceRefresh?: boolean): Promise<string>;
};

export type PhoneConfirmation = {
  confirm(code: string): Promise<void>;
};

/** Everything the app does with Firebase Authentication and Messaging. */
export interface AuthGateway {
  currentUser(): AuthUser | null;
  onAuthStateChanged(listener: (user: AuthUser | null) => void): () => void;
  signInWithEmail(email: string, password: string): Promise<void>;
  sendPasswordReset(email: string): Promise<void>;
  startPhoneSignIn(phoneNumber: string): Promise<PhoneConfirmation>;
  signOut(): Promise<void>;
  requestPushPermission(): Promise<void>;
}

/**
 * React Native Firebase is required lazily so a build without Firebase config
 * (safe unconfigured mode) never touches the native module.
 */
function createFirebaseGateway(): AuthGateway {
  /* eslint-disable @typescript-eslint/no-require-imports */
  const authModule = require('@react-native-firebase/auth') as typeof import('@react-native-firebase/auth');
  const messagingModule =
    require('@react-native-firebase/messaging') as typeof import('@react-native-firebase/messaging');
  /* eslint-enable @typescript-eslint/no-require-imports */
  const auth = authModule.getAuth();

  const wrap = (user: import('@react-native-firebase/auth').User): AuthUser => ({
    uid: user.uid,
    displayName: user.displayName,
    email: user.email,
    phoneNumber: user.phoneNumber,
    getIdToken: (forceRefresh) => authModule.getIdToken(user, forceRefresh),
  });

  return {
    currentUser: () => (auth.currentUser ? wrap(auth.currentUser) : null),
    onAuthStateChanged: (listener) =>
      authModule.onAuthStateChanged(auth, (user) => listener(user ? wrap(user) : null)),
    signInWithEmail: async (email, password) => {
      await authModule.signInWithEmailAndPassword(auth, email, password);
    },
    sendPasswordReset: (email) => authModule.sendPasswordResetEmail(auth, email),
    startPhoneSignIn: async (phoneNumber) => {
      const confirmation = await authModule.signInWithPhoneNumber(auth, phoneNumber);
      return {
        confirm: async (code) => {
          await confirmation.confirm(code);
        },
      };
    },
    signOut: () => authModule.signOut(auth),
    requestPushPermission: async () => {
      const messaging = messagingModule.getMessaging();
      await messagingModule.requestPermission(messaging, { provisional: true });
    },
  };
}

let gateway: AuthGateway | null | undefined;

/** Returns the Firebase gateway, or null when Firebase is not configured for this build. */
export function getAuthGateway(): AuthGateway | null {
  if (gateway === undefined) {
    gateway = appConfig.firebaseEnabled ? createFirebaseGateway() : null;
  }
  return gateway;
}

/** Test hook: swap the gateway for a fake. */
export function setAuthGateway(next: AuthGateway | null): void {
  gateway = next;
}

/** Human readable Turkish message for Firebase auth error codes. */
export function authErrorMessage(error: unknown): string {
  const code = typeof error === 'object' && error !== null && 'code' in error ? String(error.code) : '';
  switch (code) {
    case 'auth/invalid-email':
      return 'E-posta adresi geçersiz.';
    case 'auth/user-disabled':
      return 'Bu hesap devre dışı bırakılmış.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'E-posta veya şifre hatalı.';
    case 'auth/too-many-requests':
      return 'Çok fazla deneme yapıldı. Lütfen biraz sonra tekrar deneyin.';
    case 'auth/invalid-phone-number':
      return 'Telefon numarası geçersiz.';
    case 'auth/invalid-verification-code':
      return 'SMS kodu hatalı.';
    case 'auth/session-expired':
    case 'auth/code-expired':
      return 'SMS kodunun süresi doldu. Yeni kod isteyin.';
    case 'auth/network-request-failed':
      return 'Ağ bağlantısı kurulamadı.';
    default:
      return error instanceof Error && error.message ? error.message : 'Giriş tamamlanamadı.';
  }
}
