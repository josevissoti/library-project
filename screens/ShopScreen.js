import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Alert,
  Dimensions
} from 'react-native';

const { width } = Dimensions.get('window');

// Dados dos livros (mock)
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
  }
];

export default function ShopScreen() {
  const [cart, setCart] = useState([]);
  const [numColumns, setNumColumns] = useState(2);

  useEffect(() => {
    updateColumns();
    const subscription = Dimensions.addEventListener('change', updateColumns);
    return () => subscription?.remove();
  }, []);

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

  const addToCart = (book) => {
    setCart([...cart, book]);
    Alert.alert('Sucesso', `📚 ${book.title} adicionado ao carrinho!`);
  };

  const renderBook = ({ item }) => {
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

  return (
    <View style={styles.container}>
      {cart.length > 0 && (
        <View style={styles.cartHeader}>
          <Text style={styles.cartIcon}>🛒</Text>
          <Text style={styles.cartText}>
            {cart.length} livro(s) no carrinho
          </Text>
          <TouchableOpacity 
            style={styles.viewCartButton}
            onPress={() => Alert.alert(
              'Carrinho',
              `Total de itens: ${cart.length}\nValor total: R$ ${cart.reduce((sum, book) => sum + parseFloat(book.price.replace('R$ ', '').replace(',', '.')), 0).toFixed(2)}`
            )}
          >
            <Text style={styles.viewCartText}>Ver</Text>
          </TouchableOpacity>
        </View>
      )}
      
      <FlatList
        data={booksData}
        renderItem={renderBook}
        keyExtractor={item => item.id}
        numColumns={numColumns}
        key={numColumns}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2e0000',
  },
  listContainer: {
    padding: 16,
  },
  bookCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: 8,
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
  cartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#6e0c0c',
    padding: 12,
    borderRadius: 12,
    margin: 16,
    marginBottom: 0,
  },
  cartIcon: {
    fontSize: 20,
    color: '#fff',
  },
  cartText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  viewCartButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
  },
  viewCartText: {
    color: '#6e0c0c',
    fontSize: 12,
    fontWeight: 'bold',
  },
});