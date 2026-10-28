import { Tabs } from 'expo-router';

import { Icon } from '@/components/Icon';
import { ALL_TAB_ROUTES, tabsByRole } from '@/core/navigation';
import { useSession } from '@/core/session';
import { usePalette } from '@/theme';

export default function TabsLayout() {
  const role = useSession((state) => state.role) ?? 'customer';
  const palette = usePalette();
  const visible = tabsByRole[role];
  const hidden = ALL_TAB_ROUTES.filter((name) => !visible.some((tab) => tab.name === name));

  return (
    <Tabs
      key={role}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: palette.primary,
        tabBarInactiveTintColor: palette.muted,
        tabBarStyle: { backgroundColor: palette.tabBar, borderTopColor: palette.border },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
        sceneStyle: { backgroundColor: palette.background },
      }}
    >
      {visible.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ color, size }) => <Icon name={tab.icon} color={color as string} size={size} />,
          }}
        />
      ))}
      {hidden.map((name) => (
        <Tabs.Screen key={name} name={name} options={{ href: null }} />
      ))}
    </Tabs>
  );
}
