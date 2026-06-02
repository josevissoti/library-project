import React, { useState, useEffect, useContext } from 'react';
import {
  View, Text, StyleSheet, Image, ScrollView, TouchableOpacity,
  Dimensions, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { AuthContext } from '../context/AuthContext';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;
const isSmallPhone = width < 380;

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useContext(AuthContext);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setUserData(user);
      setLoading(false);
    } else {
      router.replace('/');
    }
  }, [user]);

  const handleLogout = async () => {
    await logout();
    router.replace('/');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6e0c0c" />
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  const getHorizontalMargin = () => (isSmallPhone ? 12 : 20);
  const getVerticalMargin = () => (isSmallPhone ? 15 : 20);

  return (
    <ScrollView
      contentContainerStyle={[
        styles.scrollContent,
        { paddingHorizontal: getHorizontalMargin(), paddingVertical: getVerticalMargin() },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.contentWrapper}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Image source={require('../assets/images/profile-image.jpg')} style={styles.avatar} />
          </View>
          <Text style={styles.userName}>{userData?.name || 'Usuário'}</Text>
          <Text style={styles.userEmail}>{userData?.email || 'email@exemplo.com'}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Informações Pessoais</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Nome completo:</Text>
            <Text style={styles.infoValue}>{userData?.name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>E-mail:</Text>
            <Text style={styles.infoValue}>{userData?.email}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Telefone:</Text>
            <Text style={styles.infoValue}>{userData?.phone || 'Não informado'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Membro desde:</Text>
            <Text style={styles.infoValue}>{new Date().toLocaleDateString('pt-BR')}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Gerenciar</Text>
          <TouchableOpacity
            style={styles.manageButton}
            onPress={() => router.push('/orders')}
          >
            <Text style={styles.manageButtonText}>Meus Pedidos</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.manageButton}
            onPress={() => router.push('/coupons')}
          >
            <Text style={styles.manageButtonText}>Gerenciar Cupons</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Estatísticas</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Livros comprados</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Livros lidos</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Favoritos</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
          <Text style={styles.logoutButtonText}>Sair da conta</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#2e0000' },
  loadingText: { color: '#fff', fontSize: 16, marginTop: 10 },
  scrollContent: { flexGrow: 1, backgroundColor: '#2e0000' },
  contentWrapper: { maxWidth: 500, width: '100%', alignSelf: 'center' },
  profileHeader: { alignItems: 'center', marginBottom: 20 },
  avatarContainer: {
    width: 100, height: 100, borderRadius: 50, backgroundColor: '#6e0c0c',
    justifyContent: 'center', alignItems: 'center', marginBottom: 16, overflow: 'hidden',
  },
  avatar: { width: 80, height: 80, borderRadius: 40, resizeMode: 'cover' },
  userName: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 4, textAlign: 'center' },
  userEmail: { fontSize: 14, color: '#999', textAlign: 'center' },
  card: {
    backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1,
    shadowRadius: 3, elevation: 3,
  },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#2e0000', marginBottom: 16, textAlign: 'center' },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
  },
  infoLabel: { fontSize: 14, color: '#666', fontWeight: '500' },
  infoValue: { fontSize: 14, color: '#333', fontWeight: 'bold', flex: 1, textAlign: 'right', marginLeft: 10 },
  manageButton: {
    backgroundColor: '#6e0c0c', borderRadius: 8, paddingVertical: 12, paddingHorizontal: 20,
    marginBottom: 10, alignItems: 'center',
  },
  manageButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 10 },
  statItem: { alignItems: 'center', flex: 1 },
  statNumber: { fontSize: 24, fontWeight: 'bold', color: '#6e0c0c', marginBottom: 4 },
  statLabel: { fontSize: 12, color: '#666', textAlign: 'center' },
  logoutButton: {
    backgroundColor: '#ff6b6b', padding: 14, borderRadius: 12, alignItems: 'center',
    marginTop: 8, marginBottom: 20,
  },
  logoutButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});