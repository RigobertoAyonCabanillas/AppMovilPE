// app/perfil-admin.tsx
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function PerfilAdminScreen() {
    const { user } = useLocalSearchParams<{ user: string }>();

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={28} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Modificar Perfil</Text>
                <View style={{ width: 28 }} />
            </View>
            <View style={styles.content}>
                <Ionicons name="person-circle-outline" size={100} color="#ccc" />
                <Text style={styles.profileName}>Dr. {user}</Text>
                <Text style={styles.profileInfo}>Especialidad: Enfermería</Text>
                <TouchableOpacity style={styles.editButton}>
                    <Text style={styles.editButtonText}>Editar Información</Text>
                </TouchableOpacity>
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
    profileInfo: { fontSize: 16, color: '#666', marginTop: 5 },
    editButton: {
        marginTop: 30,
        backgroundColor: '#007BFF',
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 8,
    },
    editButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});