import 'package:beauty/src/core/api_repository.dart';
import 'package:beauty/src/core/models.dart';
import 'package:beauty/src/core/session.dart';
import 'package:beauty/src/screens/booking_screen.dart';
import 'package:beauty/src/screens/home_screen.dart';
import 'package:beauty/src/screens/service_detail_screen.dart';
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
      GoRoute(
        path: '/service-detail/:appointmentId',
        builder: (context, state) => ServiceDetailScreen(
          appointmentId: state.pathParameters['appointmentId']!,
          appointment: state.extra is AppointmentSummary
              ? state.extra! as AppointmentSummary
              : null,
        ),
      ),
      GoRoute(
        path: '/booking',
        builder: (context, state) => const BookingScreen(),
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
      title: 'Odivon Beauty',
      debugShowCheckedModeBanner: false,
      themeMode: ThemeMode.system,
      theme: _theme(Brightness.light),
      darkTheme: _theme(Brightness.dark),
      routerConfig: router,
    );
  }

  ThemeData _theme(Brightness brightness) {
    final isDark = brightness == Brightness.dark;
    final background = isDark
        ? const Color(0xFF0B1120)
        : const Color(0xFFF8FAFC);
    final elevated = isDark ? const Color(0xFF111827) : const Color(0xFFFFFFFF);
    final border = isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0);
    final primary = const Color(0xFF6366F1);
    final primarySoft = isDark
        ? const Color(0xFF312E81)
        : const Color(0xFFE0E7FF);
    final text = isDark ? const Color(0xFFF8FAFC) : const Color(0xFF0F172A);
    final muted = isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B);

    return ThemeData(
      useMaterial3: true,
      brightness: brightness,
      scaffoldBackgroundColor: background,
      colorScheme: ColorScheme.fromSeed(
        seedColor: primary,
        brightness: brightness,
        primary: primary,
        onPrimary: Colors.white,
        secondary: const Color(0xFF8B5CF6),
        surface: elevated,
        onSurface: text,
      ),
      textTheme: ThemeData(brightness: brightness).textTheme.apply(
        bodyColor: text,
        displayColor: text,
        decorationColor: text,
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: Colors.transparent,
        elevation: 0,
        surfaceTintColor: Colors.transparent,
        iconTheme: IconThemeData(color: text),
        titleTextStyle: TextStyle(
          color: text,
          fontSize: 20,
          fontWeight: FontWeight.w600,
        ),
      ),
      cardTheme: CardThemeData(
        color: elevated,
        elevation: 0,
        margin: EdgeInsets.zero,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(24),
          side: BorderSide(color: border, width: 1),
        ),
      ),
      navigationBarTheme: NavigationBarThemeData(
        backgroundColor: isDark
            ? const Color(0xFF1C1817)
            : const Color(0xFFFDFBF8),
        elevation: 0,
        indicatorColor: primarySoft,
        labelTextStyle: WidgetStatePropertyAll(
          TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: text),
        ),
      ),
      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          backgroundColor: primary,
          foregroundColor: Colors.white,
          elevation: 0,
          padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 16),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(18),
          ),
          textStyle: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: elevated,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: BorderSide(color: border),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: BorderSide(color: border),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: BorderSide(color: primary, width: 1.5),
        ),
      ),
      dividerColor: border,
      chipTheme: ChipThemeData(
        backgroundColor: elevated,
        side: BorderSide(color: border),
        labelStyle: TextStyle(color: text),
      ),
      iconTheme: IconThemeData(color: text),
      hintColor: muted,
    );
  }
}
