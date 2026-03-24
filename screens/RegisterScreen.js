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
  ActivityIndicator,
  Dimensions
} from 'react-native';
import { authService } from '../services/firebase';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [passwordStrength, setPasswordStrength] = useState({
    hasLength: false,
    hasUpperCase: false,
    hasNumber: false,
    hasSymbol: false
  });

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => {
      setMessage({ text: '', type: '' });
    }, 3000);
  };

  const maskPhone = (value) => {
    const numbers = value.replace(/\D/g, '');
    
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    } else {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
  };

  const validateEmail = (email) => {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
  };

  const validatePhone = (phone) => {
    const numbers = phone.replace(/\D/g, '');
    return numbers.length >= 10 && numbers.length <= 11;
  };

  const validatePasswordStrength = (password) => {
    const hasLength = password.length >= 8 && password.length <= 30;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    setPasswordStrength({
      hasLength,
      hasUpperCase,
      hasNumber,
      hasSymbol
    });
    
    return hasLength && hasUpperCase && hasNumber && hasSymbol;
  };

  const getPasswordStrengthMessage = () => {
    const { hasLength, hasUpperCase, hasNumber, hasSymbol } = passwordStrength;
    
    if (!hasLength) return 'A senha deve ter entre 8 e 30 caracteres';
    if (!hasUpperCase) return 'A senha deve conter pelo menos uma letra maiúscula';
    if (!hasNumber) return 'A senha deve conter pelo menos um número';
    if (!hasSymbol) return 'A senha deve conter pelo menos um símbolo (!@#$%^&*)';
    return 'Senha forte!';
  };

  const getPasswordStrengthColor = () => {
    const { hasLength, hasUpperCase, hasNumber, hasSymbol } = passwordStrength;
    const allValid = hasLength && hasUpperCase && hasNumber && hasSymbol;
    
    if (allValid) return '#4caf50';
    if (hasLength || hasUpperCase || hasNumber || hasSymbol) return '#ff9800';
    return '#f44336';
  };

  const handleRegister = async () => {
    const newErrors = {};

    if (!name) {
      newErrors.name = 'Nome é obrigatório';
    } else if (name.length < 3) {
      newErrors.name = 'Nome deve ter pelo menos 3 caracteres';
    } else if (name.length > 100) {
      newErrors.name = 'Nome deve ter no máximo 100 caracteres';
    }
    
    if (!phone) {
      newErrors.phone = 'Telefone é obrigatório';
    } else if (!validatePhone(phone)) {
      newErrors.phone = 'Telefone inválido (DDD + 8 ou 9 dígitos)';
    }
    
    if (!email) {
      newErrors.email = 'E-mail é obrigatório';
    } else if (!validateEmail(email)) {
      newErrors.email = 'E-mail inválido (exemplo: nome@dominio.com)';
    }
    
    if (!password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (password.length < 8) {
      newErrors.password = 'Senha deve ter no mínimo 8 caracteres';
    } else if (password.length > 30) {
      newErrors.password = 'Senha deve ter no máximo 30 caracteres';
    } else if (!/[A-Z]/.test(password)) {
      newErrors.password = 'Senha deve conter pelo menos uma letra maiúscula';
    } else if (!/[0-9]/.test(password)) {
      newErrors.password = 'Senha deve conter pelo menos um número';
    } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      newErrors.password = 'Senha deve conter pelo menos um símbolo (!@#$%^&*)';
    }
    
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Confirme sua senha';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'As senhas não coincidem';
    }
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      setLoading(true);
      setMessage({ text: '', type: '' });
      
      try {
        await authService.registerUser({
          name,
          phone,
          email: email.toLowerCase(),
          password
        });
        
        showMessage('Cadastro realizado com sucesso! Redirecionando...', 'success');
        
        setTimeout(() => {
          setName('');
          setPhone('');
          setEmail('');
          setPassword('');
          setConfirmPassword('');
          setErrors({});
          setPasswordStrength({
            hasLength: false,
            hasUpperCase: false,
            hasNumber: false,
            hasSymbol: false
          });
          navigation.replace('Login');
        }, 2000);
        
      } catch (error) {
        let errorMessage = 'Falha ao realizar cadastro. Tente novamente.';
        
        if (error.message.includes('e-mail já está cadastrado')) {
          errorMessage = 'Este e-mail já está cadastrado. Use outro e-mail ou faça login.';
        } else if (error.message.includes('telefone já está cadastrado')) {
          errorMessage = 'Este telefone já está cadastrado. Use outro número.';
        }
        
        showMessage(errorMessage, 'error');
        console.error('Erro no cadastro:', error);
      } finally {
        setLoading(false);
      }
    } else {
      const firstError = Object.values(newErrors)[0];
      showMessage(`${firstError}`, 'error');
    }
  };

  const handlePasswordChange = (text) => {
    setPassword(text);
    validatePasswordStrength(text);
    if (errors.password) setErrors({...errors, password: null});
    if (message.text) setMessage({ text: '', type: '' });
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
              <Text style={styles.subtitle}>Crie sua conta</Text>
            </View>

            {message.text !== '' && (
              <View style={[styles.messageContainer, message.type === 'success' ? styles.successMessage : styles.errorMessage]}>
                <Text style={styles.messageText}>{message.text}</Text>
              </View>
            )}

            <View style={styles.formContainer}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nome completo</Text>
                <TextInput
                  style={[styles.input, errors.name ? styles.inputError : null]}
                  placeholder="Digite seu nome completo"
                  placeholderTextColor="#999"
                  value={name}
                  onChangeText={(text) => {
                    setName(text);
                    if (errors.name) setErrors({...errors, name: null});
                    if (message.text) setMessage({ text: '', type: '' });
                  }}
                  editable={!loading}
                />
                {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Telefone</Text>
                <TextInput
                  style={[styles.input, errors.phone ? styles.inputError : null]}
                  placeholder="(99) 99999-9999"
                  placeholderTextColor="#999"
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={(text) => {
                    const masked = maskPhone(text);
                    setPhone(masked);
                    if (errors.phone) setErrors({...errors, phone: null});
                    if (message.text) setMessage({ text: '', type: '' });
                  }}
                  maxLength={15}
                  editable={!loading}
                />
                {errors.phone ? <Text style={styles.errorText}>{errors.phone}</Text> : null}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>E-mail</Text>
                <TextInput
                  style={[styles.input, errors.email ? styles.inputError : null]}
                  placeholder="exemplo@email.com"
                  placeholderTextColor="#999"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (errors.email) setErrors({...errors, email: null});
                    if (message.text) setMessage({ text: '', type: '' });
                  }}
                  editable={!loading}
                />
                {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Senha</Text>
                <TextInput
                  style={[styles.input, errors.password ? styles.inputError : null]}
                  placeholder="Insira sua senha"
                  placeholderTextColor="#999"
                  secureTextEntry
                  value={password}
                  onChangeText={handlePasswordChange}
                  editable={!loading}
                />
                {password.length > 0 && (
                  <View style={styles.passwordStrengthContainer}>
                    <Text style={[styles.passwordStrengthText, { color: getPasswordStrengthColor() }]}>
                      {getPasswordStrengthMessage()}
                    </Text>
                    <View style={styles.passwordStrengthBar}>
                      <View 
                        style={[
                          styles.passwordStrengthFill, 
                          { 
                            width: `${(Object.values(passwordStrength).filter(v => v).length / 4) * 100}%`,
                            backgroundColor: getPasswordStrengthColor()
                          }
                        ]} 
                      />
                    </View>
                  </View>
                )}
                {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Confirmar senha</Text>
                <TextInput
                  style={[styles.input, errors.confirmPassword ? styles.inputError : null]}
                  placeholder="Confirme sua senha"
                  placeholderTextColor="#999"
                  secureTextEntry
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    if (errors.confirmPassword) setErrors({...errors, confirmPassword: null});
                    if (message.text) setMessage({ text: '', type: '' });
                  }}
                  editable={!loading}
                />
                {errors.confirmPassword ? <Text style={styles.errorText}>{errors.confirmPassword}</Text> : null}
              </View>

              <TouchableOpacity 
                style={[styles.registerButton, loading && styles.buttonDisabled]}
                onPress={handleRegister}
                activeOpacity={0.8}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.registerButtonText}>Criar conta</Text>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Já tem uma conta? </Text>
              <TouchableOpacity 
                onPress={() => navigation.navigate('Login')}
                disabled={loading}
              >
                <Text style={styles.footerLink}>Faça login</Text>
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
    marginBottom: 30,
  },
  logo: {
    width: isTablet ? 100 : 80,
    height: isTablet ? 100 : 80,
    borderRadius: isTablet ? 50 : 40,
    marginBottom: 12,
  },
  title: {
    fontSize: isTablet ? 28 : 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: isTablet ? 16 : 14,
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
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: isTablet ? 15 : 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: isTablet ? 16 : 14,
    fontSize: isTablet ? 16 : 15,
    color: '#333',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  inputError: {
    borderColor: '#ff6b6b',
    borderWidth: 2,
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 11,
    marginTop: 4,
    marginLeft: 4,
  },
  passwordStrengthContainer: {
    marginTop: 8,
  },
  passwordStrengthText: {
    fontSize: 11,
    marginBottom: 4,
  },
  passwordStrengthBar: {
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  passwordStrengthFill: {
    height: '100%',
    borderRadius: 2,
  },
  registerButton: {
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
  registerButtonText: {
    color: '#fff',
    fontSize: isTablet ? 17 : 16,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  footerText: {
    color: '#999',
    fontSize: isTablet ? 15 : 14,
  },
  footerLink: {
    color: '#6e0c0c',
    fontSize: isTablet ? 15 : 14,
    fontWeight: 'bold',
  },
});