import 'package:beauty/src/core/api_repository.dart';
import 'package:beauty/src/core/session.dart';
import 'package:beauty/src/screens/home_screen.dart';
import 'package:beauty/src/screens/sign_in_screen.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

final repositoryProvider = Provider<BeautyRepository>(
  (ref) => MainApiBeautyRepository(),
);

final routerProvider = Provider<GoRouter>((ref) {
  final session = ref.watch(sessionProvider);
  return GoRouter(
    initialLocation: session.isAuthenticated ? '/home' : '/sign-in',
    redirect: (context, state) {
      final signingIn = state.matchedLocation == '/sign-in';
      if (!session.isAuthenticated && !signingIn) return '/sign-in';
      if (session.isAuthenticated && signingIn) return '/home';
      return null;
    },
    routes: [
      GoRoute(
        path: '/sign-in',
        builder: (context, state) => const SignInScreen(),
      ),
      GoRoute(
        path: '/home',
        builder: (context, state) => HomeScreen(role: session.role!),
      ),
    ],
  );
});

class BeautyApp extends ConsumerWidget {
  const BeautyApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(routerProvider);
    return MaterialApp.router(
      title: 'OdivonPro Guzellik Merkezi',
      debugShowCheckedModeBanner: false,
      themeMode: ThemeMode.system,
      theme: _theme(Brightness.light),
      darkTheme: _theme(Brightness.dark),
      routerConfig: router,
    );
  }

  ThemeData _theme(Brightness brightness) => ThemeData(
    useMaterial3: true,
    brightness: brightness,
    colorScheme: ColorScheme.fromSeed(
      seedColor: const Color(0xff5b5bd6),
      brightness: brightness,
    ),
    cardTheme: const CardThemeData(margin: EdgeInsets.zero),
    inputDecorationTheme: const InputDecorationTheme(
      border: OutlineInputBorder(),
    ),
  );
}
