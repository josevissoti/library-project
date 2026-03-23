import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, get, push, update, remove } from "firebase/database";
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyBtZfViHNMKeZqk9BOgM03qyJ8FiPsKzSI",
  authDomain: "bibliotecagnosis-5bd50.firebaseapp.com",
  projectId: "bibliotecagnosis-5bd50",
  storageBucket: "bibliotecagnosis-5bd50.firebasestorage.app",
  messagingSenderId: "550009170692",
  appId: "1:550009170692:web:bed77fcb63a131261ebe51",
  databaseURL: "https://bibliotecagnosis-5bd50-default-rtdb.firebaseio.com/"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

const sanitizeEmail = (email) => {
  return email.toLowerCase().replace(/[.#$/[\]]/g, '_');
};

export const authService = {
  async registerUser(userData) {
    try {
      const { name, email, phone, password } = userData;
      console.log('Tentando registrar usuário:', email);

      const emailExists = await this.checkEmailExists(email);
      if (emailExists) {
        throw new Error('Este e-mail já está cadastrado');
      }

      const phoneExists = await this.checkPhoneExists(phone);
      if (phoneExists) {
        throw new Error('Este telefone já está cadastrado');
      }
      
      const userId = Date.now().toString();

      const userRef = ref(database, `users/${userId}`);
      await set(userRef, {
        id: userId,
        name,
        email: email.toLowerCase(),
        phone,
        password,
        createdAt: new Date().toISOString()
      });

      const emailKey = sanitizeEmail(email);
      const emailRef = ref(database, `emailIndex/${emailKey}`);
      await set(emailRef, userId);

      const phoneKey = phone.replace(/[\s\(\)-]/g, '');
      const phoneRef = ref(database, `phoneIndex/${phoneKey}`);
      await set(phoneRef, userId);
      
      console.log('Usuário registrado com sucesso:', userId);
      
      return {
        id: userId,
        name,
        email: email.toLowerCase(),
        phone
      };
    } catch (error) {
      console.error('Erro ao registrar usuário:', error);
      throw error;
    }
  },

  async loginUser(email, password) {
    try {
      console.log('Tentando login:', email);

      const userId = await this.getUserIdByEmail(email);
      if (!userId) {
        throw new Error('E-mail ou senha inválidos');
      }

      const userRef = ref(database, `users/${userId}`);
      const snapshot = await get(userRef);
      
      if (!snapshot.exists()) {
        throw new Error('Usuário não encontrado');
      }
      
      const userData = snapshot.val();
      
      if (userData.password !== password) {
        throw new Error('E-mail ou senha inválidos');
      }
      
      const userInfo = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        phone: userData.phone
      };
      
      await AsyncStorage.setItem('userToken', 'token_' + Date.now());
      await AsyncStorage.setItem('userData', JSON.stringify(userInfo));
      
      console.log('Login realizado com sucesso:', userInfo.name);
      
      return userInfo;
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      throw error;
    }
  },

  async checkEmailExists(email) {
    try {
      const emailKey = sanitizeEmail(email);
      const emailIndexRef = ref(database, `emailIndex/${emailKey}`);
      const snapshot = await get(emailIndexRef);
      return snapshot.exists();
    } catch (error) {
      console.error('Erro ao verificar email:', error);
      return false;
    }
  },
  
  async checkPhoneExists(phone) {
    try {
      const cleanPhone = phone.replace(/[\s\(\)-]/g, '');
      const phoneIndexRef = ref(database, `phoneIndex/${cleanPhone}`);
      const snapshot = await get(phoneIndexRef);
      return snapshot.exists();
    } catch (error) {
      console.error('Erro ao verificar telefone:', error);
      return false;
    }
  },

  async getUserIdByEmail(email) {
    try {
      const emailKey = sanitizeEmail(email);
      const emailIndexRef = ref(database, `emailIndex/${emailKey}`);
      const snapshot = await get(emailIndexRef);
      return snapshot.exists() ? snapshot.val() : null;
    } catch (error) {
      console.error('Erro ao buscar usuário por email:', error);
      return null;
    }
  },
  
  async logout() {
    try {
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
      console.log('Logout realizado com sucesso');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      throw error;
    }
  },
  
  async getCurrentUser() {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        return JSON.parse(userData);
      }
      return null;
    } catch (error) {
      console.error('Erro ao buscar usuário atual:', error);
      return null;
    }
  }
};

