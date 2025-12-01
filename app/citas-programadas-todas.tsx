// app/citas-programadas-todas.tsx
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

export default function CitasProgramadasTodasScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [citas, setCitas] = useState<Cita[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCitas = async () => {
      try {
        if (!id || typeof id !== 'string') return;

        const url = `https://api-ep-3czc.onrender.com/api/citas/programadas/${id}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('Error al obtener todas las citas programadas');
        const data = await res.json();

        const citasProcesadas = Array.isArray(data)
          ? data
              .filter((c: any) => c.estado === 'programada')
              .map((c: any) => ({
                id: c.id || c._id,
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
        setError('No se pudieron cargar las citas programadas.');
      } finally {
        setLoading(false);
      }
    };

    fetchCitas();
  }, [id]);

  const marcarComoHecha = async (idCita: string) => {
    try {
      await fetch(`https://api-ep-3czc.onrender.com/api/citas/marcar-hecha/${idCita}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      });
      setCitas(prev => prev.filter(c => c.id !== idCita));
    } catch (e) {
      console.error('❌ Error al marcar como hecha:', e);
    }
  };

  const cancelarCita = async (idCita: string) => {
    try {
      await fetch(`https://api-ep-3czc.onrender.com/api/citas/cancelar/${idCita}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      });
      setCitas(prev => prev.filter(c => c.id !== idCita));
    } catch (e) {
      console.error('❌ Error al cancelar cita:', e);
    }
  };

  const renderItem = ({ item }: { item: Cita }) => (
    <View style={styles.appointmentItem}>
      <Ionicons
        name={item.confirmado ? 'checkmark-circle-outline' : 'calendar-outline'}
        size={40}
        color={item.confirmado ? '#28a745' : '#007BFF'}
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

        <View style={styles.actionsRow}>
          <TouchableOpacity onPress={() => marcarComoHecha(item.id)} style={styles.actionButtonGreen}>
            <Ionicons name="checkmark" size={16} color="#fff" style={{ marginRight: 6 }} />
            <Text style={styles.actionText}>Hecha</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => cancelarCita(item.id)} style={styles.actionButtonRed}>
            <Ionicons name="close" size={16} color="#fff" style={{ marginRight: 6 }} />
            <Text style={styles.actionText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Todas las Citas Programadas</Text>
        <View style={{ width: 28 }} />
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#007BFF" />
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
              <Ionicons name="calendar-outline" size={40} color="#999" />
              <Text style={styles.emptyText}>No hay citas programadas</Text>
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
    alignItems: 'flex-start',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  appointmentDetails: { marginLeft: 15, flex: 1 },
  patientName: { fontSize: 16, fontWeight: '600', color: '#333' },
  appointmentDate: { fontSize: 14, color: '#888', marginTop: 2 },
  appointmentMotivo: { fontSize: 13, color: '#777', marginTop: 4 },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
    gap: 10,
  },
  actionButtonGreen: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#28a745',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  actionButtonRed: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dc3545',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  actionText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  errorText: { fontSize: 16, color: 'red', textAlign: 'center' },
  emptyText: { marginTop: 10, fontSize: 16, color: '#666' },
});

