import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const CartContext = createContext();
export const useCart = () => useContext(CartContext);

const STORAGE_KEY = '@cart_data';

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [freight, setFreight] = useState(0);
  const [coupon, setCoupon] = useState(null);
  const [cep, setCep] = useState('');
  const [address, setAddress] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        setItems(data.items || []);
        setFreight(data.freight || 0);
        setCoupon(data.coupon || null);
        setCep(data.cep || '');
        setAddress(data.address || null);
      }
    } catch (e) {
      console.error('Erro ao carregar carrinho:', e);
    } finally {
      setLoaded(true);
    }
  };

  useEffect(() => {
    if (!loaded) return;
    const saveCart = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({
          items,
          freight,
          coupon,
          cep,
          address,
        }));
      } catch (e) {
        console.error('Erro ao salvar carrinho:', e);
      }
    };
    saveCart();
  }, [items, freight, coupon, cep, address, loaded]);

  const addItem = (book, quantity = 1) => {
    if (quantity <= 0) {
      throw new Error('A quantidade deve ser maior que zero.');
    }

    if (book.stock !== undefined && book.stock !== null) {
      const existingItem = items.find(item => item.book.id === book.id);
      const currentQtyInCart = existingItem ? existingItem.quantity : 0;
      if (book.stock < currentQtyInCart + quantity) {
        throw new Error(
          `Estoque insuficiente. Disponível: ${book.stock}, já no carrinho: ${currentQtyInCart}.`
        );
      }
    }

    setItems(prev => {
      const existingIndex = prev.findIndex(item => item.book.id === book.id);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
        };
        return updated;
      } else {
        return [...prev, { book, quantity }];
      }
    });
  };

  const removeItem = (bookId) => setItems(prev => prev.filter(item => item.book.id !== bookId));

  const updateQuantity = (bookId, newQuantity) => {
    if (newQuantity < 1) {
      removeItem(bookId);
      return;
    }

    const item = items.find(i => i.book.id === bookId);
    if (!item) return;

    if (item.book.stock !== undefined && item.book.stock !== null) {
      if (newQuantity > item.book.stock) {
        throw new Error(`Estoque insuficiente. Disponível: ${item.book.stock} unidades.`);
      }
    }

    setItems(prev =>
      prev.map(item => (item.book.id === bookId ? { ...item, quantity: newQuantity } : item))
    );
  };

  const clearCart = () => {
    setItems([]);
    setFreight(0);
    setCoupon(null);
    setCep('');
    setAddress(null);
  };

  const applyCoupon = (couponObj) => setCoupon(couponObj);
  const removeCoupon = () => setCoupon(null);

  const subtotal = items.reduce((sum, item) => sum + item.book.price * item.quantity, 0);
  const discount = coupon ? subtotal * (coupon.discountPercent / 100) : 0;
  const total = subtotal - discount + (freight || 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
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
        loaded,
        cep,
        setCep,
        address,
        setAddress,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};