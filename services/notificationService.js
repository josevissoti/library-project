import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

export async function showNotification(title, body, data = {}) {
  if (Platform.OS === 'web') {
    if (!('Notification' in window)) {
      console.warn('Este navegador não suporta notificações.');
      return;
    }
    if (Notification.permission === 'granted') {
      new Notification(title, { body, icon: '/favicon.png' });
    } else if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        new Notification(title, { body, icon: '/favicon.png' });
      }
    }
  } else {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      console.log('Permissão de notificações negada');
      return;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Geral',
        importance: Notifications.AndroidImportance.HIGH,
        sound: 'default',
      });
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: 'default',
      },
      trigger: null,
    });
  }
}

export async function showPurchaseNotification() {
  await showNotification(
    'Compra finalizada!',
    'Seu pedido foi registrado com sucesso. Obrigado por comprar na BookStore!',
    { type: 'purchase_completed' }
  );
}