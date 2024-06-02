import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';

import ProfileScreen from './screens/ProfileScreen';
import InventoryScreen from './screens/InventoryScreen';
import ScheduleScreen from './screens/ScheduleScreen';
import DollarScreen from './screens/DollarScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName;

            if (route.name === 'Perfil') {
              iconName = 'person';
            } else if (route.name === 'Estoque') {
              iconName = 'store';
            } else if (route.name === 'Minha Agenda') {
              iconName = 'schedule';
            } else if (route.name === '$') {
              iconName = 'attach-money';
            }

            return <MaterialIcons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: 'tomato',
          tabBarInactiveTintColor: 'gray',
          tabBarStyle: [
            {
              display: 'flex',
            },
            null,
          ],
        })}
      >
        <Tab.Screen name="Perfil" component={ProfileScreen} />
        <Tab.Screen name="Estoque" component={InventoryScreen} />
        <Tab.Screen name="Minha Agenda" component={ScheduleScreen} />
        <Tab.Screen name="$" component={DollarScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
