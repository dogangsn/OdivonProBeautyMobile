import { Image } from 'react-native';

const logo = require('../../assets/images/odivon_beauty_logo.png');

export function BrandLogo({ size = 104 }: { size?: number }) {
  return (
    <Image
      source={logo}
      style={{ width: size, height: size }}
      resizeMode="contain"
      accessibilityLabel="Odivon Beauty logosu"
    />
  );
}
