// library-project/screens/ShopScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  Dimensions,
  TextInput,
  ScrollView,
  ActivityIndicator,
  StatusBar
} from 'react-native';
import { useRouter } from 'expo-router';
import { booksService } from '../services/jsonbin';
import { useCart } from '../context/CartContext';
import BookDetailModal from '../components/BookDetailModal';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

export default function ShopScreen() {
  const router = useRouter();
  const { itemCount } = useCart();
  const [numColumns, setNumColumns] = useState(2);
  const [searchText, setSearchText] = useState('');
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedBook, setSelectedBook] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  useEffect(() => {
    updateColumns();
    const subscription = Dimensions.addEventListener('change', updateColumns);
    return () => subscription?.remove();
  }, []);

  useEffect(() => {
    loadBooks();
  }, []);

  useEffect(() => {
    filterBooks();
  }, [searchText, books]);

  const loadBooks = async () => {
    try {
      setLoading(true);
      const allBooks = await booksService.getAllBooks();
      setBooks(allBooks);
      setFilteredBooks(allBooks);
    } catch (error) {
      console.error('Erro ao carregar livros:', error);
      Alert.alert('Erro', 'Não foi possível carregar os livros');
    } finally {
      setLoading(false);
    }
  };

  const updateColumns = () => {
    const screenWidth = Dimensions.get('window').width;
    if (screenWidth >= 768) {
      setNumColumns(3);
    } else if (screenWidth >= 500) {
      setNumColumns(2);
    } else {
      setNumColumns(2);
    }
  };

  const filterBooks = () => {
    if (searchText.trim() === '') {
      setFilteredBooks(books);
    } else {
      const filtered = books.filter(book => 
        book.title.toLowerCase().includes(searchText.toLowerCase()) ||
        book.author.toLowerCase().includes(searchText.toLowerCase()) ||
        book.description.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredBooks(filtered);
    }
  };

  const handleBookPress = (book) => {
    setSelectedBook(book);
    setDetailModalVisible(true);
  };

  const clearSearch = () => {
    setSearchText('');
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const renderBookCard = (item) => {
    const imageUrl = item.image && item.image.trim() !== '' 
      ? item.image 
      : 'https://via.placeholder.com/150x200?text=Sem+Imagem';
      
    return (
      <TouchableOpacity
        style={styles.bookCard}
        onPress={() => handleBookPress(item)}
        activeOpacity={0.9}
      >
        <Image 
          source={{ uri: imageUrl }} 
          style={styles.bookImage}
          defaultSource={require('../assets/images/bookstore-logo.png')}
        />
        
        <View style={styles.bookInfo}>
          <Text style={styles.bookTitle} numberOfLines={2}>
            {item.title}
          </Text>
          
          <Text style={styles.bookAuthor} numberOfLines={1}>
            {item.author}
          </Text>
          
          <Text style={styles.bookDescription} numberOfLines={2}>
            {item.description}
          </Text>
          
          <View style={styles.priceContainer}>
            <Text style={styles.bookPrice}>
              {formatPrice(item.price)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderRows = () => {
    const rows = [];
    const items = filteredBooks;
    const totalRows = Math.ceil(items.length / numColumns);
    
    for (let i = 0; i < totalRows; i++) {
      const startIndex = i * numColumns;
      const endIndex = Math.min(startIndex + numColumns, items.length);
      const rowItems = items.slice(startIndex, endIndex);
      const isLastRow = i === totalRows - 1;
      const isLastRowIncomplete = isLastRow && (items.length % numColumns !== 0);
      
      rows.push(
        <View key={i} style={styles.row}>
          {rowItems.map((item) => (
            <View 
              key={item.id} 
              style={styles.bookCardWrapper}
            >
              {renderBookCard(item)}
            </View>
          ))}
          {isLastRowIncomplete && (
            <>
              {Array(numColumns - rowItems.length).fill(null).map((_, idx) => (
                <View key={`empty-${idx}`} style={styles.emptyCard} />
              ))}
            </>
          )}
        </View>
      );
    }
    
    return rows;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6e0c0c" />
        <Text style={styles.loadingText}>Carregando livros...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2e0000" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>BookStore</Text>
        <TouchableOpacity
          style={styles.cartButton}
          onPress={() => router.push('/cart')}
        >
          <Text style={styles.cartIcon}>🛒</Text>
          {itemCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{itemCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <TextInput
            style={styles.searchInput}
            placeholder="Pesquisar livros por título, autor ou descrição..."
            placeholderTextColor="#999"
            value={searchText}
            onChangeText={setSearchText}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
              <Text style={styles.clearButtonText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderRows()}
        
        {filteredBooks.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Nenhum livro encontrado</Text>
            <Text style={styles.emptySubText}>Tente usar outras palavras-chave</Text>
          </View>
        )}
      </ScrollView>

      {/* Modal de detalhes do livro */}
      <BookDetailModal
        visible={detailModalVisible}
        book={selectedBook}
        onClose={() => setDetailModalVisible(false)}
      />
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: '#1a0000',
    borderBottomWidth: 1,
    borderBottomColor: '#6e0c0c',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  cartButton: {
    position: 'relative',
    padding: 8,
  },
  cartIcon: {
    fontSize: 24,
    color: '#fff',
  },
  cartBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#ff4444',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  searchContainer: {
    paddingHorizontal: isTablet ? 24 : 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    fontSize: isTablet ? 16 : 14,
    color: '#333',
    paddingVertical: 8,
  },
  clearButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  clearButtonText: {
    fontSize: 16,
    color: '#999',
    fontWeight: 'bold',
  },
  scrollContent: {
    padding: isTablet ? 24 : 16,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  bookCardWrapper: {
    flex: 1,
    marginHorizontal: 8,
  },
  emptyCard: {
    flex: 1,
    marginHorizontal: 8,
    opacity: 0,
  },
  bookCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  bookImage: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
  },
  bookInfo: {
    padding: 10,
  },
  bookTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2e0000',
    marginBottom: 4,
    minHeight: 40,
  },
  bookAuthor: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  bookDescription: {
    fontSize: 11,
    color: '#888',
    lineHeight: 14,
    marginBottom: 8,
    minHeight: 28,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  bookPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6e0c0c',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});