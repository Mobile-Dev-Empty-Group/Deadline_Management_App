import { Tabs } from 'expo-router';
import React from 'react';

import { HomeTabBar } from '@/components/home/HomeTabBar';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
      }}
      tabBar={props => <HomeTabBar {...props} />}>
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="calendar" options={{ title: 'Weekly Task' }} />
      <Tabs.Screen name="tasks" options={{ title: 'All Tasks' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}
