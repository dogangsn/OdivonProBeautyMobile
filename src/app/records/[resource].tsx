import { Stack, useLocalSearchParams } from 'expo-router';

import { RecordList } from '@/components/RecordList';
import { managementResources } from '@/core/management';

export default function RecordsScreen() {
  const { resource } = useLocalSearchParams<{ resource: string }>();
  const item = managementResources.find((entry) => entry.resource === resource);
  return (
    <>
      <Stack.Screen options={{ title: '' }} />
      <RecordList resource={resource} title={item?.title ?? resource} icon={item?.icon ?? 'list'} edges={[]} />
    </>
  );
}
