// library-project/context/CartContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const CartContext = createContext();
export const useCart = () => useContext(CartContext);

const STORAGE_KEY = '@cart_data';

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [freight, setFreight] = useState(0);
  const [coupon, setCoupon] = useState(null);
  const [loaded, setLoaded] = useState(false); // indica se os dados já foram carregados do storage

  // Carregar dados ao iniciar
  useEffect(() => {
    const loadCart = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const { items: savedItems, freight: savedFreight, coupon: savedCoupon } = JSON.parse(stored);
          setItems(savedItems || []);
          setFreight(savedFreight || 0);
          setCoupon(savedCoupon || null);
        }
      } catch (e) {
        console.error('Erro ao carregar carrinho:', e);
      } finally {
        setLoaded(true);
      }
    };
    loadCart();
  }, []);

  // Salvar sempre que houver mudanças
  useEffect(() => {
    if (!loaded) return; // evita salvar antes de carregar (sobrescreveria com dados vazios)
    const saveCart = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ items, freight, coupon }));
      } catch (e) {
        console.error('Erro ao salvar carrinho:', e);
      }
    };
    saveCart();
  }, [items, freight, coupon, loaded]);

  const addItem = (book, quantity = 1) => {
    setItems(prev => {
      const existing = prev.find(item => item.book.id === book.id);
      if (existing) {
        return prev.map(item =>
          item.book.id === book.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prev, { book, quantity }];
    });
  };

  const removeItem = (bookId) => {
    setItems(prev => prev.filter(item => item.book.id !== bookId));
  };

  const updateQuantity = (bookId, newQuantity) => {
    if (newQuantity < 1) {
      removeItem(bookId);
      return;
    }
    setItems(prev =>
      prev.map(item =>
        item.book.id === bookId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    setFreight(0);
    setCoupon(null);
  };

  const applyCoupon = (code, discountPercent) => {
    if (!code || discountPercent <= 0 || discountPercent > 100) return false;
    setCoupon({ code, discountPercent });
    return true;
  };

  const removeCoupon = () => {
    setCoupon(null);
  };

  const subtotal = items.reduce((sum, item) => sum + item.book.price * item.quantity, 0);
  const discount = coupon ? subtotal * (coupon.discountPercent / 100) : 0;
  const total = subtotal - discount + (freight || 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{
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
    }}>
      {children}
    </CartContext.Provider>
  );
};