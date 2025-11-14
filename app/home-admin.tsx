// app/home-admin.tsx
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import {
    Alert,
    FlatList,
    SafeAreaView,
    ScrollView // Importamos ScrollView
    ,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

// Datos de ejemplo para las citas de HOY
const todaysAppointments = [
  { id: '1', patientName: 'Armando Mata Flores', time: '10:00 AM' },
  { id: '2', patientName: 'Laura Sánchez Gómez', time: '11:30 AM' },
];

export default function HomeAdminScreen() {
  const { user } = useLocalSearchParams<{ user: string }>();

  const handleLogout = () => {
    Alert.alert(
      "Cerrar Sesión",
      "¿Estás seguro de que quieres salir?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Salir", 
          onPress: () => router.replace('/')
        }
      ]
    );
  };

  // Función para renderizar cada cita de hoy
  const renderTodayAppointment = ({ item }: any) => (
    <View style={styles.todayAppointmentItem}>
      <View style={styles.timeBadge}>
        <Text style={styles.timeText}>{item.time}</Text>
      </View>
      <Text style={styles.patientName}>{item.patientName}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header con nombre, perfil y logout (sin cambios) */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Panel de Dr. {user}</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity onPress={() => router.push('/perfil-admin')}>
            <Ionicons name="person-outline" size={28} color="#007BFF" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Ionicons name="log-out-outline" size={28} color="#d9534f" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Contenido principal dentro de un ScrollView para que se pueda hacer scroll si es necesario */}
      <ScrollView style={styles.scrollContent}>
        
        {/* --- NUEVA SECCIÓN: CITAS DE HOY --- */}
        <View style={styles.todaysSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Citas de Hoy</Text>
            <TouchableOpacity onPress={() => router.push('/citas-programadas')}>
              <Text style={styles.seeAllText}>Ver Todas</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={todaysAppointments}
            renderItem={renderTodayAppointment}
            keyExtractor={(item) => item.id}
            scrollEnabled={false} // Desactivamos el scroll de esta lista para que lo maneje el ScrollView padre
          />
        </View>

        {/* --- SECCIÓN DE BOTONES PRINCIPALES --- */}
        <View style={styles.content}>
          <Text style={styles.mainSectionTitle}>Gestión de Citas</Text>
          
          <TouchableOpacity style={styles.mainButton} onPress={() => router.push('/citas-programadas')}>
            <Ionicons name="calendar-outline" size={40} color="#007BFF" />
            <Text style={styles.mainButtonText}>Citas Programadas</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.mainButton} onPress={() => router.push('/citas-hechas')}>
            <Ionicons name="checkmark-circle-outline" size={40} color="#28a745" />
            <Text style={styles.mainButtonText}>Citas Hechas</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.mainButton} onPress={() => router.push('/citas-canceladas')}>
            <Ionicons name="close-circle-outline" size={40} color="#dc3545" />
            <Text style={styles.mainButtonText}>Citas Canceladas</Text>
          </TouchableOpacity>
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
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  headerIcons: { flexDirection: 'row', alignItems: 'center' },
  logoutButton: { marginLeft: 15 },
  
  // Estilos para el contenedor principal con scroll
  scrollContent: { flex: 1 },

  // --- Estilos para la nueva sección de "Citas de Hoy" ---
  todaysSection: {
    backgroundColor: '#fff',
    margin: 20,
    marginBottom: 10,
    padding: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  seeAllText: { fontSize: 14, color: '#007BFF', fontWeight: '600' },
  todayAppointmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  timeBadge: {
    backgroundColor: '#e9ecef',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginRight: 15,
  },
  timeText: { fontSize: 12, fontWeight: 'bold', color: '#495057' },
  patientName: { fontSize: 16, color: '#333' },

  // --- Estilos para la sección de botones principales ---
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40, // Espacio al final para que no quede pegado al borde
  },
  mainSectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#333',
  },
  mainButton: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mainButtonText: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 20,
    color: '#333',
  },
});