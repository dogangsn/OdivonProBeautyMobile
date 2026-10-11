import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';

final class AppBootstrap {
  static const firebaseEnabled = bool.fromEnvironment('ENABLE_FIREBASE');
  static const _apiKey = String.fromEnvironment('FIREBASE_API_KEY');
  static const _appId = String.fromEnvironment('FIREBASE_APP_ID');
  static const _messagingSenderId = String.fromEnvironment('FIREBASE_MESSAGING_SENDER_ID');
  static const _projectId = String.fromEnvironment('FIREBASE_PROJECT_ID');
  static const _storageBucket = String.fromEnvironment('FIREBASE_STORAGE_BUCKET');

  static Future<void> initialize() async {
    if (!firebaseEnabled) return;
    if ([_apiKey, _appId, _messagingSenderId, _projectId].any((value) => value.isEmpty)) {
      throw StateError('Firebase mobil derleme değişkenleri eksik.');
    }
    await Firebase.initializeApp(
      options: const FirebaseOptions(
        apiKey: _apiKey,
        appId: _appId,
        messagingSenderId: _messagingSenderId,
        projectId: _projectId,
        storageBucket: _storageBucket,
      ),
    );
    await FirebaseMessaging.instance.requestPermission(provisional: true);
  }
}
