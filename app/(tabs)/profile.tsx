import React, { useContext, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { AuthContext } from '../../context/AuthContext';
import ProfileScreen from '../../screens/ProfileScreen';

export default function ProfileTab() {
  const { user, loading } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/');
    }
  }, [user, loading]);

  if (loading) return null;
  if (!user) return null;

  return <ProfileScreen />;
}