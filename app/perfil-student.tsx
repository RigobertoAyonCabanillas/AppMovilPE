// app/perfil-student.tsx
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function PerfilStudentScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [perfil, setPerfil] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPerfil = async () => {
      if (!id) {
        setError("No se recibió el ID del estudiante.");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`https://api-ep-3czc.onrender.com/api/usuarios/${id}`);
        const json = await res.json();

        if (res.ok) {
          setPerfil(json);
        } else {
          setError(json.error || "Estudiante no encontrado.");
        }
      } catch (err) {
        console.error("Error al obtener perfil:", err);
        setError("Error al cargar el perfil.");
      } finally {
        setLoading(false);
      }
    };

    fetchPerfil();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007BFF" />
        <Text>Cargando perfil...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!perfil) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>No se pudo cargar el perfil.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mi Perfil</Text>
        <View style={{ width: 28 }} />
      </View>

      <View style={styles.content}>
        <Ionicons name="person-circle-outline" size={100} color="#ccc" />
        <Text style={styles.profileName}>{perfil.nombre}</Text>
        <Text style={styles.profileInfo}>Rol: {perfil.rol}</Text>
        <Text style={styles.profileInfo}>Grupo: {perfil.grupo || "Sin grupo"}</Text>
        <Text style={styles.profileInfo}>Carrera: {perfil.carrera || "Sin carrera"}</Text>
        <Text style={styles.profileInfo}>Matrícula: {perfil.matricula || "Sin matrícula"}</Text>
        <Text style={styles.profileInfo}>NIP: {perfil.nip}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  content: { flex: 1, alignItems: 'center', padding: 40 },
  profileName: { fontSize: 24, fontWeight: 'bold', marginTop: 15, color: '#333' },
  profileInfo: { fontSize: 16, color: '#666', marginTop: 5, textAlign: 'center' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  errorText: { fontSize: 16, color: 'red', textAlign: 'center' },
});


