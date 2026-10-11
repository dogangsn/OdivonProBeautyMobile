import 'package:flutter/material.dart';

class BrandLogo extends StatelessWidget {
  const BrandLogo({
    super.key,
    this.size = 104,
    this.showText = false,
    this.textStyle,
  });

  final double size;
  final bool showText;
  final TextStyle? textStyle;

  @override
  Widget build(BuildContext context) {
    final effectiveStyle =
        textStyle ??
        Theme.of(context).textTheme.headlineSmall?.copyWith(
          fontWeight: FontWeight.w700,
          letterSpacing: 0.7,
        );

    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Image.asset(
          'assets/images/odivon_beauty_logo.png',
          width: size,
          height: size,
          fit: BoxFit.contain,
        ),
        if (showText) ...[
          const SizedBox(height: 20),
          Text('Odivon Beauty', style: effectiveStyle),
        ],
      ],
    );
  }
}
