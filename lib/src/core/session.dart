import 'package:beauty/src/core/models.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final sessionProvider = NotifierProvider<SessionController, AppSession>(
  SessionController.new,
);

final class SessionController extends Notifier<AppSession> {
  @override
  AppSession build() {
    if (Firebase.apps.isNotEmpty) {
      final subscription = FirebaseAuth.instance.authStateChanges().listen((
        user,
      ) {
        if (user == null) {
          state = const AppSession();
        } else {
          acceptFirebaseUser(user);
        }
      });
      ref.onDispose(subscription.cancel);
      return const AppSession(loading: true);
    }
    return const AppSession();
  }

  void signInAs(BeautyRole role) => state = AppSession(role: role);
  Future<void> acceptFirebaseUser(User user) async {
    state = const AppSession(loading: true);
    final token = await user.getIdTokenResult(true);
    final rawRole = token.claims?['beautyRole'] ?? token.claims?['role'];
    final role = switch (rawRole) {
      'owner' || 'admin' || 'manager' => BeautyRole.manager,
      'specialist' || 'receptionist' || 'cashier' => BeautyRole.specialist,
      _ => BeautyRole.customer,
    };
    state = AppSession(
      role: role,
      displayName: user.displayName ?? user.phoneNumber ?? user.email,
    );
  }

  Future<void> signOut() async {
    if (Firebase.apps.isNotEmpty) await FirebaseAuth.instance.signOut();
    state = const AppSession();
  }
}
