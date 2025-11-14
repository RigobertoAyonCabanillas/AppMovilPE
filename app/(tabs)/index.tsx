// app/(tabs)/index.tsx
import { router } from 'expo-router'; // ¡Asegúrate de que esta línea esté presente!
import React, { useState } from 'react';
import { Alert, Button, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (username && password) {
      // --- ESTA ES LA PARTE CLAVE ---
      // Ya no hay Alert aquí. La acción es navegar.
      if (username.toLowerCase() === 'armando') {
        console.log('Navegando a home-student con usuario:', username); // Para depurar
        router.replace({
          pathname: '/home-student',
          params: { user: username }
        });
      } else if (username.toLowerCase() === 'emiliano') {
        console.log('Navegando a home-admin con usuario:', username); // Para depurar
        router.replace({
          pathname: '/home-admin',
          params: { user: username }
        });
      } else {
        // Esta alerta sí se queda, para el caso de error
        Alert.alert('Error', 'Usuario no reconocido. Prueba con "armando" o "emiliano".');
      }
    } else {
      // Y esta también
      Alert.alert('Error', 'Por favor, completa todos los campos.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.loginContainer}>
        <Text style={styles.title}>Iniciar Sesión</Text>
        <TextInput
          style={styles.input}
          placeholder="Usuario (prueba: armando o emiliano)"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <Button title="Entrar" onPress={handleLogin} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', justifyContent: 'center' },
  loginContainer: { backgroundColor: 'white', padding: 20, margin: 20, borderRadius: 10 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { height: 40, borderColor: '#ccc', borderWidth: 1, borderRadius: 5, marginBottom: 15, paddingHorizontal: 10 },
});