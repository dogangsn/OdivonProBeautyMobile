// Icon fonts are loaded natively at runtime; in tests render the glyph name instead.
jest.mock('@expo/vector-icons/MaterialIcons', () => {
  const { Text } = jest.requireActual('react-native');
  const MaterialIcons = ({ name }: { name: string }) => <Text>{`icon:${name}`}</Text>;
  MaterialIcons.glyphMap = {};
  return { __esModule: true, default: MaterialIcons };
});

jest.mock('expo-linear-gradient', () => {
  const { View } = jest.requireActual('react-native');
  return { LinearGradient: View };
});
