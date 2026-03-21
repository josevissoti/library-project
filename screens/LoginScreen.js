import React, { useState } from 'react';
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
  ActivityIndicator
} from 'react-native';
import { authService } from '../services/firebase';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' }); // type: 'success', 'error', ''

  const showMessage = (text, type) => {
    setMessage({ text, type });
    // Limpar mensagem após 3 segundos
    setTimeout(() => {
      setMessage({ text: '', type: '' });
    }, 3000);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      showMessage('Por favor, preencha todos os campos', 'error');
      return;
    }

    // Validação básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showMessage('Por favor, insira um e-mail válido', 'error');
      return;
    }

    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const user = await authService.loginUser(email, password);
      showMessage(`Bem-vindo(a), ${user.name}!`, 'success');
      
      // Aguardar um pouco para mostrar a mensagem antes de navegar
      setTimeout(() => {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Dashboard' }],
        });
      }, 1500);
      
    } catch (error) {
      let errorMessage = 'Falha ao realizar login. Verifique suas credenciais.';
      
      if (error.message.includes('E-mail ou senha inválidos')) {
        errorMessage = 'E-mail ou senha incorretos. Tente novamente.';
      } else if (error.message.includes('usuário não encontrado')) {
        errorMessage = 'Usuário não encontrado. Verifique seu e-mail.';
      } else if (error.message.includes('rede')) {
        errorMessage = 'Erro de conexão. Verifique sua internet.';
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

          <View style={styles.logoContainer}>
            <Image 
              source={require('../assets/images/bookstore-logo.png')} 
              style={styles.logo}
              resizeMode="cover"
            />
            <Text style={styles.title}>BookStore</Text>
            <Text style={styles.subtitle}>Bem-vindo de volta!</Text>
          </View>

          {/* Mensagem de feedback */}
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
              <TextInput
                style={styles.input}
                placeholder="Digite sua senha"
                placeholderTextColor="#999"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                editable={!loading}
              />
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
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 30,
  },
  backButton: {
    marginBottom: 20,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
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
    fontSize: 14,
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
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  loginButton: {
    backgroundColor: '#6e0c0c',
    borderRadius: 15,
    padding: 18,
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
    fontSize: 18,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    color: '#999',
    fontSize: 16,
  },
  footerLink: {
    color: '#6e0c0c',
    fontSize: 16,
    fontWeight: 'bold',
  },
});