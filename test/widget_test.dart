import 'package:beauty/src/app.dart';
import 'package:beauty/src/core/models.dart';
import 'package:beauty/src/core/session.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

void main() {
  testWidgets('shows role entry and opens customer shell', (tester) async {
    await tester.pumpWidget(const ProviderScope(child: BeautyApp()));
    await tester.pumpAndSettle();
    expect(find.text('Musteri olarak devam et'), findsOneWidget);
    await tester.tap(find.text('Musteri olarak devam et'));
    await tester.pumpAndSettle();
    expect(find.text('Musteri paneli'), findsOneWidget);
  });

  test('session applies role authorization state', () {
    final container = ProviderContainer();
    addTearDown(container.dispose);
    container.read(sessionProvider.notifier).signInAs(BeautyRole.specialist);
    expect(container.read(sessionProvider).role, BeautyRole.specialist);
  });
}
