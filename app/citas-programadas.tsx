// app/citas-programadas.tsx
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Cita = {
  id: string;
  paciente?: string;
  fecha?: string; // esperado YYYY-MM-DD
  hora?: string;
  motivo?: string;
};

export default function CitasProgramadasScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [citas, setCitas] = useState<Cita[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCitas = async () => {
      try {
        const hoy = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD
        const url = `https://api-ep-3czc.onrender.com/api/citas/citas-hoy/${id}?fecha=${hoy}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('Error al obtener citas');
        const data: Cita[] = await res.json();
        setCitas(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error('Error al cargar citas:', e);
        setError('No se pudieron cargar las citas.');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchCitas();
  }, [id]);

  const formatDate = (iso?: string) => {
    if (!iso) return 'Fecha';
    // Convierte YYYY-MM-DD -> DD/MM/YYYY
    const [y, m, d] = iso.split('-');
    return y && m && d ? `${d}/${m}/${y}` : iso;
  };

  const renderAppointmentItem = ({ item }: { item: Cita }) => (
    <View style={styles.appointmentItem}>
      <Ionicons name="person-circle-outline" size={40} color="#007BFF" />
      <View style={styles.appointmentDetails}>
        <Text style={styles.patientName}>{item.paciente || 'Paciente'}</Text>
        <Text style={styles.appointmentDate}>
          {formatDate(item.fecha)} - {item.hora || '—'}
        </Text>
        {item.motivo ? (
          <Text style={styles.appointmentMotivo}>Motivo: {item.motivo}</Text>
        ) : null}
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ paddingTop: 50, paddingHorizontal: 20, paddingBottom: 15, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={28} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Citas Programadas</Text>
          <View style={{ width: 28 }} />
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#007BFF" />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={28} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Citas Programadas</Text>
          <View style={{ width: 28 }} />
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ fontSize: 16, color: 'red', textAlign: 'center' }}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Citas Programadas</Text>
        <View style={{ width: 28 }} />
      </View>

      <FlatList
        data={citas}
        renderItem={renderAppointmentItem}
        keyExtractor={(item, idx) => item.id || String(idx)}
        contentContainerStyle={{ padding: 20 }}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', paddingVertical: 40 }}>
            <Ionicons name="calendar-outline" size={40} color="#999" />
            <Text style={{ marginTop: 10, fontSize: 16, color: '#666' }}>Sin citas para el día de hoy</Text>
          </View>
        }
      />
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
});
