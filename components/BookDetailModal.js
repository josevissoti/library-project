// library-project/components/BookDetailModal.js
import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  Dimensions,
  ScrollView,
} from 'react-native';
import { useCart } from '../context/CartContext';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;
const isSmallPhone = width < 380;

export default function BookDetailModal({ visible, book, onClose }) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [inputValue, setInputValue] = useState('1');

  if (!book) return null;

  const updateQuantity = (newQty) => {
    if (newQty < 1) newQty = 1;
    setQuantity(newQty);
    setInputValue(newQty.toString());
  };

  const handleIncrease = () => updateQuantity(quantity + 1);
  const handleDecrease = () => updateQuantity(quantity - 1);

  const handleInputChange = (text) => {
    if (text === '') {
      setInputValue('');
      return;
    }
    const num = parseInt(text, 10);
    if (!isNaN(num) && num > 0) {
      setQuantity(num);
      setInputValue(num.toString());
    } else if (text === '0') {
      setQuantity(1);
      setInputValue('1');
    } else {
      setInputValue(quantity.toString());
    }
  };

  const handleAddToCart = () => {
    addItem(book, quantity);
    onClose();
    setQuantity(1);
    setInputValue('1');
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);

  const placeholder = require('../assets/images/bookstore-logo.png');
  const imageSource = book.image && book.image.trim() !== ''
    ? { uri: book.image }
    : placeholder;

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.container, isSmallPhone && styles.containerSmall]}>
          {/* Botão X fixo fora do ScrollView */}
          <TouchableOpacity style={styles.closeIcon} onPress={onClose}>
            <Text style={styles.closeIconText}>✕</Text>
          </TouchableOpacity>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              styles.scrollContent,
              isSmallPhone && styles.scrollContentSmall,
            ]}
          >
            <Image source={imageSource} style={styles.image} resizeMode="cover" />

            <Text style={[styles.title, isSmallPhone && styles.titleSmall]}>
              {book.title}
            </Text>
            <Text style={[styles.author, isSmallPhone && styles.authorSmall]}>
              por {book.author}
            </Text>
            <Text
              style={[styles.description, isSmallPhone && styles.descriptionSmall]}
              numberOfLines={4}
            >
              {book.description}
            </Text>

            {/* Preço e quantidade empilhados */}
            <View style={styles.priceQuantityContainer}>
              <Text style={[styles.price, isSmallPhone && styles.priceSmall]}>
                {formatPrice(book.price)}
              </Text>
              <View style={styles.quantityRow}>
                <TouchableOpacity onPress={handleDecrease} style={styles.qtyButton}>
                  <Text style={styles.qtyButtonText}>−</Text>
                </TouchableOpacity>
                <TextInput
                  style={styles.qtyInput}
                  value={inputValue}
                  onChangeText={handleInputChange}
                  keyboardType="numeric"
                  selectTextOnFocus
                  maxLength={3}
                  textAlign="center"
                />
                <TouchableOpacity onPress={handleIncrease} style={styles.qtyButton}>
                  <Text style={styles.qtyButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.addButton} onPress={handleAddToCart}>
              <Text style={styles.addButtonText}>Adicionar ao carrinho</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: isTablet ? '60%' : '90%',
    maxHeight: '90%',
    overflow: 'hidden',
    position: 'relative',
  },
  containerSmall: {
    width: '95%',
  },
  closeIcon: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIconText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  scrollContent: {
    padding: 20,
    paddingTop: 40,   // espaço extra para o X fixo
    alignItems: 'center',
    flexGrow: 1,
  },
  scrollContentSmall: {
    padding: 15,
    paddingTop: 35,
  },
  image: {
    width: '90%',
    aspectRatio: 2 / 3,
    maxWidth: 400,          // limite para tablets
    maxHeight: 300,         // limite de altura
    borderRadius: 12,
    marginBottom: 16,
    alignSelf: 'center',
    backgroundColor: '#f0f0f0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2e0000',
    marginBottom: 6,
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  titleSmall: {
    fontSize: 18,
    marginBottom: 4,
  },
  author: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  authorSmall: {
    fontSize: 13,
    marginBottom: 6,
  },
  description: {
    fontSize: 13,
    color: '#888',
    lineHeight: 18,
    marginBottom: 16,
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  descriptionSmall: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 12,
  },
  priceQuantityContainer: {
    alignItems: 'center',       // centraliza o bloco
    marginBottom: 20,
    width: '100%',
  },
  price: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#6e0c0c',
    marginBottom: 12,
    textAlign: 'center',
  },
  priceSmall: {
    fontSize: 18,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyButton: {
    backgroundColor: '#6e0c0c',
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  qtyInput: {
    width: 50,
    height: 34,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginHorizontal: 8,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    padding: 0,
  },
  addButton: {
    backgroundColor: '#6e0c0c',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});