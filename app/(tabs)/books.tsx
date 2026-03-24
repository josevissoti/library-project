import React, { useContext, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { AuthContext } from '../../context/AuthContext';
import BookManagementScreen from '../../screens/BookManagementScreen';

export default function BooksTab() {
  const { user, loading } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/');
    }
  }, [user, loading]);

  if (loading) return null;
  if (!user) return null;

  return <BookManagementScreen />;
}