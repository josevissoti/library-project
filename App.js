import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { testFirebaseConnection } from './src/services/testFirebase';

import HomeScreen from './screens/HomeScreen.js';
import LoginScreen from './screens/LoginScreen.js';
import RegisterScreen from './screens/RegisterScreen.js';
import DashboardScreen from './screens/DashboardScreen.js';

const Stack = createStackNavigator();

export default function App() {
  
  useEffect(() => {
    const testConnection = async () => {
      const isConnected = await testFirebaseConnection();
      if (isConnected) {
        console.log('Firebase está pronto para uso!');
      } else {
        console.log('Problema na conexão com Firebase');
      }
    };
    
    testConnection();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: '#2e0000' }
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}