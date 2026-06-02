import React, { useState, useEffect, useContext } from 'react';
import {
  View, Text, StyleSheet, FlatList, SafeAreaView, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { AuthContext } from '../context/AuthContext';
import { ordersService } from '../services/jsonbin';

export default function OrdersScreen() {
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const userOrders = await ordersService.getByUser(user.id);
        setOrders(userOrders);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const formatPrice = (p) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p);

  const renderOrder = ({ item }) => (
    <View style={styles.orderCard}>
      <Text style={styles.orderDate}>Pedido em: {new Date(item.createdAt).toLocaleDateString()}</Text>
      {item.items.map((prod, idx) => (
        <Text key={idx} style={styles.itemText}>
          {prod.title} x{prod.quantity} - {formatPrice(prod.price * prod.quantity)}
        </Text>
      ))}
      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Total:</Text>
        <Text style={styles.totalValue}>{formatPrice(item.total)}</Text>
      </View>
      {item.couponCode && <Text style={styles.couponInfo}>Cupom: {item.couponCode}</Text>}
      <Text style={styles.freightInfo}>Frete: {formatPrice(item.freight)}</Text>
      {item.address && (
        <Text style={styles.addressInfo}>
          {item.address.logradouro}, {item.address.bairro} - {item.address.localidade}/{item.address.uf}
        </Text>
      )}
    </View>
  );

  if (loading) {
    return <ActivityIndicator size="large" color="#6e0c0c" style={{ flex: 1, backgroundColor: '#2e0000' }} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.back}>← Voltar</Text></TouchableOpacity>
        <Text style={styles.title}>Meus Pedidos</Text>
        <View style={{ width: 50 }} />
      </View>
      {orders.length === 0 ? (
        <View style={styles.empty}><Text style={styles.emptyText}>Nenhum pedido encontrado.</Text></View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={item => item.id}
          renderItem={renderOrder}
          contentContainerStyle={{ padding: 16 }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#2e0000' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 16, backgroundColor: '#1a0000', borderBottomColor: '#6e0c0c', borderBottomWidth: 1,
  },
  back: { color: '#fff', fontSize: 16 },
  title: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  orderCard: {
    backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 12,
  },
  orderDate: { fontWeight: 'bold', fontSize: 15, marginBottom: 8, color: '#2e0000' },
  itemText: { fontSize: 14, color: '#333', marginBottom: 2 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 8 },
  totalLabel: { fontWeight: 'bold', fontSize: 16 },
  totalValue: { fontWeight: 'bold', fontSize: 16, color: '#6e0c0c' },
  couponInfo: { fontSize: 13, color: '#2e7d32', marginTop: 4 },
  freightInfo: { fontSize: 13, color: '#666' },
  addressInfo: { fontSize: 12, color: '#888', marginTop: 2 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: '#fff', fontSize: 16 },
});