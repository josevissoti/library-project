// screens/CouponManagementScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, Alert,
  FlatList, SafeAreaView, StatusBar, ActivityIndicator, Modal,
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
  const [dateError, setDateError] = useState('');

  // Estados para o modal de confirmação
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [couponToDelete, setCouponToDelete] = useState(null);

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

  // Máscara para data brasileira (dd/mm/aaaa)
  const handleDateChange = (text) => {
    let clean = text.replace(/\D/g, '');
    if (clean.length > 8) clean = clean.slice(0, 8);
    let formatted = '';
    if (clean.length > 0) formatted += clean.slice(0, 2);
    if (clean.length > 2) formatted += '/' + clean.slice(2, 4);
    if (clean.length > 4) formatted += '/' + clean.slice(4, 8);
    setValidUntil(formatted);
    // Validação inline
    if (clean.length === 8) {
      const day = parseInt(clean.slice(0, 2), 10);
      const month = parseInt(clean.slice(2, 4), 10);
      const year = parseInt(clean.slice(4, 8), 10);
      if (day < 1 || day > 31 || month < 1 || month > 12 || year < 2024) {
        setDateError('Data inválida.');
      } else {
        setDateError('');
      }
    } else if (clean.length > 0 && clean.length < 8) {
      setDateError('Data incompleta.');
    } else {
      setDateError('');
    }
  };

  // Converte dd/mm/aaaa para ISO (YYYY-MM-DD) para envio
  const convertToISO = (brDate) => {
    const parts = brDate.split('/');
    if (parts.length !== 3) return null;
    const day = parts[0], month = parts[1], year = parts[2];
    return `${year}-${month}-${day}`;
  };

  const handleCreate = async () => {
    if (!code.trim() || !discount) {
      Alert.alert('Atenção', 'Código e desconto são obrigatórios');
      return;
    }
    if (validUntil.trim() !== '') {
      if (dateError) {
        Alert.alert('Data inválida', 'Corrija a data de validade.');
        return;
      }
      const isoDate = convertToISO(validUntil);
      if (!isoDate) {
        Alert.alert('Data inválida', 'Formato de data incorreto.');
        return;
      }
      try {
        await couponsService.create({
          code,
          discountPercent: discount,
          validUntil: isoDate,
        });
        Alert.alert('Sucesso', 'Cupom criado!');
        setCode('');
        setDiscount('');
        setValidUntil('');
        setDateError('');
        loadCoupons();
      } catch (e) {
        Alert.alert('Erro', 'Não foi possível criar o cupom');
      }
    } else {
      // Sem data
      try {
        await couponsService.create({
          code,
          discountPercent: discount,
          validUntil: null,
        });
        Alert.alert('Sucesso', 'Cupom criado!');
        setCode('');
        setDiscount('');
        setValidUntil('');
        setDateError('');
        loadCoupons();
      } catch (e) {
        Alert.alert('Erro', 'Não foi possível criar o cupom');
      }
    }
  };

  const handleDeletePress = (id) => {
    setCouponToDelete(id);
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    if (!couponToDelete) return;
    try {
      await couponsService.delete(couponToDelete);
      Alert.alert('Sucesso', 'Cupom excluído com sucesso!');
      loadCoupons();
    } catch (error) {
      Alert.alert('Erro', error.message || 'Falha ao excluir cupom');
    } finally {
      setDeleteModalVisible(false);
      setCouponToDelete(null);
    }
  };

  const cancelDelete = () => {
    setDeleteModalVisible(false);
    setCouponToDelete(null);
  };

  const renderCoupon = ({ item }) => (
    <View style={styles.couponItem}>
      <View style={{ flex: 1 }}>
        <Text style={styles.couponCode}>{item.code}</Text>
        <Text style={styles.couponDetail}>{item.discountPercent}% de desconto</Text>
        {item.validUntil && (
          <Text style={styles.couponDetail}>Válido até {item.validUntil}</Text>
        )}
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeletePress(item.id)}
      >
        <Text style={styles.deleteButtonText}>Excluir</Text>
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
          placeholder="Validade (dd/mm/aaaa) opcional"
          placeholderTextColor="#999"
          value={validUntil}
          onChangeText={handleDateChange}
          keyboardType="numeric"
          maxLength={10}
        />
        {dateError !== '' && <Text style={styles.errorText}>{dateError}</Text>}
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

      {/* Modal de confirmação de exclusão */}
      <Modal
        visible={deleteModalVisible}
        transparent
        animationType="fade"
        onRequestClose={cancelDelete}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Confirmar exclusão</Text>
            <Text style={styles.modalMessage}>
              Tem certeza que deseja excluir este cupom?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={cancelDelete}>
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalDeleteBtn} onPress={confirmDelete}>
                <Text style={styles.modalDeleteText}>Excluir</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  errorText: { color: '#ff4444', fontSize: 13, marginBottom: 10, marginLeft: 4 },
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
  deleteButton: {
    backgroundColor: '#ff4444',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '85%',
    maxWidth: 400,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2e0000',
    marginBottom: 12,
  },
  modalMessage: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalCancelBtn: {
    flex: 1,
    backgroundColor: '#ccc',
    borderRadius: 8,
    paddingVertical: 12,
    marginRight: 8,
    alignItems: 'center',
  },
  modalCancelText: {
    color: '#333',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalDeleteBtn: {
    flex: 1,
    backgroundColor: '#ff4444',
    borderRadius: 8,
    paddingVertical: 12,
    marginLeft: 8,
    alignItems: 'center',
  },
  modalDeleteText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});