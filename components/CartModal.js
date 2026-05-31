// library-project/components/CartModal.js
import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  Dimensions,
  Image
} from 'react-native';
import { useCart } from '../context/CartContext';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

export default function CartModal({ visible, onClose }) {
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
    itemCount
  } = useCart();

  const [couponCode, setCouponCode] = useState('');
  const [freightInput, setFreightInput] = useState(freight.toString());

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) {
      Alert.alert('Atenção', 'Digite um código de cupom.');
      return;
    }
    // Exemplo simples: códigos fixos
    const lowerCode = couponCode.trim().toUpperCase();
    if (lowerCode === 'PROMO10') {
      applyCoupon('PROMO10', 10);
      Alert.alert('Cupom aplicado', '10% de desconto ativado!');
    } else if (lowerCode === 'FRETEGRATIS') {
      // Cupom que zera o frete
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
        source={{ uri: item.book.image || 'https://via.placeholder.com/50' }}
        style={styles.itemImage}
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
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Carrinho ({itemCount} itens)</Text>
          {items.length === 0 ? (
            <Text style={styles.emptyText}>Seu carrinho está vazio.</Text>
          ) : (
            <FlatList
              data={items}
              renderItem={renderItem}
              keyExtractor={item => item.book.id}
              style={styles.list}
            />
          )}

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
            <TouchableOpacity style={[styles.footerButton, styles.closeButton]} onPress={onClose}>
              <Text style={styles.closeButtonText}>Continuar comprando</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: isTablet ? '70%' : '95%',
    maxHeight: '90%',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2e0000',
    marginBottom: 16,
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#999',
    marginVertical: 40,
  },
  list: {
    maxHeight: 300,
    marginBottom: 16,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  itemImage: {
    width: 60,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
    resizeMode: 'cover',
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2e0000',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
    color: '#6e0c0c',
    fontWeight: 'bold',
    marginBottom: 6,
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
    marginHorizontal: 10,
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
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 8,
  },
  applyButton: {
    backgroundColor: '#6e0c0c',
    borderRadius: 8,
    paddingHorizontal: 16,
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
    padding: 8,
    borderRadius: 6,
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
    marginRight: 10,
  },
  freightInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#ddd',
    width: 80,
    textAlign: 'center',
  },
  summary: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 8,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
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
    marginHorizontal: 4,
  },
  clearButton: {
    backgroundColor: '#ff4444',
  },
  clearButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  closeButton: {
    backgroundColor: '#6e0c0c',
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});