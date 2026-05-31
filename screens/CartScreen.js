// library-project/screens/CartScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  Dimensions,
  Image,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useCart } from '../context/CartContext';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;
const isSmallPhone = width < 380;

export default function CartScreen() {
  const router = useRouter();
  const {
    items,
    removeItem,
    updateQuantity,
    clearCart,
    freight,
    setFreight,
    coupon,
    applyCoupon,
    removeCoupon,
    subtotal,
    discount,
    total,
    itemCount,
  } = useCart();

  const [couponCode, setCouponCode] = useState('');
  const [freightInput, setFreightInput] = useState(freight.toString());

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) {
      Alert.alert('Atenção', 'Digite um código de cupom.');
      return;
    }
    const lowerCode = couponCode.trim().toUpperCase();
    if (lowerCode === 'PROMO10') {
      applyCoupon('PROMO10', 10);
      Alert.alert('Cupom aplicado', '10% de desconto ativado!');
    } else if (lowerCode === 'FRETEGRATIS') {
      setFreight(0);
      setFreightInput('0');
      Alert.alert('Cupom aplicado', 'Frete grátis ativado!');
    } else {
      Alert.alert('Cupom inválido', 'O código informado não é válido.');
    }
  };

  const handleFreightChange = (text) => {
    setFreightInput(text);
    const value = parseFloat(text.replace(',', '.'));
    if (!isNaN(value) && value >= 0) {
      setFreight(value);
    } else if (text === '') {
      setFreight(0);
    }
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);

  const renderItem = ({ item }) => (
    <View style={styles.cartItem}>
      <Image
        source={{
          uri: item.book.image || 'https://via.placeholder.com/80x100?text=Sem+Imagem',
        }}
        style={styles.itemImage}
        resizeMode="cover"
      />
      <View style={styles.itemInfo}>
        <Text style={styles.itemTitle} numberOfLines={2}>{item.book.title}</Text>
        <Text style={styles.itemPrice}>{formatPrice(item.book.price)}</Text>
        <View style={styles.itemQuantityRow}>
          <TouchableOpacity
            onPress={() => updateQuantity(item.book.id, item.quantity - 1)}
            style={styles.qtyButtonSmall}
          >
            <Text style={styles.qtyButtonTextSmall}>−</Text>
          </TouchableOpacity>
          <Text style={styles.itemQuantity}>{item.quantity}</Text>
          <TouchableOpacity
            onPress={() => updateQuantity(item.book.id, item.quantity + 1)}
            style={styles.qtyButtonSmall}
          >
            <Text style={styles.qtyButtonTextSmall}>+</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => removeItem(item.book.id)}
            style={styles.removeButton}
          >
            <Text style={styles.removeButtonText}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2e0000" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Carrinho ({itemCount} itens)</Text>
        <View style={styles.placeholder} />
      </View>

      {items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Seu carrinho está vazio.</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.shopButton}>
            <Text style={styles.shopButtonText}>Continuar comprando</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent}>
          <FlatList
            data={items}
            renderItem={renderItem}
            keyExtractor={item => item.book.id}
            scrollEnabled={false}
            style={styles.list}
          />

          {/* Cupom e frete */}
          <View style={styles.optionsContainer}>
            <View style={styles.couponRow}>
              <TextInput
                style={styles.couponInput}
                placeholder="Código do cupom"
                placeholderTextColor="#999"
                value={couponCode}
                onChangeText={setCouponCode}
                autoCapitalize="characters"
              />
              <TouchableOpacity style={styles.applyButton} onPress={handleApplyCoupon}>
                <Text style={styles.applyButtonText}>Aplicar</Text>
              </TouchableOpacity>
            </View>
            {coupon && (
              <View style={styles.activeCoupon}>
                <Text style={styles.activeCouponText}>
                  Cupom {coupon.code} (-{coupon.discountPercent}%)
                </Text>
                <TouchableOpacity onPress={removeCoupon}>
                  <Text style={styles.removeCouponText}>Remover</Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.freightRow}>
              <Text style={styles.freightLabel}>Frete (R$):</Text>
              <TextInput
                style={styles.freightInput}
                placeholder="0,00"
                placeholderTextColor="#999"
                keyboardType="decimal-pad"
                value={freightInput}
                onChangeText={handleFreightChange}
              />
            </View>
          </View>

          {/* Resumo */}
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
          </View>

          {/* Botões */}
          <View style={styles.footerButtons}>
            <TouchableOpacity
              style={[styles.footerButton, styles.clearButton]}
              onPress={() => {
                Alert.alert('Limpar carrinho', 'Deseja remover todos os itens?', [
                  { text: 'Cancelar' },
                  { text: 'Sim', onPress: clearCart }
                ]);
              }}
            >
              <Text style={styles.clearButtonText}>Limpar carrinho</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.footerButton, styles.checkoutButton]}
              onPress={() => Alert.alert('Finalizar compra', 'Funcionalidade em breve!')}
            >
              <Text style={styles.checkoutButtonText}>Finalizar compra</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#1a0000',
    borderBottomWidth: 1,
    borderBottomColor: '#6e0c0c',
  },
  backButton: {
    padding: 4,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  placeholder: {
    width: 50, // para centralizar o título
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 20,
  },
  shopButton: {
    backgroundColor: '#6e0c0c',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  shopButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: isTablet ? 24 : 16,
    paddingBottom: 30,
    maxWidth: isTablet ? 700 : '100%',
    width: '100%',
    alignSelf: 'center',
  },
  list: {
    marginBottom: 16,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemImage: {
    width: 70,
    height: 100,
    borderRadius: 8,
    marginRight: 14,
    backgroundColor: '#f0f0f0',
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: isSmallPhone ? 14 : 16,
    fontWeight: 'bold',
    color: '#2e0000',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: isSmallPhone ? 14 : 16,
    color: '#6e0c0c',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  itemQuantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  qtyButtonSmall: {
    backgroundColor: '#e0e0e0',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyButtonTextSmall: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  itemQuantity: {
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 12,
  },
  removeButton: {
    marginLeft: 'auto',
    padding: 4,
  },
  removeButtonText: {
    fontSize: 18,
  },
  optionsContainer: {
    marginBottom: 16,
  },
  couponRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  couponInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 8,
  },
  applyButton: {
    backgroundColor: '#6e0c0c',
    borderRadius: 8,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  applyButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  activeCoupon: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#e8f5e9',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  activeCouponText: {
    color: '#2e7d32',
    fontWeight: 'bold',
    fontSize: 14,
  },
  removeCouponText: {
    color: '#c62828',
    fontWeight: 'bold',
    fontSize: 14,
  },
  freightRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  freightLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    marginRight: 10,
  },
  freightInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#ddd',
    width: 90,
    textAlign: 'center',
  },
  summary: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 15,
    color: '#666',
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2e0000',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6e0c0c',
  },
  footerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 6,
  },
  clearButton: {
    backgroundColor: '#ff4444',
  },
  clearButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  checkoutButton: {
    backgroundColor: '#6e0c0c',
  },
  checkoutButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
});