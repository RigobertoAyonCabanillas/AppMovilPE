// app/citas-hechas.tsx
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

type Cita = {
  id: string;
  paciente: string;
  fecha: string;
  hora: string;
  motivo: string;
  confirmado?: boolean;
  profesional?: string;
  rolProfesional?: string;
};

export default function CitasHechasScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [citas, setCitas] = useState<Cita[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCitas = async () => {
      try {
        if (!id || typeof id !== 'string') return;

        const url = `https://api-ep-3czc.onrender.com/api/citas/hechas/${id}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('Error al obtener las citas hechas');
        const data = await res.json();

        console.log("🧪 Citas hechas recibidas:", data);

        const citasProcesadas = Array.isArray(data)
          ? data.map((c: any) => ({
              id: c.id,
              paciente: c.paciente,
              fecha: c.fecha,
              hora: c.hora,
              motivo: c.motivo,
              confirmado: c.confirmado,
              profesional: c.profesional,
              rolProfesional: c.rolProfesional,
            }))
          : [];

        setCitas(citasProcesadas);
      } catch (e) {
        console.error('❌ Error en fetch:', e);
        setError('No se pudieron cargar las citas hechas.');
      } finally {
        setLoading(false);
      }
    };

    fetchCitas();
  }, [id]);

  const renderItem = ({ item }: { item: Cita }) => (
    <View style={styles.appointmentItem}>
      <Ionicons
        name="checkmark-circle-outline"
        size={40}
        color="#28a745"
      />
      <View style={styles.appointmentDetails}>
        <Text style={styles.patientName}>{item.paciente}</Text>
        <Text style={styles.appointmentDate}>
          {item.fecha} - {item.hora}
        </Text>
        <Text style={styles.appointmentMotivo}>Motivo: {item.motivo}</Text>
        {item.profesional && (
          <Text style={styles.appointmentMotivo}>
            Profesional: {item.profesional} ({item.rolProfesional})
          </Text>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Citas Hechas</Text>
        <View style={{ width: 28 }} />
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#28a745" />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={citas}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 20 }}
          ListEmptyComponent={
            <View style={styles.centered}>
              <Ionicons name="checkmark-circle-outline" size={40} color="#999" />
              <Text style={styles.emptyText}>No hay citas hechas</Text>
            </View>
          }
        />
      )}
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
  appointmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  appointmentDetails: { marginLeft: 15, flex: 1 },
  patientName: { fontSize: 16, fontWeight: '600', color: '#333' },
  appointmentDate: { fontSize: 14, color: '#888', marginTop: 2 },
  appointmentMotivo: { fontSize: 13, color: '#777', marginTop: 4 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  errorText: { fontSize: 16, color: 'red', textAlign: 'center' },
  emptyText: { marginTop: 10, fontSize: 16, color: '#666' },
});
