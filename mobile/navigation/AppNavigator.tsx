// ============================================================
// mobile/navigation/AppNavigator.tsx
// Stack + bottom tab navigation — includes EditItem screen
// ============================================================
import React from 'react'
import { Text } from 'react-native'
import { NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createNativeStackNavigator } from '@react-navigation/native-stack'

import HomeScreen       from '../screens/HomeScreen'
import ShoppingScreen   from '../screens/ShoppingScreen'
import ExpiryScreen     from '../screens/ExpiryScreen'
import ProfileScreen    from '../screens/ProfileScreen'
import AddItemScreen    from '../screens/AddItemScreen'
import EditItemScreen   from '../screens/EditItemScreen'
import ItemDetailScreen from '../screens/ItemDetailScreen'

import { RootTabParamList, RootStackParamList } from '../types'

const Tab   = createBottomTabNavigator<RootTabParamList>()
const Stack = createNativeStackNavigator<RootStackParamList>()

function TabIcon({ icon, focused }: { icon: string; focused: boolean }) {
  return <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.4 }}>{icon}</Text>
}

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 0.5,
          borderTopColor: '#E8E8E8',
          paddingBottom: 6,
          paddingTop: 6,
          height: 64,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '500' },
        tabBarActiveTintColor: '#4A42B0',
        tabBarInactiveTintColor: '#AAA',
      }}
    >
      <Tab.Screen
        name="Home" component={HomeScreen}
        options={{
          tabBarLabel: 'Inventory',
          tabBarIcon: ({ focused }) => <TabIcon icon="🏠" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Shopping" component={ShoppingScreen}
        options={{
          tabBarLabel: 'Shopping',
          tabBarIcon: ({ focused }) => <TabIcon icon="🛒" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Expiry" component={ExpiryScreen}
        options={{
          tabBarLabel: 'Expiry',
          tabBarIcon: ({ focused }) => <TabIcon icon="📅" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Profile" component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ focused }) => <TabIcon icon="👤" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  )
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main"       component={TabNavigator} />
        <Stack.Screen name="AddItem"    component={AddItemScreen} />
        <Stack.Screen name="EditItem"   component={EditItemScreen} />
        <Stack.Screen name="ItemDetail" component={ItemDetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}