import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, get, child, push, query, orderByChild, equalTo } from "firebase/database";
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

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Função para limpar o email para usar como chave no Firebase
const sanitizeEmail = (email) => {
  return email.toLowerCase().replace(/[.#$/[\]]/g, '_');
};

// Serviços de autenticação e usuários
export const authService = {
  // Registrar usuário
  async registerUser(userData) {
    try {
      const { name, email, phone, password } = userData;
      
      console.log('Tentando registrar usuário:', email);
      
      // Verificar se o email já existe
      const emailExists = await this.checkEmailExists(email);
      if (emailExists) {
        throw new Error('Este e-mail já está cadastrado');
      }
      
      // Verificar se o telefone já existe
      const phoneExists = await this.checkPhoneExists(phone);
      if (phoneExists) {
        throw new Error('Este telefone já está cadastrado');
      }
      
      // Criar ID único para o usuário
      const userId = Date.now().toString();
      
      // Salvar usuário no Firebase
      const userRef = ref(database, `users/${userId}`);
      await set(userRef, {
        id: userId,
        name,
        email: email.toLowerCase(),
        phone,
        password, // Nota: Em produção, NUNCA armazene senhas em texto puro!
        createdAt: new Date().toISOString()
      });
      
      // Salvar índice de email
      const emailKey = sanitizeEmail(email);
      const emailRef = ref(database, `emailIndex/${emailKey}`);
      await set(emailRef, userId);
      
      // Salvar índice de telefone
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
  
  // Login de usuário
  async loginUser(email, password) {
    try {
      console.log('Tentando login:', email);
      
      // Buscar usuário pelo email
      const userId = await this.getUserIdByEmail(email);
      
      if (!userId) {
        throw new Error('E-mail ou senha inválidos');
      }
      
      // Buscar dados do usuário
      const userRef = ref(database, `users/${userId}`);
      const snapshot = await get(userRef);
      
      if (!snapshot.exists()) {
        throw new Error('Usuário não encontrado');
      }
      
      const userData = snapshot.val();
      
      // Verificar senha
      if (userData.password !== password) {
        throw new Error('E-mail ou senha inválidos');
      }
      
      // Salvar dados do usuário logado no AsyncStorage
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
  
  // Verificar se email existe
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
  
  // Verificar se telefone existe
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
  
  // Buscar ID do usuário pelo email
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
  
  // Logout
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
  
  // Buscar dados do usuário atual
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

export default database;