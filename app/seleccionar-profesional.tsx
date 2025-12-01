import * as Linking from 'expo-linking';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Profesional = {
  id: string;            // 🔹 id real del profesional en Firestore
  nombre: string;
  especialidad: string;
  nip: string;
  rol: string;
};

export default function SeleccionarProfesional() {
  const { id, rol } = useLocalSearchParams<{ id: string; rol: string }>();
  const [profesionales, setProfesionales] = useState<Profesional[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfesionales = async () => {
      try {
        const res = await fetch(`https://api-ep-3czc.onrender.com/api/profesionales?rol=${rol}`);
        const json = await res.json();
        console.log("Respuesta cruda de la API:", json);

        if (res.ok && Array.isArray(json)) {
          console.log("Profesionales recibidos:", json);
          setProfesionales(json);
        } else {
          setError('No se pudo obtener la lista de profesionales.');
        }
      } catch (err) {
        console.error('Error al obtener profesionales:', err);
        setError('Error de conexión con la API.');
      } finally {
        setLoading(false);
      }
    };

    console.log("Seleccionar-profesional montado con:", { id, rol });
    if (rol) fetchProfesionales();
  }, [id, rol]);

  const handleSeleccion = (prof: Profesional) => {
    if (!id || !prof.id || !prof.nip || !prof.nombre || !rol) {
      console.warn("Datos incompletos para redirección:", { id, prof, rol });
      return;
    }

    // ✅ Incluimos usuarioId (estudiante) y profesionalId en la URL
    const url = `https://saludescolar-22785.web.app/?usuarioId=${encodeURIComponent(id)}&paciente=${encodeURIComponent(id)}&nip=${encodeURIComponent(prof.nip)}&profesional=${encodeURIComponent(prof.nombre)}&rol=${encodeURIComponent(rol)}&profesionalId=${encodeURIComponent(prof.id)}`;

    console.log("Redirigiendo a:", url);
    Linking.openURL(url);
  };

  // --- Estados de carga y error ---
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007BFF" />
        <Text style={styles.loadingText}>Cargando profesionales...</Text>
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

  // --- Render principal ---
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Selecciona un {rol === 'psicologo' ? 'Psicólogo' : 'Médico'}
      </Text>

      {profesionales.length === 0 ? (
        <View style={styles.centered}>
          <Text>No hay profesionales disponibles.</Text>
        </View>
      ) : (
        <FlatList
          data={profesionales}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card} onPress={() => handleSeleccion(item)}>
              <Text style={styles.name}>{item.nombre}</Text>
              <Text style={styles.detail}>{item.especialidad}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f8f9fa' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, color: '#333' },
  card: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#007BFF',
  },
  name: { fontSize: 16, fontWeight: 'bold', color: '#222' },
  detail: { fontSize: 14, color: '#666' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  loadingText: { marginTop: 10, fontSize: 14, color: '#555' },
  errorText: { fontSize: 16, color: 'red', textAlign: 'center' },
});




