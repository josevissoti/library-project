// screens/CartScreen.js
import React, { useState, useContext } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert,
  Dimensions, Image, SafeAreaView, StatusBar, ScrollView, ActivityIndicator,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useCart } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { ordersService, booksService, couponsService } from '../services/jsonbin';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;
const isSmallPhone = width < 380;

const placeholderImage = require('../assets/images/bookstore-logo.png');

export default function CartScreen() {
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const {
    items, removeItem, updateQuantity, clearCart,
    freight, setFreight, coupon, applyCoupon, removeCoupon,
    subtotal, discount, total, itemCount, cep, setCep, address, setAddress,
  } = useCart();

  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [loadingCep, setLoadingCep] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const [clearModalVisible, setClearModalVisible] = useState(false);
  const [cepError, setCepError] = useState('');
  const [freightError, setFreightError] = useState('');
  const [finalizeModalVisible, setFinalizeModalVisible] = useState(false);

  const formatPrice = (p) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p);

  const handleCepChange = (text) => {
    let clean = text.replace(/\D/g, '');
    if (clean.length > 8) clean = clean.slice(0, 8);
    let formatted = clean;
    if (clean.length > 5) {
      formatted = clean.slice(0, 5) + '-' + clean.slice(5);
    }
    setCep(formatted);
    if (clean.length === 8) {
      setCepError('');
    } else if (clean.length > 0 && clean.length < 8) {
      setCepError('CEP incompleto. Digite 8 dígitos.');
    } else {
      setCepError('');
    }
  };

  const handleCalculateFreight = async () => {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length !== 8) {
      setCepError('CEP inválido. Digite 8 dígitos.');
      return;
    }
    setCepError('');
    setLoadingCep(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await response.json();
      if (data.erro) {
        setCepError('CEP não encontrado.');
        setAddress(null);
        setFreight(0);
        return;
      }
      setAddress(data);
      const uf = data.uf;
      let valorFrete = 20;
      const norte = ['AM','RR','AP','PA','TO','RO','AC'];
      const nordeste = ['MA','PI','CE','RN','PB','PE','AL','SE','BA'];
      const centroOeste = ['MT','MS','GO','DF'];
      const sudeste = ['SP','RJ','ES','MG'];
      const sul = ['PR','SC','RS'];
      if (norte.includes(uf) || nordeste.includes(uf)) valorFrete = 25;
      else if (centroOeste.includes(uf)) valorFrete = 18;
      else if (sudeste.includes(uf)) valorFrete = 12;
      else if (sul.includes(uf)) valorFrete = 15;
      setFreight(valorFrete);
      setFreightError('');
      Alert.alert('Frete calculado', `Valor: ${formatPrice(valorFrete)}`);
    } catch (e) {
      setCepError('Erro ao consultar o CEP. Verifique sua conexão.');
      setAddress(null);
      setFreight(0);
    } finally {
      setLoadingCep(false);
    }
  };

  const handleApplyCoupon = async () => {
    setCouponError('');
    if (!couponCode.trim()) {
      setCouponError('Digite um código de cupom.');
      return;
    }
    try {
      const validCoupon = await couponsService.validate(couponCode);
      applyCoupon(validCoupon);
      setCouponCode('');
    } catch (e) {
      setCouponError(e.message || 'Cupom inválido ou expirado.');
    }
  };

  const handleCouponCodeChange = (text) => {
    setCouponCode(text);
    if (couponError) setCouponError('');
  };

  const confirmClearCart = () => {
    clearCart();
    setClearModalVisible(false);
  };

  // Validação antes de abrir o modal de confirmação
  const handlePressFinalize = () => {
    setFreightError('');
    if (items.length === 0) {
      Alert.alert('Carrinho vazio');
      return;
    }
    if (!address || freight === 0) {
      setFreightError('Calcule o frete antes de finalizar a compra.');
      return;
    }
    // Abre o modal de confirmação
    setFinalizeModalVisible(true);
  };

  const handleFinalizePurchase = async () => {
    setFinalizeModalVisible(false);
    setFinalizing(true);
    try {
      for (const item of items) {
        if (item.book.stock < item.quantity) {
          Alert.alert('Estoque insuficiente', `O livro "${item.book.title}" tem apenas ${item.book.stock} unidades.`);
          setFinalizing(false);
          return;
        }
      }
    } catch (e) {
      Alert.alert('Erro', 'Erro ao verificar estoque.');
      setFinalizing(false);
      return;
    }

    try {
      for (const item of items) {
        await booksService.decreaseStock(item.book.id, item.quantity);
      }
      const order = {
        userId: user?.id || 'unknown',
        items: items.map(i => ({
          bookId: i.book.id,
          title: i.book.title,
          price: i.book.price,
          quantity: i.quantity,
        })),
        subtotal,
        discount,
        couponCode: coupon ? coupon.code : null,
        freight,
        total,
        cep: cep.replace(/\D/g, ''),
        address,
      };
      await ordersService.create(order);
      Alert.alert('Compra finalizada', 'Seu pedido foi registrado com sucesso!');
      clearCart();
      router.back();
    } catch (e) {
      Alert.alert('Erro', 'Falha ao finalizar compra: ' + e.message);
    } finally {
      setFinalizing(false);
    }
  };

  const handleIncrease = (item) => {
    try {
      updateQuantity(item.book.id, item.quantity + 1);
    } catch (error) {
      Alert.alert('Limite de estoque', error.message);
    }
  };

  const handleDecrease = (item) => {
    if (item.quantity <= 1) {
      removeItem(item.book.id);
      return;
    }
    try {
      updateQuantity(item.book.id, item.quantity - 1);
    } catch (error) {
      Alert.alert('Erro', error.message);
    }
  };

  const getItemImage = (book) => {
    if (book.image && book.image.trim() !== '') {
      return { uri: book.image };
    }
    return placeholderImage;
  };

  const renderItem = ({ item }) => (
    <View style={styles.cartItem}>
      <Image
        source={getItemImage(item.book)}
        style={styles.itemImage}
        resizeMode="cover"
        defaultSource={placeholderImage}
      />
      <View style={styles.itemInfo}>
        <Text style={styles.itemTitle} numberOfLines={2}>{item.book.title}</Text>
        <Text style={styles.itemPrice}>{formatPrice(item.book.price)}</Text>
        <View style={styles.itemQuantityRow}>
          <TouchableOpacity onPress={() => handleDecrease(item)} style={styles.qtyButtonSmall}>
            <Text style={styles.qtyButtonTextSmall}>−</Text>
          </TouchableOpacity>
          <Text style={styles.itemQuantity}>{item.quantity}</Text>
          <TouchableOpacity onPress={() => handleIncrease(item)} style={styles.qtyButtonSmall}>
            <Text style={styles.qtyButtonTextSmall}>+</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => removeItem(item.book.id)}
          >
            <Text style={styles.removeButtonText}>Excluir</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#2e0000" />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Voltar</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Carrinho</Text>
          <View style={{ width: 50 }} />
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Seu carrinho está vazio.</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.shopButton}>
            <Text style={styles.shopButtonText}>Continuar comprando</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2e0000" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Carrinho ({itemCount} itens)</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent}>
        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={item => item.book.id}
          scrollEnabled={false}
          style={styles.list}
        />

        <View style={styles.cepContainer}>
          <Text style={styles.cepLabel}>CEP para entrega:</Text>
          <View style={styles.cepRow}>
            <TextInput
              style={styles.cepInput}
              placeholder="00000-000"
              placeholderTextColor="#999"
              keyboardType="numeric"
              value={cep}
              onChangeText={handleCepChange}
            />
            <TouchableOpacity style={styles.calcButton} onPress={handleCalculateFreight} disabled={loadingCep}>
              {loadingCep ? <ActivityIndicator color="#fff" /> : <Text style={styles.calcButtonText}>Calcular frete</Text>}
            </TouchableOpacity>
          </View>
          {cepError !== '' && <Text style={styles.errorText}>{cepError}</Text>}
          {address && (
            <Text style={styles.addressText}>
              {address.logradouro}, {address.bairro} - {address.localidade}/{address.uf}
            </Text>
          )}
        </View>

        <View style={styles.couponRow}>
          <TextInput
            style={styles.couponInput}
            placeholder="Código do cupom"
            placeholderTextColor="#999"
            value={couponCode}
            onChangeText={handleCouponCodeChange}
            autoCapitalize="characters"
          />
          <TouchableOpacity style={styles.applyButton} onPress={handleApplyCoupon}>
            <Text style={styles.applyButtonText}>Aplicar</Text>
          </TouchableOpacity>
        </View>
        {couponError !== '' && (
          <Text style={styles.errorText}>{couponError}</Text>
        )}
        {coupon && (
          <View style={styles.activeCoupon}>
            <Text style={styles.activeCouponText}>Cupom {coupon.code} (-{coupon.discountPercent}%)</Text>
            <TouchableOpacity onPress={removeCoupon}>
              <Text style={styles.removeCouponText}>Remover</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.summary}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>{formatPrice(subtotal)}</Text>
          </View>
          {discount > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Desconto</Text>
              <Text style={[styles.summaryValue, { color: '#4caf50' }]}>-{formatPrice(discount)}</Text>
            </View>
          )}
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Frete</Text>
            <Text style={styles.summaryValue}>{formatPrice(freight || 0)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatPrice(total)}</Text>
          </View>
          {/* Mensagem de erro inline do frete */}
          {freightError !== '' && (
            <Text style={[styles.errorText, { marginTop: 10, textAlign: 'center' }]}>{freightError}</Text>
          )}
        </View>

        <View style={styles.footerButtons}>
          <TouchableOpacity
            style={[styles.footerButton, styles.clearButton]}
            onPress={() => setClearModalVisible(true)}
          >
            <Text style={styles.clearButtonText}>Limpar carrinho</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.footerButton, styles.checkoutButton]}
            onPress={handlePressFinalize}
            disabled={finalizing}
          >
            {finalizing ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.checkoutButtonText}>Finalizar compra</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal de confirmação para limpar carrinho */}
      <Modal
        visible={clearModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setClearModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Limpar carrinho</Text>
            <Text style={styles.modalMessage}>
              Tem certeza que deseja remover todos os itens do carrinho?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setClearModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalDeleteBtn}
                onPress={confirmClearCart}
              >
                <Text style={styles.modalDeleteText}>Limpar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de confirmação para finalizar compra */}
      <Modal
        visible={finalizeModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setFinalizeModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Finalizar compra</Text>
            <Text style={styles.modalMessage}>
              Deseja realmente finalizar esta compra?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setFinalizeModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalDeleteBtn}
                onPress={handleFinalizePurchase}
              >
                <Text style={styles.modalDeleteText}>Confirmar</Text>
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
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 18, color: '#fff', marginBottom: 20 },
  shopButton: { backgroundColor: '#6e0c0c', borderRadius: 10, paddingVertical: 12, paddingHorizontal: 24 },
  shopButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  scrollArea: { flex: 1 },
  scrollContent: { padding: isTablet ? 24 : 16, paddingBottom: 30, maxWidth: isTablet ? 700 : '100%', width: '100%', alignSelf: 'center' },
  list: { marginBottom: 16 },
  cartItem: {
    flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, padding: 12,
    marginBottom: 12, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
  },
  itemImage: { width: 70, height: 100, borderRadius: 8, marginRight: 14, backgroundColor: '#f0f0f0' },
  itemInfo: { flex: 1 },
  itemTitle: { fontSize: isSmallPhone ? 14 : 16, fontWeight: 'bold', color: '#2e0000', marginBottom: 4 },
  itemPrice: { fontSize: isSmallPhone ? 14 : 16, color: '#6e0c0c', fontWeight: 'bold', marginBottom: 8 },
  itemQuantityRow: { flexDirection: 'row', alignItems: 'center' },
  qtyButtonSmall: { backgroundColor: '#e0e0e0', width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  qtyButtonTextSmall: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  itemQuantity: { fontSize: 16, fontWeight: 'bold', marginHorizontal: 12 },
  removeButton: {
    marginLeft: 'auto',
    backgroundColor: '#ff4444',
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  removeButtonText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  cepContainer: { marginBottom: 12 },
  cepLabel: { fontSize: 14, fontWeight: 'bold', color: '#fff', marginBottom: 6 },
  cepRow: { flexDirection: 'row', alignItems: 'center' },
  cepInput: {
    flex: 1, backgroundColor: '#fff', borderRadius: 8, padding: 12, fontSize: 14,
    borderWidth: 1, borderColor: '#ddd', marginRight: 8,
  },
  calcButton: {
    backgroundColor: '#6e0c0c', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 12,
    justifyContent: 'center', alignItems: 'center',
  },
  calcButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  addressText: { color: '#ccc', fontSize: 13, marginTop: 4 },
  couponRow: { flexDirection: 'row', marginBottom: 8 },
  couponInput: {
    flex: 1, backgroundColor: '#fff', borderRadius: 8, padding: 12, fontSize: 14,
    borderWidth: 1, borderColor: '#ddd', marginRight: 8,
  },
  applyButton: {
    backgroundColor: '#6e0c0c', borderRadius: 8, paddingHorizontal: 20, justifyContent: 'center',
  },
  applyButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  errorText: {
    color: '#ff4444',
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 10,
    marginLeft: 4,
  },
  activeCoupon: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#e8f5e9', padding: 10, borderRadius: 8, marginBottom: 10,
  },
  activeCouponText: { color: '#2e7d32', fontWeight: 'bold', fontSize: 14 },
  removeCouponText: { color: '#c62828', fontWeight: 'bold', fontSize: 14 },
  summary: {
    backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1,
    shadowRadius: 4, elevation: 3,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  summaryLabel: { fontSize: 15, color: '#666' },
  summaryValue: { fontSize: 15, fontWeight: 'bold', color: '#333' },
  totalRow: {
    flexDirection: 'row', justifyContent: 'space-between', marginTop: 10,
    borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 12,
  },
  totalLabel: { fontSize: 18, fontWeight: 'bold', color: '#2e0000' },
  totalValue: { fontSize: 18, fontWeight: 'bold', color: '#6e0c0c' },
  footerButtons: { flexDirection: 'row', justifyContent: 'space-between' },
  footerButton: { flex: 1, paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginHorizontal: 6 },
  clearButton: { backgroundColor: '#ff4444' },
  clearButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  checkoutButton: { backgroundColor: '#6e0c0c' },
  checkoutButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
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