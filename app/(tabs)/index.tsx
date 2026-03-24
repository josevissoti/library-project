import React, { useContext } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthContext } from '../../context/AuthContext';
import HomeScreen from '../../screens/HomeScreen';
import LoginScreen from '../../screens/LoginScreen';
import RegisterScreen from '../../screens/RegisterScreen';
import ShopScreen from '../../screens/ShopScreen';

const Stack = createStackNavigator();

export default function HomeTab() {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return null;
  }

  if (user) {
    return <ShopScreen />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false, cardStyle: { backgroundColor: '#2e0000' } }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}