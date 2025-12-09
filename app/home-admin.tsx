// app/home-admin.tsx
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  StyleSheet
} from 'react-native';

export default function HomeAdminScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [userData, setUserData] = useState<any>(null);
  const [cantidadHoy, setCantidadHoy] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Usuario
        const resUsuario = await fetch(`https://api-ep-3czc.onrender.com/api/usuarios/${id}`);
        if (!resUsuario.ok) throw new Error('Error al obtener usuario');
        const usuario = await resUsuario.json();
        setUserData(usuario);

        // Fecha de hoy en formato ISO (YYYY-MM-DD)
        const hoy = new Date().toLocaleDateString('en-CA');

        // Solo contar citas de hoy
        const resCitas = await fetch(`https://api-ep-3czc.onrender.com/api/citas/citas-contadas/${id}?fecha=${hoy}`);
        if (resCitas.ok) {
          const data = await resCitas.json();

          // Logs de depuración
          console.log('🧪 Respuesta citas-contadas:', data);
          console.log('🧪 ID recibido desde login:', id);

          if (typeof data.cantidad === 'number') {
            setCantidadHoy(data.cantidad);
          } else {
            setCantidadHoy(0);
          }
        } else {
          setCantidadHoy(0);
        }
      } catch (err) {
        console.error('Error en HomeAdmin:', err);
        setError('No se pudo cargar la información del usuario.');
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

  if (error || !userData) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error || 'No se pudo cargar la información del usuario.'}</Text>
      </View>
    );
  }

  const handleLogout = () => {
    Alert.alert('Cerrar Sesión', '¿Estás seguro de que quieres salir?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Salir', onPress: () => router.replace('/') }
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle} numberOfLines={1}>{userData.nombre}</Text>
          <View style={styles.roleBadge}>
            <Ionicons name="medkit" size={16} color="#fff" />
            <Text style={styles.roleText}>
              {userData.rol === 'psicologo' ? 'Psicólogo' : 'Enfermero'}
            </Text>
          </View>
        </View>

        <View style={styles.headerIcons}>
          <TouchableOpacity
            onPress={() => router.push({ pathname: '/perfil-admin', params: { id } })}
            style={styles.iconButton}
            accessibilityLabel="Perfil"
            accessibilityHint="Ir a perfil"
          >
            <Ionicons name="person-outline" size={20} color="#007BFF" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleLogout}
            style={[styles.iconButton, styles.logoutButton]}
            accessibilityLabel="Cerrar sesión"
            accessibilityHint="Cerrar sesión y volver al inicio"
          >
            <Ionicons name="log-out-outline" size={20} color="#d9534f" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Contenido */}
      <ScrollView style={styles.content}>
        {/* Citas de hoy */}
        <View style={styles.todaysSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Citas de Hoy</Text>
            <TouchableOpacity onPress={() => router.push({ pathname: '/citas-programadas', params: { id } })}>
              <Text style={styles.seeAllText}>Ver Todas</Text>
            </TouchableOpacity>
          </View>

          {/* Debug temporal */}
          <Text style={{ fontSize: 13, color: '#999', marginBottom: 10 }}>
            cantidadHoy: {cantidadHoy}
          </Text>

          {typeof cantidadHoy === 'number' && cantidadHoy > 0 ? (
            <View style={styles.todaySummary}>
              <Ionicons name="calendar" size={24} color="#007BFF" />
              <Text style={styles.todaySummaryText}>
                Tienes {cantidadHoy} cita{cantidadHoy > 1 ? 's' : ''} para el día de hoy
              </Text>
            </View>
          ) : (
            <View style={styles.noAppointments}>
              <Ionicons name="calendar-outline" size={24} color="#999" />
              <Text style={styles.noAppointmentsText}>Sin citas para el día de hoy</Text>
            </View>
          )}
        </View>

        {/* Acciones */}
        <View style={styles.actionCardsContainer}>
          <TouchableOpacity style={styles.actionCard} onPress={() =>
            router.push({ pathname: '/citas-programadas-todas', params: { id } })}>
            <Ionicons name="calendar-outline" size={40} color="#007BFF" />
            <Text style={styles.actionCardTitle}>Citas Programadas</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} onPress={() => router.push({ pathname: '/citas-hechas', params: { id } })}>
            <Ionicons name="checkmark-circle-outline" size={40} color="#28a745" />
            <Text style={styles.actionCardTitle}>Citas Hechas</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.actionCardsContainer}>
          <TouchableOpacity style={styles.actionCard} onPress={() => router.push({ pathname: '/citas-canceladas', params: { id } })}>
            <Ionicons name="close-circle-outline" size={40} color="#dc3545" />
            <Text style={styles.actionCardTitle}>Citas Canceladas</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export const styles = StyleSheet.create({
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
    borderBottomColor: '#eee'
  },
  headerInfo: { flexDirection: 'column', flexShrink: 1 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007BFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 4,
    alignSelf: 'flex-start'
  },
  roleText: { color: '#fff', fontSize: 13, fontWeight: '600', marginLeft: 6 },

  /* Header icons improved */
  headerIcons: { flexDirection: 'row', alignItems: 'center' },
  iconButton: {
    backgroundColor: '#f3f6fb',
    padding: 8,
    borderRadius: 10,
    marginLeft: 10,
    minWidth: 36,
    minHeight: 36,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  logoutButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#fdecea',
  },

  content: { flex: 1, padding: 20 },

  todaysSection: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15
  },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  seeAllText: { fontSize: 14, color: '#007BFF', fontWeight: '600' },

  todaySummary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10
  },
  todaySummaryText: {
    marginLeft: 10,
    fontSize: 15,
    fontWeight: '500',
    color: '#333'
  },

  noAppointments: { alignItems: 'center', paddingVertical: 20 },
  noAppointmentsText: { marginTop: 8, fontSize: 14, color: '#666' },

  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  errorText: { fontSize: 16, color: 'red', textAlign: 'center' },

  actionCardsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
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
    elevation: 3
  },
  actionCardTitle: { marginTop: 10, fontSize: 14, fontWeight: '600', textAlign: 'center' }
});




