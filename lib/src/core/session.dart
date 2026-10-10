import 'package:beauty/src/core/models.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final sessionProvider = NotifierProvider<SessionController, AppSession>(
  SessionController.new,
);

final class SessionController extends Notifier<AppSession> {
  @override
  AppSession build() => const AppSession();

  void signInAs(BeautyRole role) => state = AppSession(role: role);
  void signOut() => state = const AppSession();
}
