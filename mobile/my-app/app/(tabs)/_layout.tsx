import { Tabs } from 'expo-router';
import React from 'react';
import { View, Text } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useCart } from '@/context/CartContext';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { cartCount } = useCart();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="dishes"
        options={{
          title: 'Món ăn',
          tabBarIcon: ({ color }) => <Ionicons size={28} name="restaurant" color={color} />,
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Giỏ hàng',
          tabBarIcon: ({ color }) => (
            <View>
              <Ionicons size={28} name="cart" color={color} />
              {cartCount > 0 && (
                <View style={{
                  position: 'absolute',
                  right: -8,
                  top: -4,
                  backgroundColor: '#e74c3c',
                  borderRadius: 10,
                  minWidth: 20,
                  height: 20,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                  <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold' }}>
                    {cartCount > 99 ? '99+' : cartCount}
                  </Text>
                </View>
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Orders',
          tabBarIcon: ({ color }) => <Ionicons size={28} name="receipt" color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
          href: null, // Hide this tab
        }}
      />
    </Tabs>
  );
}
