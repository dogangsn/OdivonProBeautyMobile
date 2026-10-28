import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import type { ComponentProps } from 'react';

export type IconName = ComponentProps<typeof MaterialIcons>['name'];

export function Icon(props: ComponentProps<typeof MaterialIcons>) {
  return <MaterialIcons size={22} {...props} />;
}
