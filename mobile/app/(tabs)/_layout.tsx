import { Tabs } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { Home, Mic, FileText, Trophy, User } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  return (
    <>
      <StatusBar style="light" backgroundColor="#0d1f1a" />
      <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#29a38b',
        tabBarInactiveTintColor: '#737a8d',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginBottom: 4,
        },
        tabBarStyle: {
          paddingBottom: insets.bottom ? insets.bottom : 8,
          paddingTop: 8,
          height: insets.bottom ? 65 + insets.bottom : 65,
          backgroundColor: '#0d1f1a',
          borderTopWidth: 1,
          borderTopColor: 'rgba(255,255,255,0.05)',
          elevation: 0,
          shadowOpacity: 0
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ focused }) => (
            <TabIcon Icon={Home} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="ai-tutor"
        options={{
          title: 'Tutor',
          tabBarIcon: ({ focused }) => (
            <TabIcon Icon={Mic} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="mock-exam"
        options={{
          title: 'Exams',
          tabBarIcon: ({ focused }) => (
            <TabIcon Icon={FileText} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="leaderboard"
        options={{
          title: 'Rank',
          tabBarIcon: ({ focused }) => (
            <TabIcon Icon={Trophy} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => (
            <TabIcon Icon={User} focused={focused} />
          ),
        }}
      />
    </Tabs>
    </>
  );
}

// Custom Icon wrapper to ensure stroke width changes perfectly on focus
const TabIcon = ({ Icon, focused }: { Icon: any; focused: boolean }) => {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Icon 
        size={24} 
        color={focused ? '#29a38b' : '#737a8d'} 
        strokeWidth={focused ? 2.5 : 2}
      />
    </View>
  );
};
