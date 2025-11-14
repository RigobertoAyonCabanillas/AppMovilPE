// app/citas-programadas.tsx
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const scheduledAppointments = [
  { id: '1', patientName: 'Armando Mata Flores', date: '18/10/2023', time: '10:00 AM' },
  { id: '2', patientName: 'Laura Sánchez Gómez', date: '18/10/2023', time: '11:30 AM' },
  { id: '3', patientName: 'Carlos Paredes Ruiz', date: '19/10/2023', time: '09:00 AM' },
];

export default function CitasProgramadasScreen() {
  const renderAppointmentItem = ({ item }: any) => (
    <View style={styles.appointmentItem}>
      <Ionicons name="person-circle-outline" size={40} color="#007BFF" />
      <View style={styles.appointmentDetails}>
        <Text style={styles.patientName}>{item.patientName}</Text>
        <Text style={styles.appointmentDate}>{item.date} - {item.time}</Text>
      </View>
    </View>
  );

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
        data={scheduledAppointments}
        renderItem={renderAppointmentItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20 }}
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
});