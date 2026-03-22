import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Animated,
  Dimensions
} from 'react-native';

const { width, height } = Dimensions.get('window');
const isTablet = width >= 768;

export default function HomeScreen({ navigation }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 20,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        delay: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2e0000" />
      
      <View style={styles.content}>
        <Animated.View 
          style={[
            styles.logoContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          <View style={styles.logoWrapper}>
            <Image 
              source={require('../assets/images/bookstore-logo.png')} 
              style={styles.logo}
              resizeMode="cover"
            />
          </View>
          <Text style={styles.appName}>BookStore</Text>
          <Text style={styles.appTagline}>
            Sua livraria virtual favorita
          </Text>
        </Animated.View>
      </View>

      <Animated.View 
        style={[
          styles.footer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.loginButton}
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.8}
          >
            <Text style={styles.loginButtonText}>Entrar</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.registerButton}
            onPress={() => navigation.navigate('Register')}
            activeOpacity={0.8}
          >
            <Text style={styles.registerButtonText}>Criar conta</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.termsText}>
          Ao continuar, você concorda com nossos{' '}
          <Text style={styles.termsLink}>Termos de Uso</Text> e{' '}
          <Text style={styles.termsLink}>Política de Privacidade</Text>
        </Text>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2e0000',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: isTablet ? 48 : 24,
  },
  logoContainer: {
    alignItems: 'center',
    maxWidth: isTablet ? 500 : '100%',
    width: '100%',
  },
  logoWrapper: {
    marginBottom: 16,
  },
  logo: {
    width: isTablet ? 120 : 100,
    height: isTablet ? 120 : 100,
    borderRadius: isTablet ? 60 : 50,
    marginBottom: 16,
  },
  appName: {
    fontSize: isTablet ? 48 : 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  appTagline: {
    fontSize: isTablet ? 18 : 16,
    color: '#999',
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: isTablet ? 48 : 24,
    paddingBottom: isTablet ? 40 : 30,
    paddingTop: 20,
    alignItems: 'center',
  },
  buttonContainer: {
    maxWidth: isTablet ? 400 : '100%',
    width: '100%',
    marginBottom: 20,
  },
  loginButton: {
    backgroundColor: '#6e0c0c',
    borderRadius: 12,
    padding: isTablet ? 18 : 16,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#6e0c0c',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: isTablet ? 18 : 16,
    fontWeight: 'bold',
  },
  registerButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: isTablet ? 18 : 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#6e0c0c',
  },
  registerButtonText: {
    color: '#6e0c0c',
    fontSize: isTablet ? 18 : 16,
    fontWeight: '600',
  },
  termsText: {
    textAlign: 'center',
    color: '#999',
    fontSize: isTablet ? 13 : 12,
    lineHeight: 18,
    maxWidth: isTablet ? 500 : '100%',
  },
  termsLink: {
    color: '#6e0c0c',
    fontWeight: '500',
  },
});