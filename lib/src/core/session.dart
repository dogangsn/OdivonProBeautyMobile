import 'package:beauty/src/core/models.dart';
import 'package:beauty/src/core/api_repository.dart';
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
          _restoreFirebaseUser(user);
        }
      });
      ref.onDispose(subscription.cancel);
      return const AppSession(loading: true);
    }
    return const AppSession();
  }

  void signInAs(BeautyRole role) => state = AppSession(role: role);

  Future<void> _restoreFirebaseUser(User user) async {
    try {
      await acceptFirebaseUser(user);
    } on Object {
      // The sign-in screen reads the session error and lets the user retry or sign out.
    }
  }

  Future<void> acceptFirebaseUser(User user) async {
    state = const AppSession(loading: true);
    try {
      await user.getIdToken(true);
      final profile = await ref.read(repositoryProvider).session();
      if (!profile.assigned || profile.productRole.isEmpty) {
        throw StateError(
          'Hesabınız bir güzellik merkezi profiline bağlanmamış. Merkez yöneticinizden mobil erişim tanımlamasını isteyin.',
        );
      }
      state = AppSession(
        role: profile.shellRole,
        productRole: profile.productRole,
        displayName: profile.displayName.isNotEmpty
            ? profile.displayName
            : user.displayName ?? user.phoneNumber ?? user.email,
        tenantId: profile.tenantId,
        tenantName: profile.tenantName,
        centerCode: profile.centerCode,
        branchId: profile.branchId,
        branchName: profile.branchName,
        customerId: profile.customerId,
        staffId: profile.staffId,
      );
    } on Object catch (error) {
      state = AppSession(error: _message(error));
      rethrow;
    }
  }

  Future<void> signOut() async {
    if (Firebase.apps.isNotEmpty) await FirebaseAuth.instance.signOut();
    state = const AppSession();
  }
}

String _message(Object error) {
  final value = error.toString();
  return value.startsWith('Bad state: ') ? value.substring(11) : value;
}
