import { Alert, Platform } from 'react-native';

// react-native-web's Alert.alert is a no-op, so fall back to the browser alert on web.
export function showAlert(title: string, message?: string): void {
  if (Platform.OS === 'web') {
    window.alert(message ? `${title}\n\n${message}` : title);
    return;
  }
  Alert.alert(title, message);
}
