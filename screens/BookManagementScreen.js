// screens/BookManagementScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
  Image
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { booksService } from '../services/jsonbin';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;
const isSmallPhone = width < 380;

const placeholderImage = require('../assets/images/bookstore-logo.png');

export default function BookManagementScreen() {
  const [user, setUser] = useState(null);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [bookToDelete, setBookToDelete] = useState(null);
  const [editingBook, setEditingBook] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    description: '',
    price: '',
    stock: '',
    image: ''
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        const parsed = JSON.parse(userData);
        setUser(parsed);
        await loadBooks(parsed.id);
      } else {
        Alert.alert('Erro', 'Usuário não encontrado. Faça login novamente.');
      }
    } catch (error) {
      console.error('Erro ao carregar usuário:', error);
      Alert.alert('Erro', 'Erro ao carregar dados do usuário');
    } finally {
      setLoading(false);
    }
  };

  const loadBooks = async (userId) => {
    try {
      const userBooks = await booksService.getUserBooks(userId);
      setBooks(userBooks);
    } catch (error) {
      console.error('Erro ao carregar livros:', error);
      Alert.alert('Erro', 'Erro ao carregar livros');
    }
  };

  const handleSaveBook = async () => {
    if (!formData.title.trim() || !formData.author.trim() || !formData.description.trim() || !formData.price) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios');
      return;
    }

    setLoading(true);
    try {
      const bookData = {
        title: formData.title.trim(),
        author: formData.author.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock) || 0,
        image: formData.image.trim() || ''
      };

      if (editingBook) {
        await booksService.updateBook(editingBook.id, bookData, user.id);
        Alert.alert('Sucesso', 'Livro atualizado!');
      } else {
        await booksService.createBook(bookData, user.id);
        Alert.alert('Sucesso', 'Livro cadastrado!');
      }

      await loadBooks(user.id);
      closeModal();
    } catch (error) {
      console.error('Erro ao salvar livro:', error);
      Alert.alert('Erro', error.message || 'Erro ao salvar');
    } finally {
      setLoading(false);
    }
  };

  const handleEditBook = (book) => {
    setEditingBook(book);
    setFormData({
      title: book.title,
      author: book.author,
      description: book.description,
      price: book.price.toString(),
      stock: book.stock ? book.stock.toString() : '0',
      image: book.image || ''
    });
    setModalVisible(true);
  };

  const confirmDelete = (book) => {
    setBookToDelete(book);
    setDeleteModalVisible(true);
  };

  const handleDeleteBook = async () => {
    if (!bookToDelete) return;
    try {
      await booksService.deleteBook(bookToDelete.id, user.id);
      Alert.alert('Sucesso', 'Livro excluído!');
      await loadBooks(user.id);
      closeDeleteModal();
    } catch (error) {
      console.error('Erro ao excluir:', error);
      Alert.alert('Erro', error.message || 'Erro ao excluir');
    }
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingBook(null);
    setFormData({ title: '', author: '', description: '', price: '', stock: '', image: '' });
  };

  const closeDeleteModal = () => {
    setDeleteModalVisible(false);
    setBookToDelete(null);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);
  };

  const getHorizontalMargin = () => (isSmallPhone ? 12 : 20);
  const getVerticalMargin = () => (isSmallPhone ? 15 : 20);

  // Função auxiliar para obter a imagem (placeholder se não houver URL)
  const getBookImage = (book) => {
    if (book.image && book.image.trim() !== '') {
      return { uri: book.image };
    }
    return placeholderImage;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6e0c0c" />
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={[
        styles.scrollContent,
        { paddingHorizontal: getHorizontalMargin(), paddingVertical: getVerticalMargin() }
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.contentWrapper}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Meus Livros</Text>
          <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
            <Text style={styles.addButtonText}>+ Novo Livro</Text>
          </TouchableOpacity>
        </View>

        {books.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Nenhum livro cadastrado</Text>
            <Text style={styles.emptySubText}>Clique em "+ Novo Livro" para começar</Text>
          </View>
        ) : (
          books.map(book => (
            <View key={book.id} style={styles.card}>
              <View style={styles.cardContent}>
                <Image
                  source={getBookImage(book)}
                  style={styles.bookImage}
                  defaultSource={placeholderImage}
                  resizeMode="cover"
                />
                <View style={styles.bookInfo}>
                  <Text style={styles.bookTitle}>{book.title}</Text>
                  <Text style={styles.bookAuthor}>Autor: {book.author}</Text>
                  <Text style={styles.bookDescription} numberOfLines={2}>{book.description}</Text>
                  <Text style={styles.bookPrice}>{formatPrice(book.price)}</Text>
                  <Text style={styles.bookStock}>Estoque: {book.stock || 0} unid.</Text>
                </View>
              </View>
              <View style={styles.bookActions}>
                <TouchableOpacity style={[styles.actionButton, styles.editButton]} onPress={() => handleEditBook(book)}>
                  <Text style={styles.actionButtonText}>Editar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={() => confirmDelete(book)}>
                  <Text style={styles.actionButtonText}>Excluir</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </View>

      {/* Modal de Cadastro/Edição */}
      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={closeModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editingBook ? 'Editar Livro' : 'Novo Livro'}</Text>

            <TextInput
              style={styles.input}
              placeholder="Título *"
              placeholderTextColor="#999"
              value={formData.title}
              onChangeText={text => setFormData({ ...formData, title: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Autor *"
              placeholderTextColor="#999"
              value={formData.author}
              onChangeText={text => setFormData({ ...formData, author: text })}
            />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Descrição *"
              placeholderTextColor="#999"
              multiline
              numberOfLines={3}
              value={formData.description}
              onChangeText={text => setFormData({ ...formData, description: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Preço * (ex: 39.90)"
              placeholderTextColor="#999"
              keyboardType="decimal-pad"
              value={formData.price}
              onChangeText={text => setFormData({ ...formData, price: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Quantidade em estoque"
              placeholderTextColor="#999"
              keyboardType="numeric"
              value={formData.stock}
              onChangeText={text => setFormData({ ...formData, stock: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="URL da imagem (opcional)"
              placeholderTextColor="#999"
              autoCapitalize="none"
              value={formData.image}
              onChangeText={text => setFormData({ ...formData, image: text })}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={closeModal}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.saveButton]} onPress={handleSaveBook}>
                <Text style={styles.saveButtonText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de Confirmação de Exclusão */}
      <Modal visible={deleteModalVisible} animationType="fade" transparent onRequestClose={closeDeleteModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.deleteModalContent}>
            <Text style={styles.deleteModalTitle}>Confirmar exclusão</Text>
            <Text style={styles.deleteModalMessage}>
              Tem certeza que deseja excluir "{bookToDelete?.title}"?
            </Text>
            <View style={styles.deleteModalButtons}>
              <TouchableOpacity style={[styles.deleteModalButton, styles.cancelDeleteButton]} onPress={closeDeleteModal}>
                <Text style={styles.cancelDeleteButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.deleteModalButton, styles.confirmDeleteButton]} onPress={handleDeleteBook}>
                <Text style={styles.confirmDeleteButtonText}>Excluir</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#2e0000' },
  loadingText: { color: '#fff', fontSize: 16, marginTop: 10 },
  scrollContent: { flexGrow: 1, backgroundColor: '#2e0000' },
  contentWrapper: { maxWidth: 500, width: '100%', alignSelf: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  headerTitle: { fontSize: isTablet ? 24 : 20, fontWeight: 'bold', color: '#fff' },
  addButton: { backgroundColor: '#6e0c0c', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  addButtonText: { color: '#fff', fontWeight: 'bold' },
  card: {
    backgroundColor: '#fff', borderRadius: 12, marginBottom: 16, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3
  },
  cardContent: { flexDirection: 'row', padding: 12 },
  bookImage: { width: 80, height: 100, borderRadius: 8, marginRight: 12, backgroundColor: '#f0f0f0' },
  bookInfo: { flex: 1, justifyContent: 'center' },
  bookTitle: { fontSize: 16, fontWeight: 'bold', color: '#2e0000', marginBottom: 4 },
  bookAuthor: { fontSize: 13, color: '#666', marginBottom: 4 },
  bookDescription: { fontSize: 12, color: '#888', marginBottom: 6 },
  bookPrice: { fontSize: 16, fontWeight: 'bold', color: '#6e0c0c' },
  bookStock: { fontSize: 12, color: '#2e0000', marginTop: 4 },
  bookActions: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#f0f0f0' },
  actionButton: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  editButton: { backgroundColor: '#f5f5f5' },
  deleteButton: { backgroundColor: '#ffe5e5' },
  actionButtonText: { fontSize: 14, fontWeight: '600', color: '#2e0000' },
  emptyContainer: { alignItems: 'center', marginTop: 50 },
  emptyText: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  emptySubText: { fontSize: 14, color: '#999', marginTop: 8 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', borderRadius: 20, padding: 24, width: isTablet ? '80%' : '90%' },
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#2e0000', marginBottom: 20, textAlign: 'center' },
  input: {
    backgroundColor: '#f5f5f5', borderRadius: 10, padding: 12, fontSize: 16,
    marginBottom: 12, borderWidth: 1, borderColor: '#e0e0e0'
  },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  modalButton: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center', marginHorizontal: 6 },
  cancelButton: { backgroundColor: '#f0f0f0' },
  saveButton: { backgroundColor: '#6e0c0c' },
  cancelButtonText: { color: '#666', fontWeight: '600' },
  saveButtonText: { color: '#fff', fontWeight: 'bold' },
  deleteModalContent: {
    backgroundColor: '#fff', borderRadius: 20, padding: 24,
    width: isTablet ? '70%' : '80%', alignItems: 'center'
  },
  deleteModalTitle: { fontSize: 20, fontWeight: 'bold', color: '#2e0000', marginBottom: 16 },
  deleteModalMessage: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 24 },
  deleteModalButtons: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  deleteModalButton: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center', marginHorizontal: 8 },
  cancelDeleteButton: { backgroundColor: '#f0f0f0' },
  confirmDeleteButton: { backgroundColor: '#ff6b6b' },
  cancelDeleteButtonText: { color: '#666', fontWeight: '600' },
  confirmDeleteButtonText: { color: '#fff', fontWeight: 'bold' },
});