// app/home-student.tsx
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState, useCallback, useEffect, useRef } from 'react';
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
import { useFocusEffect } from '@react-navigation/native';

export default function HomeStudentScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [userData, setUserData] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchingRef = useRef(false);
  const pollingRef = useRef<number | null>(null);

  const startOfDay = (d: Date) => {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
  };

  const parseFirestoreTimestamp = (ts: any) => {
    if (!ts) return null;
    if (typeof ts === 'object' && (ts._seconds !== undefined || ts.seconds !== undefined)) {
      const seconds = ts._seconds ?? ts.seconds ?? 0;
      const nanos = ts._nanoseconds ?? ts.nanoseconds ?? 0;
      return new Date(seconds * 1000 + Math.floor(nanos / 1e6));
    }
    return null;
  };

  const tryParseDate = (raw: any) => {
    if (!raw) return null;
    if (raw instanceof Date) return raw;

    const fromTs = parseFirestoreTimestamp(raw);
    if (fromTs) return fromTs;

    if (raw && typeof raw === 'object' && (raw._seconds || raw.seconds)) {
      const fromObj = parseFirestoreTimestamp(raw);
      if (fromObj) return fromObj;
    }

    const s = String(raw).trim();
    const parsed = new Date(s);
    if (!isNaN(parsed.getTime())) return parsed;

    const mIso = s.match(/(\d{4}-\d{2}-\d{2})/);
    if (mIso) return new Date(mIso[1]);

    const mDMY = s.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
    if (mDMY) {
      const d = mDMY[1].padStart(2, '0');
      const mo = mDMY[2].padStart(2, '0');
      const y = mDMY[3];
      return new Date(`${y}-${mo}-${d}`);
    }

    return null;
  };

  const normalizeEstado = (raw: any) => {
    if (raw === null || raw === undefined) return 'programada';
    const s = String(raw).trim().toLowerCase();

    const mapProgram = ['programada', 'program', 'scheduled', 'agendada', 'agendado'];
    const mapPending = ['pendiente', 'pending', 'waiting'];
    const mapCancel = ['cancelada', 'cancelado', 'cancel', 'canceled', 'cancelled', 'anulada', 'anulado'];
    const mapDone = ['hecha', 'completada', 'completado', 'done', 'completed', 'realizada', 'finalizada', 'atendida', 'asistida', 'asistido', 'atendido'];

    if (mapProgram.includes(s)) return 'programada';
    if (mapPending.includes(s)) return 'pendiente';
    if (mapCancel.includes(s)) return 'cancelada';
    if (mapDone.includes(s)) return 'hecha';

    const n = Number(s);
    if (!Number.isNaN(n)) {
      if (n === 0) return 'programada';
      if (n === 1) return 'pendiente';
      if (n === 2) return 'hecha';
      if (n === 3) return 'cancelada';
    }

    if (s.includes('cancel') || s.includes('anul')) return 'cancelada';
    if (s.includes('done') || s.includes('complet') || s.includes('finaliz') || s.includes('atend')) return 'hecha';

    return 'programada';
  };

  const normalizeFromApi = (raw: any) => {
    const idVal = raw.id ?? raw._id ?? raw._docId ?? `${raw.fecha ?? raw.date ?? ''}-${raw.profesional ?? raw.paciente ?? ''}`;
    const fechaParsed = tryParseDate(raw.fechaHora ?? raw.fecha ?? raw.date ?? raw.createdAt);
    const fechaIso = fechaParsed ? fechaParsed.toISOString() : (raw.fecha ?? raw.date ?? '');
    const estado = normalizeEstado(raw.estado ?? raw.status ?? raw.state ?? raw.estado_cita ?? raw.statusCode);

    let profesionalNombre: string | null = null;
    const profRaw = raw.profesional ?? raw.profesionalId ?? raw.profesionalNombre ?? null;
    if (profRaw) {
      if (typeof profRaw === 'object') {
        profesionalNombre = profRaw.nombre ?? profRaw.name ?? profRaw.fullName ?? profRaw.displayName ?? null;
      } else {
        profesionalNombre = String(profRaw);
      }
    }
    const paciente = raw.paciente ?? raw.alumno ?? raw.usuario ?? null;
    const profesionalFinal = profesionalNombre || paciente || 'Desconocido';

    return {
      id: String(idVal),
      profesional: profesionalFinal,
      rolProfesional: raw.profesional?.rolProfesional ?? raw.rolProfesional ?? raw.rol ?? raw.tipo ?? '',
      tipo: raw.tipo ?? raw.tipoConsulta ?? raw.consulta ?? '',
      fecha: fechaIso,
      fechaParsed,
      motivo: raw.motivo ?? raw.descripcion ?? raw.reason ?? '',
      estado,
      raw
    };
  };

  const fetchData = async (silent = false) => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    if (!silent) {
      setLoading(true);
      setError(null);
    }

    try {
      if (!id || typeof id !== 'string') {
        setError('ID de sesión inválido');
        if (!silent) setLoading(false);
        return;
      }

      const userRes = await fetch(`https://api-ep-3czc.onrender.com/api/usuarios/${id}`);
      if (!userRes.ok) throw new Error('Error al obtener usuario');
      const userJson = await userRes.json();
      setUserData(userJson);

      const mainRes = await fetch(`https://api-ep-3czc.onrender.com/api/citas/${id}`);
      const mainJson = await mainRes.json().catch(() => null);
      console.log('DEBUG: citasJson (raw):', mainJson);

      const rawArray = Array.isArray(mainJson) ? mainJson : (mainJson?.data && Array.isArray(mainJson.data) ? mainJson.data : []);
      const normalizedMain = Array.isArray(rawArray) ? rawArray.map((r: any) => normalizeFromApi(r)) : [];

      const extraUrls = [
        `https://api-ep-3czc.onrender.com/api/citas/hechas/${id}`,
        `https://api-ep-3czc.onrender.com/api/citas/canceladas/${id}`
      ];
      const extraPromises = extraUrls.map(async (u) => {
        try {
          const res = await fetch(u);
          const json = await res.json().catch(() => null);
          const arr = Array.isArray(json) ? json : (json?.data && Array.isArray(json.data) ? json.data : []);
          return Array.isArray(arr) ? arr.map((r: any) => normalizeFromApi(r)) : [];
        } catch {
          return [];
        }
      });

      const extraArrays = await Promise.all(extraPromises);

      const all = [...normalizedMain, ...extraArrays.flat()];
      const map = new Map<string, any>();
      for (const c of all) {
        const key = String(c.id);
        const existing = map.get(key);
        if (!existing) {
          map.set(key, c);
        } else {
          const rank = (st: string) => (st === 'hecha' ? 4 : st === 'cancelada' ? 4 : st === 'pendiente' ? 3 : 2);
          const curRank = rank(existing.estado || 'programada');
          const newRank = rank(c.estado || 'programada');
          if (newRank >= curRank) map.set(key, { ...existing, ...c });
        }
      }

      const merged = Array.from(map.values());
      const counts = merged.reduce((acc: any, x: any) => { acc[x.estado] = (acc[x.estado] || 0) + 1; return acc; }, {});
      console.log('DEBUG: counts por estado (merged):', counts);

      setAppointments(merged);
    } catch (err) {
      console.error('Error fetchData:', err);
      if (!error) setError('Error de conexión con la API');
    } finally {
      if (!silent) setLoading(false);
      fetchingRef.current = false;
    }
  };

  useFocusEffect(useCallback(() => { fetchData(); }, [id]));

  useEffect(() => {
    if (!id) return;
    fetchData(true);
    const intervalMs = 15000;
    const idInterval = setInterval(() => fetchData(true), intervalMs);
    pollingRef.current = Number(idInterval);
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
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

  const hoyStart = startOfDay(new Date());

  const citasFuturas = appointments.filter(cita => {
    const fechaStart = cita.fechaParsed ? startOfDay(cita.fechaParsed) : null;
    return fechaStart && fechaStart >= hoyStart && (cita.estado === 'programada' || cita.estado === 'pendiente');
  });

  const citasPasadas = appointments.filter(cita => {
    const fechaStart = cita.fechaParsed ? startOfDay(cita.fechaParsed) : null;
    if (!['programada', 'pendiente'].includes(cita.estado)) return true;
    return fechaStart ? fechaStart < hoyStart : false;
  });

  const renderAppointment = ({ item }: any) => {
    const fechaStr = item.fechaParsed ? item.fechaParsed.toLocaleString() : String(item.fecha);
    const esCancelada = item.estado === 'cancelada';
    const esHecha = item.estado === 'hecha';

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
    } else {
      const fechaStart = item.fechaParsed ? startOfDay(item.fechaParsed) : null;
      if (fechaStart && fechaStart < hoyStart) estadoVisual = <Text style={styles.pastLabel}>Cita pasada</Text>;
    }

    return (
      <View
        style={[
          styles.appointmentCard,
          esCancelada && { borderLeftColor: '#dc3545' },
          esHecha && { borderLeftColor: '#28a745' },
          !esCancelada && !esHecha && (item.fechaParsed && startOfDay(item.fechaParsed) < hoyStart) && { borderLeftColor: '#999', backgroundColor: '#f5f5f5' }
        ]}
      >
        <Text style={styles.appointmentDoctor}>{item.profesional}</Text>
        <Text style={styles.appointmentSpecialty}>
          {item.tipo} - {item.rolProfesional}
        </Text>
        <Text style={styles.appointmentDate}>
          {fechaStr} - {item.motivo}
        </Text>
        {estadoVisual}
      </View>
    );
  };

  const handleLogout = () => {
    Alert.alert('Cerrar Sesión', '¿Estás seguro de que quieres salir?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Salir', onPress: () => router.replace('/') }
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.welcomeText} numberOfLines={1} ellipsizeMode="tail">
            ¡Hola, {userData.nombre}!
          </Text>
        </View>

        <View style={styles.headerIcons}>
          <TouchableOpacity
            onPress={() => router.push({ pathname: '/perfil-student', params: { id } })}
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
            keyExtractor={(item) => String(item.id)}
            ListEmptyComponent={<Text>No tienes citas futuras.</Text>}
          />
        </View>

        <View style={styles.appointmentsSection}>
          <Text style={styles.sectionTitle}>🕓 Citas Pasadas</Text>
          <FlatList
            data={citasPasadas}
            renderItem={renderAppointment}
            keyExtractor={(item) => String(item.id)}
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
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerLeft: {
    flex: 1,
    marginRight: 8,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    flexShrink: 1,
  },

  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  iconButton: {
    backgroundColor: '#f3f6fb',
    padding: 8,
    borderRadius: 10,
    marginLeft: 8,
    minWidth: 40,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#fdecea',
  },

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




















