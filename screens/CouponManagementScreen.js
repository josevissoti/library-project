// library-project/screens/CouponManagementScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, Alert,
  FlatList, SafeAreaView, StatusBar, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { couponsService } from '../services/jsonbin';

export default function CouponManagementScreen() {
  const router = useRouter();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState('');
  const [discount, setDiscount] = useState('');
  const [validUntil, setValidUntil] = useState('');

  const loadCoupons = useCallback(async () => {
    try {
      setLoading(true);
      const list = await couponsService.getAll();
      setCoupons(list);
    } catch (e) {
      Alert.alert('Erro', 'Falha ao carregar cupons');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCoupons();
  }, [loadCoupons]);

  const handleCreate = async () => {
    if (!code.trim() || !discount) {
      Alert.alert('Atenção', 'Código e desconto são obrigatórios');
      return;
    }
    try {
      await couponsService.create({ code, discountPercent: discount, validUntil });
      Alert.alert('Sucesso', 'Cupom criado!');
      setCode('');
      setDiscount('');
      setValidUntil('');
      loadCoupons();
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível criar o cupom');
    }
  };

  const handleDelete = (id) => {
    Alert.alert(
      'Confirmar exclusão',
      'Tem certeza que deseja excluir este cupom?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await couponsService.delete(id);
              Alert.alert('Sucesso', 'Cupom excluído com sucesso!');
              loadCoupons();
            } catch (error) {
              Alert.alert('Erro', error.message);
            }
          },
        },
      ]
    );
  };

  const renderCoupon = ({ item }) => (
    <View style={styles.couponItem}>
      <View style={{ flex: 1 }}>
        <Text style={styles.couponCode}>{item.code}</Text>
        <Text style={styles.couponDetail}>{item.discountPercent}% de desconto</Text>
        {item.validUntil && <Text style={styles.couponDetail}>Válido até {item.validUntil}</Text>}
      </View>
      <TouchableOpacity onPress={() => handleDelete(item.id)}>
        <Text style={styles.deleteBtn}>🗑️</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2e0000" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cupons</Text>
        <View style={{ width: 50 }} />
      </View>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Código (ex: PROMO10)"
          placeholderTextColor="#999"
          value={code}
          onChangeText={setCode}
          autoCapitalize="characters"
        />
        <TextInput
          style={styles.input}
          placeholder="Desconto (%)"
          placeholderTextColor="#999"
          value={discount}
          onChangeText={setDiscount}
          keyboardType="numeric"
        />
        <TextInput
          style={styles.input}
          placeholder="Validade (AAAA-MM-DD) opcional"
          placeholderTextColor="#999"
          value={validUntil}
          onChangeText={setValidUntil}
        />
        <TouchableOpacity style={styles.createButton} onPress={handleCreate}>
          <Text style={styles.createButtonText}>Criar cupom</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#6e0c0c" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={coupons}
          keyExtractor={(item) => item.id}
          renderItem={renderCoupon}
          contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={
            <Text style={{ color: '#fff', textAlign: 'center', marginTop: 20 }}>
              Nenhum cupom cadastrado.
            </Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#2e0000' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#1a0000',
    borderBottomWidth: 1, borderBottomColor: '#6e0c0c',
  },
  backButton: { padding: 4 },
  backButtonText: { color: '#fff', fontSize: 16 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  form: { padding: 16 },
  input: {
    backgroundColor: '#fff', borderRadius: 8, padding: 12, marginBottom: 10, fontSize: 16,
  },
  createButton: {
    backgroundColor: '#6e0c0c', borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 5,
  },
  createButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  couponItem: {
    flexDirection: 'row', backgroundColor: '#fff', borderRadius: 10, padding: 14,
    marginBottom: 10, alignItems: 'center',
  },
  couponCode: { fontWeight: 'bold', fontSize: 16, color: '#2e0000' },
  couponDetail: { fontSize: 13, color: '#666', marginTop: 2 },
  deleteBtn: { fontSize: 20 },
});