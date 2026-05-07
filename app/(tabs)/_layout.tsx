import React from 'react';
import { Tabs } from 'expo-router';
import { Hop as Home, Leaf, Bell, Settings } from 'lucide-react-native';
import { Colors, Typography } from '@/constants/theme';
import { useSimulation } from '@/hooks/useSimulation';
import { useAuthStore } from '@/store/authStore';

export default function TabsLayout() {
  const { user } = useAuthStore();
  useSimulation(user?.id);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary[600],
        tabBarInactiveTintColor: Colors.text.muted,
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: Typography.sizes.xs,
          fontWeight: Typography.weights.medium,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ size, color }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="plants"
        options={{
          title: 'My Plants',
          tabBarIcon: ({ size, color }) => <Leaf size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="alerts"
        options={{
          title: 'Alerts',
          tabBarIcon: ({ size, color }) => <Bell size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ size, color }) => <Settings size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
