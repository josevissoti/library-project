import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from './firebase';

export const migrateExistingUsers = async () => {
  try {
    // Buscar usuários existentes no AsyncStorage
    const usersJSON = await AsyncStorage.getItem('users');
    if (usersJSON) {
      const users = JSON.parse(usersJSON);
      
      console.log(`Encontrados ${users.length} usuários para migrar`);
      
      for (const user of users) {
        try {
          // Verificar se o usuário já existe no Firebase
          const emailExists = await authService.checkEmailExists(user.email);
          
          if (!emailExists) {
            // Migrar usuário para o Firebase
            await authService.registerUser({
              name: user.name,
              email: user.email,
              phone: user.phone,
              password: user.password
            });
            console.log(`✓ Usuário ${user.name} migrado com sucesso!`);
          } else {
            console.log(`- Usuário ${user.name} já existe no Firebase`);
          }
        } catch (error) {
          console.error(`✗ Erro ao migrar usuário ${user.name}:`, error.message);
        }
      }
      
      console.log('Migração concluída!');
    } else {
      console.log('Nenhum usuário encontrado para migrar');
    }
  } catch (error) {
    console.error('Erro na migração:', error);
  }
};