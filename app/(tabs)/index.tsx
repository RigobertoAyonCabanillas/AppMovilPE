// app/(tabs)/index.tsx
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Button,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';

export default function LoginScreen() {
  const [nombre, setNombre] = useState('');
  const [nip, setNip] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!nombre || !nip) {
      Alert.alert('Error', 'Por favor, completa todos los campos.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('https://api-ep-3czc.onrender.com/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: nombre.trim().toLowerCase(), nip: nip.trim() })
      });

      const data = await response.json();
      if (response.ok) {
        if (data.rol === 'estudiante') {
          router.replace({ pathname: '/home-student', params: { id: data.id } });
        } else if (data.rol === 'enfermero' || data.rol === 'psicologo') {
          router.replace({ pathname: '/home-admin', params: { id: data.id } });
        }
      } else {
        Alert.alert('Error de Login', data.error || 'Credenciales incorrectas.');
      }
    } catch (error) {
      Alert.alert('Error de conexión', 'No se pudo conectar con el servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007BFF" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.loginContainer}>
        {/* Icono de salud y título */}
        <Ionicons name="medkit-outline" size={80} color="#007BFF" style={{ alignSelf: 'center', marginBottom: 10 }} />
        <Text style={styles.title}>SaludEscolar</Text>

        {/* Inputs */}
        <TextInput
          style={styles.input}
          placeholder="Nombre"
          value={nombre}
          onChangeText={setNombre}
        />
        <TextInput
          style={styles.input}
          placeholder="NIP"
          value={nip}
          onChangeText={setNip}
          secureTextEntry
        />

        {/* Botón */}
        <Button title="Entrar" onPress={handleLogin} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', justifyContent: 'center' },
  loadingContainer: { flex: 1, backgroundColor: '#f5f5f5', justifyContent: 'center', alignItems: 'center' },
  loginContainer: { backgroundColor: 'white', padding: 20, margin: 20, borderRadius: 10 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#007BFF' },
  input: { height: 40, borderColor: '#ccc', borderWidth: 1, borderRadius: 5, marginBottom: 15, paddingHorizontal: 10 }
});