export const booksService = {
  // Criar um novo livro
  async createBook(bookData, userId) {
    try {
      const booksRef = ref(database, `books`);
      const newBookRef = push(booksRef);
      
      const book = {
        id: newBookRef.key,
        title: bookData.title,
        author: bookData.author,
        description: bookData.description,
        price: parseFloat(bookData.price),
        userId: userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await set(newBookRef, book);
      
      // Criar índice por usuário
      const userBooksRef = ref(database, `userBooks/${userId}/${newBookRef.key}`);
      await set(userBooksRef, true);
      
      return book;
    } catch (error) {
      console.error('Erro ao criar livro:', error);
      throw error;
    }
  },
  
  // Buscar todos os livros (para a loja)
  async getAllBooks() {
    try {
      const booksRef = ref(database, `books`);
      const snapshot = await get(booksRef);
      
      if (!snapshot.exists()) {
        return [];
      }
      
      const books = Object.values(snapshot.val());
      // Ordenar por data de criação (mais recente primeiro)
      return books.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch (error) {
      console.error('Erro ao buscar todos os livros:', error);
      throw error;
    }
  },
  
  // Buscar todos os livros de um usuário específico
  async getUserBooks(userId) {
    try {
      const userBooksRef = ref(database, `userBooks/${userId}`);
      const userBooksSnapshot = await get(userBooksRef);
      
      if (!userBooksSnapshot.exists()) {
        return [];
      }
      
      const bookIds = Object.keys(userBooksSnapshot.val());
      const books = [];
      
      for (const bookId of bookIds) {
        const bookRef = ref(database, `books/${bookId}`);
        const bookSnapshot = await get(bookRef);
        
        if (bookSnapshot.exists()) {
          books.push(bookSnapshot.val());
        }
      }
      
      return books.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch (error) {
      console.error('Erro ao buscar livros do usuário:', error);
      throw error;
    }
  },
  
  // Buscar um livro específico
  async getBook(bookId) {
    try {
      const bookRef = ref(database, `books/${bookId}`);
      const snapshot = await get(bookRef);
      return snapshot.exists() ? snapshot.val() : null;
    } catch (error) {
      console.error('Erro ao buscar livro:', error);
      throw error;
    }
  },
  
  // Atualizar um livro
  async updateBook(bookId, bookData, userId) {
    try {
      const bookRef = ref(database, `books/${bookId}`);
      const snapshot = await get(bookRef);
      
      if (!snapshot.exists()) {
        throw new Error('Livro não encontrado');
      }
      
      const existingBook = snapshot.val();
      
      if (existingBook.userId !== userId) {
        throw new Error('Você não tem permissão para editar este livro');
      }
      
      const updates = {
        title: bookData.title,
        author: bookData.author,
        description: bookData.description,
        price: parseFloat(bookData.price),
        updatedAt: new Date().toISOString()
      };
      
      await update(bookRef, updates);
      
      return { ...existingBook, ...updates };
    } catch (error) {
      console.error('Erro ao atualizar livro:', error);
      throw error;
    }
  },
  
  // Deletar um livro
  async deleteBook(bookId, userId) {
    try {
      const bookRef = ref(database, `books/${bookId}`);
      const snapshot = await get(bookRef);
      
      if (!snapshot.exists()) {
        throw new Error('Livro não encontrado');
      }
      
      const book = snapshot.val();
      
      if (book.userId !== userId) {
        throw new Error('Você não tem permissão para deletar este livro');
      }
      
      // Remover o livro
      await remove(bookRef);
      
      // Remover do índice de usuário
      const userBookRef = ref(database, `userBooks/${userId}/${bookId}`);
      await remove(userBookRef);
      
      return true;
    } catch (error) {
      console.error('Erro ao deletar livro:', error);
      throw error;
    }
  }
};

export default database;