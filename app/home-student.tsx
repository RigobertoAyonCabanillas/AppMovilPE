// app/home-student.tsx
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

export default function HomeStudentScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [userData, setUserData] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!id || typeof id !== 'string') {
          setError('ID de sesión inválido');
          setLoading(false);
          return;
        }

        const userRes = await fetch(`https://api-ep-3czc.onrender.com/api/usuarios/${id}`);
        const userJson = await userRes.json();

        if (userRes.ok && userJson?.nombre) {
          setUserData(userJson);
        } else {
          setError(userJson.error || 'Usuario no encontrado');
          return;
        }

        const citasRes = await fetch(`https://api-ep-3czc.onrender.com/api/citas/${id}`);
        const citasJson = await citasRes.json();

        if (citasRes.ok && Array.isArray(citasJson)) {
          // Aseguramos que estado exista para clasificación visual
          const citasProcesadas = citasJson.map((c: any) => ({
            id: c.id || c._id,
            profesional: c.profesional,
            rolProfesional: c.rolProfesional,
            tipo: c.tipo,
            fecha: c.fecha,
            motivo: c.motivo,
            estado: c.estado || 'programada',
          }));
          setAppointments(citasProcesadas);
        } else {
          setAppointments([]);
        }
      } catch (err) {
        console.error('Error de conexión:', err);
        setError('Error de conexión con la API');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007BFF" />
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

  if (!userData?.nombre) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>No se pudo cargar la información del usuario.</Text>
      </View>
    );
  }

  const handleLogout = () => {
    Alert.alert('Cerrar Sesión', '¿Estás seguro de que quieres salir?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Salir', onPress: () => router.replace('/') }
    ]);
  };

  const hoy = new Date();
  const citasFuturas = appointments.filter(cita => new Date(cita.fecha) >= hoy && cita.estado === 'programada');
  const citasPasadas = appointments.filter(cita => new Date(cita.fecha) < hoy || cita.estado !== 'programada');

  const renderAppointment = ({ item }: any) => {
    const fechaCita = new Date(item.fecha);
    const esPasadaPorFecha = fechaCita < hoy;

    const estado = item.estado;
    const esCancelada = estado === 'cancelada';
    const esHecha = estado === 'hecha';
    const esProgramada = estado === 'programada';

    let estadoVisual = null;
    if (esCancelada) {
      estadoVisual = (
        <View style={styles.estadoRow}>
          <Ionicons name="close-circle" size={16} color="#dc3545" style={{ marginRight: 4 }} />
          <Text style={styles.estadoCancelada}>Cita cancelada</Text>
        </View>
      );
    } else if (esHecha) {
      estadoVisual = (
        <View style={styles.estadoRow}>
          <Ionicons name="checkmark-circle" size={16} color="#28a745" style={{ marginRight: 4 }} />
          <Text style={styles.estadoHecha}>Cita realizada</Text>
        </View>
      );
    } else if (!esProgramada && esPasadaPorFecha) {
      estadoVisual = <Text style={styles.pastLabel}>Cita pasada</Text>;
    } else if (esProgramada && esPasadaPorFecha) {
      estadoVisual = <Text style={styles.pastLabel}>Cita pasada</Text>;
    }

    return (
      <View
        style={[
          styles.appointmentCard,
          esCancelada && { borderLeftColor: '#dc3545' },
          esHecha && { borderLeftColor: '#28a745' },
          !esCancelada && !esHecha && esPasadaPorFecha && { borderLeftColor: '#999', backgroundColor: '#f5f5f5' }
        ]}
      >
        <Text style={styles.appointmentDoctor}>{item.profesional}</Text>
        <Text style={styles.appointmentSpecialty}>
          {item.tipo} - {item.rolProfesional}
        </Text>
        <Text style={styles.appointmentDate}>
          {item.fecha} - {item.motivo}
        </Text>
        {estadoVisual}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>¡Hola, {userData.nombre}!</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity onPress={() => router.push({ pathname: '/perfil-student', params: { id } })}>
            <Ionicons name="person-outline" size={28} color="#007BFF" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Ionicons name="log-out-outline" size={28} color="#d9534f" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.actionCardsContainer}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push({ pathname: '/seleccionar-profesional', params: { id, rol: 'psicologo' } })}
          >
            <Ionicons name="heart-outline" size={40} color="#E91E63" />
            <Text style={styles.actionCardTitle}>Solicitar con Psicólogo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push({ pathname: '/seleccionar-profesional', params: { id, rol: 'enfermero' } })}
          >
            <Ionicons name="medical-outline" size={40} color="#2196F3" />
            <Text style={styles.actionCardTitle}>Solicitar con Enfermero</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.appointmentsSection}>
          <Text style={styles.sectionTitle}>📅 Próximas Citas</Text>
          <FlatList
            data={citasFuturas}
            renderItem={renderAppointment}
            keyExtractor={(item) => item.id || Math.random().toString()}
            ListEmptyComponent={<Text>No tienes citas futuras.</Text>}
          />
        </View>

        <View style={styles.appointmentsSection}>
          <Text style={styles.sectionTitle}>🕓 Citas Pasadas</Text>
          <FlatList
            data={citasPasadas}
            renderItem={renderAppointment}
            keyExtractor={(item) => item.id || Math.random().toString()}
            ListEmptyComponent={<Text>No hay citas anteriores.</Text>}
          />
        </View>
      </ScrollView>
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
  welcomeText: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  headerIcons: { flexDirection: 'row', alignItems: 'center' },
  logoutButton: { marginLeft: 15 },
  content: { flex: 1, padding: 20 },
  actionCardsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
  actionCard: {
    backgroundColor: '#fff',
    width: '48%',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionCardTitle: { marginTop: 10, fontSize: 14, fontWeight: '600', textAlign: 'center' },
  appointmentsSection: { marginTop: 10 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#333' },
  appointmentCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#007BFF',
  },
  appointmentDoctor: { fontSize: 16, fontWeight: 'bold' },
  appointmentSpecialty: { fontSize: 14, color: '#666', marginTop: 2 },
  appointmentDate: { fontSize: 12, color: '#999', marginTop: 5 },
  pastLabel: { fontSize: 12, color: '#999', marginTop: 6, fontStyle: 'italic' },
  estadoRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  estadoCancelada: { fontSize: 12, color: '#dc3545', fontWeight: '600' },
  estadoHecha: { fontSize: 12, color: '#28a745', fontWeight: '600' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  errorText: { fontSize: 16, color: 'red', textAlign: 'center' },
});








