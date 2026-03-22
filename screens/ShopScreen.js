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
  ScrollView
} from 'react-native';

const { width } = Dimensions.get('window');

const booksData = [
  {
    id: '1',
    title: 'Dom Casmurro',
    author: 'Machado de Assis',
    price: 'R$ 39,90',
    image: 'https://m.media-amazon.com/images/I/51X8kQ4MqaL._SY445_SX342_.jpg',
    description: 'O clássico da literatura brasileira'
  },
  {
    id: '2',
    title: 'O Alquimista',
    author: 'Paulo Coelho',
    price: 'R$ 34,90',
    image: 'https://m.media-amazon.com/images/I/51zLZ6wDlwL._SY445_SX342_.jpg',
    description: 'Um livro sobre sonhos e busca'
  },
  {
    id: '3',
    title: '1984',
    author: 'George Orwell',
    price: 'R$ 45,90',
    image: 'https://m.media-amazon.com/images/I/41a5Lk6gwnL._SY445_SX342_.jpg',
    description: 'Um romance distópico'
  },
  {
    id: '4',
    title: 'O Pequeno Príncipe',
    author: 'Antoine de Saint-Exupéry',
    price: 'R$ 29,90',
    image: 'https://m.media-amazon.com/images/I/51k5Z6qCJpL._SY445_SX342_.jpg',
    description: 'Uma história encantadora'
  },
  {
    id: '5',
    title: 'A Revolução dos Bichos',
    author: 'George Orwell',
    price: 'R$ 32,90',
    image: 'https://m.media-amazon.com/images/I/51qN4X5UKcL._SY445_SX342_.jpg',
    description: 'Uma fábula satírica'
  },
  {
    id: '6',
    title: 'O Hobbit',
    author: 'J.R.R. Tolkien',
    price: 'R$ 49,90',
    image: 'https://m.media-amazon.com/images/I/51wv3C5L-XL._SY445_SX342_.jpg',
    description: 'Aventura na Terra Média'
  },
  {
    id: '7',
    title: 'Cem Anos de Solidão',
    author: 'Gabriel García Márquez',
    price: 'R$ 59,90',
    image: 'https://m.media-amazon.com/images/I/51qK4n5R8fL._SY445_SX342_.jpg',
    description: 'A obra-prima do realismo fantástico'
  },
  {
    id: '8',
    title: 'O Senhor dos Anéis',
    author: 'J.R.R. Tolkien',
    price: 'R$ 89,90',
    image: 'https://m.media-amazon.com/images/I/51CvX5bYwvL._SY445_SX342_.jpg',
    description: 'A épica jornada para destruir o Um Anel'
  },
  {
    id: '9',
    title: 'A Menina que Roubava Livros',
    author: 'Markus Zusak',
    price: 'R$ 49,90',
    image: 'https://m.media-amazon.com/images/I/51x5RgZ4EwL._SY445_SX342_.jpg',
    description: 'A emocionante história na Alemanha nazista'
  },
  {
    id: '10',
    title: 'O Diário de Anne Frank',
    author: 'Anne Frank',
    price: 'R$ 39,90',
    image: 'https://m.media-amazon.com/images/I/51X8kQ4MqaL._SY445_SX342_.jpg',
    description: 'O relato comovente de uma jovem judia'
  },
  {
    id: '11',
    title: 'A Culpa é das Estrelas',
    author: 'John Green',
    price: 'R$ 39,90',
    image: 'https://m.media-amazon.com/images/I/51zLZ6wDlwL._SY445_SX342_.jpg',
    description: 'Um amor que desafia o destino'
  },
  {
    id: '12',
    title: 'O Código Da Vinci',
    author: 'Dan Brown',
    price: 'R$ 49,90',
    image: 'https://m.media-amazon.com/images/I/41a5Lk6gwnL._SY445_SX342_.jpg',
    description: 'Um mistério envolvente e intrigante'
  },
  {
    id: '13',
    title: 'Harry Potter e a Pedra Filosofal',
    author: 'J.K. Rowling',
    price: 'R$ 59,90',
    image: 'https://m.media-amazon.com/images/I/51k5Z6qCJpL._SY445_SX342_.jpg',
    description: 'O início da jornada do jovem bruxo'
  },
  {
    id: '14',
    title: 'Percy Jackson e o Ladrão de Raios',
    author: 'Rick Riordan',
    price: 'R$ 44,90',
    image: 'https://m.media-amazon.com/images/I/51qN4X5UKcL._SY445_SX342_.jpg',
    description: 'Aventura com a mitologia grega'
  },
  {
    id: '15',
    title: 'O Guia do Mochileiro das Galáxias',
    author: 'Douglas Adams',
    price: 'R$ 42,90',
    image: 'https://m.media-amazon.com/images/I/51wv3C5L-XL._SY445_SX342_.jpg',
    description: 'Uma viagem intergaláctica hilária'
  }
];

export default function ShopScreen({ onCartUpdate }) {
  const [cart, setCart] = useState([]);
  const [numColumns, setNumColumns] = useState(2);
  const [searchText, setSearchText] = useState('');
  const [filteredBooks, setFilteredBooks] = useState(booksData);

  useEffect(() => {
    updateColumns();
    const subscription = Dimensions.addEventListener('change', updateColumns);
    return () => subscription?.remove();
  }, []);

  useEffect(() => {
    filterBooks();
  }, [searchText]);

  useEffect(() => {
    if (onCartUpdate) {
      onCartUpdate(cart.length);
    }
  }, [cart, onCartUpdate]);

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
      setFilteredBooks(booksData);
    } else {
      const filtered = booksData.filter(book => 
        book.title.toLowerCase().includes(searchText.toLowerCase()) ||
        book.author.toLowerCase().includes(searchText.toLowerCase()) ||
        book.description.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredBooks(filtered);
    }
  };

  const addToCart = (book) => {
    setCart([...cart, book]);
    Alert.alert('Sucesso', `${book.title} adicionado ao carrinho!`);
  };

  const clearSearch = () => {
    setSearchText('');
  };

  const renderBookCard = (item) => {
    return (
      <View style={styles.bookCard}>
        <Image 
          source={{ uri: item.image }} 
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
              {item.price}
            </Text>
            <TouchableOpacity 
              style={styles.buyButton}
              onPress={() => addToCart(item)}
              activeOpacity={0.8}
            >
              <Text style={styles.buyButtonText}>
                Comprar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
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

  return (
    <View style={styles.container}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2e0000',
  },
  searchContainer: {
    paddingHorizontal: 16,
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
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 8,
    color: '#666',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
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
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 16,
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
    shadowOffset: {
      width: 0,
      height: 2,
    },
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
  buyButton: {
    backgroundColor: '#6e0c0c',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  buyButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
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