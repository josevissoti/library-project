import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  Dimensions,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { booksService } from '../services/firebase';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

export default function BookManagementScreen() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    description: '',
    price: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    loadUserAndBooks();
  }, []);

  const loadUserAndBooks = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        const user = JSON.parse(userData);
        setCurrentUser(user);
        await loadBooks(user.id);
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

  const onRefresh = async () => {
    setRefreshing(true);
    if (currentUser) {
      await loadBooks(currentUser.id);
    }
    setRefreshing(false);
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.title.trim()) {
      errors.title = 'Título é obrigatório';
    } else if (formData.title.length < 2) {
      errors.title = 'Título deve ter pelo menos 2 caracteres';
    } else if (formData.title.length > 100) {
      errors.title = 'Título deve ter no máximo 100 caracteres';
    }
    
    if (!formData.author.trim()) {
      errors.author = 'Autor é obrigatório';
    } else if (formData.author.length < 2) {
      errors.author = 'Autor deve ter pelo menos 2 caracteres';
    } else if (formData.author.length > 100) {
      errors.author = 'Autor deve ter no máximo 100 caracteres';
    }
    
    if (!formData.description.trim()) {
      errors.description = 'Descrição é obrigatória';
    } else if (formData.description.length < 10) {
      errors.description = 'Descrição deve ter pelo menos 10 caracteres';
    } else if (formData.description.length > 500) {
      errors.description = 'Descrição deve ter no máximo 500 caracteres';
    }
    
    if (!formData.price) {
      errors.price = 'Preço é obrigatório';
    } else {
      const price = parseFloat(formData.price);
      if (isNaN(price) || price <= 0) {
        errors.price = 'Preço deve ser um número positivo';
      } else if (price > 10000) {
        errors.price = 'Preço não pode ser maior que R$ 10.000';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveBook = async () => {
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const bookData = {
        title: formData.title.trim(),
        author: formData.author.trim(),
        description: formData.description.trim(),
        price: formData.price
      };
      
      if (editingBook) {
        await booksService.updateBook(editingBook.id, bookData, currentUser.id);
        Alert.alert('Sucesso', 'Livro atualizado com sucesso!');
      } else {
        await booksService.createBook(bookData, currentUser.id);
        Alert.alert('Sucesso', 'Livro cadastrado com sucesso!');
      }
      
      await loadBooks(currentUser.id);
      closeModal();
    } catch (error) {
      console.error('Erro ao salvar livro:', error);
      Alert.alert('Erro', error.message || 'Erro ao salvar livro');
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
      price: book.price.toString()
    });
    setModalVisible(true);
  };

  const handleDeleteBook = (book) => {
    Alert.alert(
      'Confirmar exclusão',
      `Tem certeza que deseja excluir o livro "${book.title}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await booksService.deleteBook(book.id, currentUser.id);
              Alert.alert('Sucesso', 'Livro excluído com sucesso!');
              await loadBooks(currentUser.id);
            } catch (error) {
              console.error('Erro ao excluir livro:', error);
              Alert.alert('Erro', error.message || 'Erro ao excluir livro');
            }
          }
        }
      ]
    );
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingBook(null);
    setFormData({
      title: '',
      author: '',
      description: '',
      price: ''
    });
    setFormErrors({});
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const renderBookCard = (book) => {
    return (
      <View key={book.id} style={styles.bookCard}>
        <View style={styles.bookInfo}>
          <Text style={styles.bookTitle}>{book.title}</Text>
          <Text style={styles.bookAuthor}>Autor: {book.author}</Text>
          <Text style={styles.bookDescription} numberOfLines={3}>
            {book.description}
          </Text>
          <Text style={styles.bookPrice}>{formatPrice(book.price)}</Text>
          <Text style={styles.bookDate}>
            Cadastrado em: {new Date(book.createdAt).toLocaleDateString('pt-BR')}
          </Text>
        </View>
        
        <View style={styles.bookActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={() => handleEditBook(book)}
          >
            <Text style={styles.actionButtonText}>Editar</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDeleteBook(book)}
          >
            <Text style={styles.actionButtonText}>Excluir</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6e0c0c" />
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Meus Livros</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.addButtonText}>+ Novo Livro</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {books.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Nenhum livro cadastrado</Text>
            <Text style={styles.emptySubText}>
              Clique em "+ Novo Livro" para começar
            </Text>
          </View>
        ) : (
          books.map(renderBookCard)
        )}
      </ScrollView>
      
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingBook ? 'Editar Livro' : 'Novo Livro'}
            </Text>
            
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Título *</Text>
                <TextInput
                  style={[styles.input, formErrors.title && styles.inputError]}
                  placeholder="Digite o título do livro"
                  placeholderTextColor="#999"
                  value={formData.title}
                  onChangeText={(text) => {
                    setFormData({...formData, title: text});
                    if (formErrors.title) setFormErrors({...formErrors, title: null});
                  }}
                />
                {formErrors.title && (
                  <Text style={styles.errorText}>{formErrors.title}</Text>
                )}
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Autor *</Text>
                <TextInput
                  style={[styles.input, formErrors.author && styles.inputError]}
                  placeholder="Digite o nome do autor"
                  placeholderTextColor="#999"
                  value={formData.author}
                  onChangeText={(text) => {
                    setFormData({...formData, author: text});
                    if (formErrors.author) setFormErrors({...formErrors, author: null});
                  }}
                />
                {formErrors.author && (
                  <Text style={styles.errorText}>{formErrors.author}</Text>
                )}
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Descrição *</Text>
                <TextInput
                  style={[styles.input, styles.textArea, formErrors.description && styles.inputError]}
                  placeholder="Digite a descrição do livro"
                  placeholderTextColor="#999"
                  multiline
                  numberOfLines={4}
                  value={formData.description}
                  onChangeText={(text) => {
                    setFormData({...formData, description: text});
                    if (formErrors.description) setFormErrors({...formErrors, description: null});
                  }}
                />
                {formErrors.description && (
                  <Text style={styles.errorText}>{formErrors.description}</Text>
                )}
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Preço *</Text>
                <TextInput
                  style={[styles.input, formErrors.price && styles.inputError]}
                  placeholder="Digite o preço (ex: 39.90)"
                  placeholderTextColor="#999"
                  keyboardType="decimal-pad"
                  value={formData.price}
                  onChangeText={(text) => {
                    setFormData({...formData, price: text});
                    if (formErrors.price) setFormErrors({...formErrors, price: null});
                  }}
                />
                {formErrors.price && (
                  <Text style={styles.errorText}>{formErrors.price}</Text>
                )}
              </View>
            </ScrollView>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={closeModal}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSaveBook}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.saveButtonText}>
                    {editingBook ? 'Atualizar' : 'Salvar'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2e0000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2e0000',
  },
  loadingText: {
    marginTop: 10,
    color: '#fff',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: isTablet ? 24 : 16,
    paddingVertical: 16,
    backgroundColor: '#1a0000',
    borderBottomWidth: 1,
    borderBottomColor: '#6e0c0c',
  },
  headerTitle: {
    fontSize: isTablet ? 24 : 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  addButton: {
    backgroundColor: '#6e0c0c',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  scrollContent: {
    padding: isTablet ? 24 : 16,
    paddingTop: isTablet ? 20 : 12,
  },
  bookCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: isTablet ? 20 : 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bookInfo: {
    padding: isTablet ? 20 : 16,
  },
  bookTitle: {
    fontSize: isTablet ? 20 : 18,
    fontWeight: 'bold',
    color: '#2e0000',
    marginBottom: 8,
  },
  bookAuthor: {
    fontSize: isTablet ? 16 : 14,
    color: '#666',
    marginBottom: 8,
  },
  bookDescription: {
    fontSize: isTablet ? 15 : 14,
    color: '#888',
    lineHeight: isTablet ? 22 : 20,
    marginBottom: 12,
  },
  bookPrice: {
    fontSize: isTablet ? 20 : 18,
    fontWeight: 'bold',
    color: '#6e0c0c',
    marginBottom: 8,
  },
  bookDate: {
    fontSize: isTablet ? 13 : 12,
    color: '#999',
  },
  bookActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#f0f0f0',
  },
  deleteButton: {
    backgroundColor: '#ffe5e5',
  },
  actionButtonText: {
    fontSize: isTablet ? 15 : 14,
    fontWeight: '600',
    color: '#2e0000',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: isTablet ? 20 : 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: isTablet ? 16 : 14,
    color: '#999',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: isTablet ? '80%' : '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: isTablet ? 26 : 24,
    fontWeight: 'bold',
    color: '#2e0000',
    marginBottom: 20,
    textAlign: 'center',
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: isTablet ? 16 : 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: isTablet ? 14 : 12,
    fontSize: isTablet ? 17 : 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: '#ff6b6b',
    borderWidth: 2,
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 12,
    marginTop: 4,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  saveButton: {
    backgroundColor: '#6e0c0c',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: isTablet ? 17 : 16,
    fontWeight: '600',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: isTablet ? 17 : 16,
    fontWeight: 'bold',
  },
});