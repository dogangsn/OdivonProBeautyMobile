import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';

final class AppBootstrap {
  static const firebaseEnabled = bool.fromEnvironment('ENABLE_FIREBASE');

  static Future<void> initialize() async {
    if (!firebaseEnabled) return;
    await Firebase.initializeApp();
    await FirebaseMessaging.instance.requestPermission(provisional: true);
  }
}
