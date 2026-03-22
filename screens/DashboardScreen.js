import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions
} from 'react-native';
import ShopScreen from './ShopScreen';
import ProfileScreen from './ProfileScreen';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

export default function DashboardScreen() {
  const [activeTab, setActiveTab] = useState('Loja');

  const renderContent = () => {
    if (activeTab === 'Loja') {
      return <ShopScreen />;
    } else {
      return <ProfileScreen />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2e0000" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>BookStore</Text>
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'Loja' && styles.activeTab]}
            onPress={() => setActiveTab('Loja')}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, activeTab === 'Loja' && styles.activeTabText]}>
              Loja
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'Perfil' && styles.activeTab]}
            onPress={() => setActiveTab('Perfil')}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, activeTab === 'Perfil' && styles.activeTabText]}>
              Perfil
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.content}>
        {renderContent()}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2e0000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1a0000',
    borderBottomWidth: 1,
    borderBottomColor: '#6e0c0c',
    paddingHorizontal: isTablet ? 24 : 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: isTablet ? 24 : 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  tabContainer: {
    flexDirection: 'row',
    gap: isTablet ? 20 : 12,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: isTablet ? 16 : 12,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#6e0c0c',
  },
  tabText: {
    fontSize: isTablet ? 16 : 14,
    color: '#999',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
});