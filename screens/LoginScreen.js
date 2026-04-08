import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Image,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { authService } from '../services/firebase';
import { AuthContext } from '../context/AuthContext';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

export default function LoginScreen({ navigation }) {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => {
      setMessage({ text: '', type: '' });
    }, 3000);
  };

  const validateEmail = (email) => {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      showMessage('Por favor, preencha todos os campos', 'error');
      return;
    }

    if (!validateEmail(email)) {
      showMessage('Por favor, insira um e-mail válido (exemplo: nome@dominio.com)', 'error');
      return;
    }

    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const user = await authService.loginUser(email, password);
      login(user);
      showMessage(`Bem-vindo(a), ${user.name}!`, 'success');

      setTimeout(() => {
        navigation.popToTop();
      }, 1500);
    } catch (error) {
      let errorMessage = 'Falha ao realizar login. Verifique suas credenciais.';
      if (error.message.includes('E-mail ou senha inválidos')) {
        errorMessage = 'E-mail ou senha incorretos. Tente novamente.';
      } else if (error.message.includes('usuário não encontrado')) {
        errorMessage = 'Usuário não encontrado. Verifique seu e-mail.';
      }
      showMessage(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2e0000" />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            disabled={loading}
          >
            <Text style={styles.backButtonText}>← Voltar</Text>
          </TouchableOpacity>

          <View style={styles.contentWrapper}>
            <View style={styles.logoContainer}>
              <Image 
                source={require('../assets/images/bookstore-logo.png')} 
                style={styles.logo}
                resizeMode="cover"
              />
              <Text style={styles.title}>BookStore</Text>
              <Text style={styles.subtitle}>Bem-vindo de volta!</Text>
            </View>

            {message.text !== '' && (
              <View style={[styles.messageContainer, message.type === 'success' ? styles.successMessage : styles.errorMessage]}>
                <Text style={styles.messageText}>{message.text}</Text>
              </View>
            )}

            <View style={styles.formContainer}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>E-mail</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Digite seu e-mail"
                  placeholderTextColor="#999"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  value={email}
                  onChangeText={setEmail}
                  editable={!loading}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Senha</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Digite sua senha"
                    placeholderTextColor="#999"
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                    editable={!loading}
                  />
                  <TouchableOpacity 
                    style={styles.eyeButton}
                    onPress={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    <Ionicons 
                      name={showPassword ? 'eye' : 'eye-off'} 
                      size={24} 
                      color="#666" 
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity 
                style={[styles.loginButton, loading && styles.buttonDisabled]}
                onPress={handleLogin}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="large" />
                ) : (
                  <Text style={styles.loginButtonText}>Entrar</Text>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Não tem uma conta? </Text>
              <TouchableOpacity 
                onPress={() => navigation.navigate('Register')}
                disabled={loading}
              >
                <Text style={styles.footerLink}>Cadastre-se</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2e0000',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: isTablet ? 48 : 24,
    paddingTop: 20,
    paddingBottom: 30,
  },
  backButton: {
    marginBottom: 20,
  },
  backButtonText: {
    color: '#fff',
    fontSize: isTablet ? 18 : 16,
  },
  contentWrapper: {
    maxWidth: isTablet ? 500 : '100%',
    width: '100%',
    alignSelf: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: isTablet ? 120 : 100,
    height: isTablet ? 120 : 100,
    borderRadius: isTablet ? 60 : 50,
    marginBottom: 16,
  },
  title: {
    fontSize: isTablet ? 32 : 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: isTablet ? 18 : 16,
    color: '#999',
  },
  messageContainer: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center',
  },
  successMessage: {
    backgroundColor: '#4caf50',
  },
  errorMessage: {
    backgroundColor: '#f44336',
  },
  messageText: {
    color: '#fff',
    fontSize: isTablet ? 15 : 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  formContainer: {
    marginBottom: 30,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: isTablet ? 16 : 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: isTablet ? 18 : 16,
    fontSize: isTablet ? 17 : 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  passwordInput: {
    flex: 1,
    padding: isTablet ? 18 : 16,
    fontSize: isTablet ? 17 : 16,
    color: '#333',
  },
  eyeButton: {
    paddingHorizontal: 16,
    paddingVertical: isTablet ? 18 : 16,
  },
  loginButton: {
    backgroundColor: '#6e0c0c',
    borderRadius: 15,
    padding: isTablet ? 18 : 16,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#6e0c0c',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: isTablet ? 18 : 16,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    color: '#999',
    fontSize: isTablet ? 16 : 14,
  },
  footerLink: {
    color: '#6e0c0c',
    fontSize: isTablet ? 16 : 14,
    fontWeight: 'bold',
  },
});