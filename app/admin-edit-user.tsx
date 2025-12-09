// app/admin-manage-users.tsx
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

type Role = 'estudiante' | 'psicologo' | 'enfermero' | 'administrador';

export default function AdminManageUsersScreen() {
  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);

  const [showUserModal, setShowUserModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  // Form
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [rol, setRol] = useState<Role>('estudiante');

  // estudiante
  const [matricula, setMatricula] = useState('');
  const [carrera, setCarrera] = useState('');
  const [grupo, setGrupo] = useState('');
  const [nipEstudiante, setNipEstudiante] = useState('');

  // profesional / admin
  const [nipProf, setNipProf] = useState('');
  const [especialidad, setEspecialidad] = useState('');
  const [activo, setActivo] = useState(true);

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    setUsersError(null);
    try {
      const res = await fetch('https://api-ep-3czc.onrender.com/api/usuarios');
      const json = await res.json();
      setUsers(Array.isArray(json) ? json : []);
    } catch (e) {
      console.error('fetchUsers error', e);
      setUsersError('No se pudo cargar la lista de usuarios');
    } finally {
      setLoadingUsers(false);
    }
  };

  const clearForm = () => {
    setSelectedUser(null);
    setNombre(''); setEmail(''); setRol('estudiante');
    setMatricula(''); setCarrera(''); setGrupo(''); setNipEstudiante('');
    setNipProf(''); setEspecialidad(''); setActivo(true);
    setMsg(null); setErr(null);
  };

  const fillFormFromUser = (u: any) => {
    setSelectedUser(u);
    setNombre(u.nombre ?? '');
    setEmail(u.email ?? '');
    setRol(u.rol ?? 'estudiante');
    setMatricula(u.matricula ?? '');
    setCarrera(u.carrera ?? '');
    setGrupo(u.grupo ?? '');
    setNipEstudiante(u.nip ?? '');
    setNipProf(u.nip ?? '');
    setEspecialidad(u.especialidad ?? '');
    setActivo(u.activo === undefined ? true : !!u.activo);
  };

  const validateForSave = () => {
    if (!nombre.trim()) return 'El nombre es obligatorio';
    if (rol === 'estudiante') {
      if (!matricula.trim()) return 'La matrícula es obligatoria';
      if (!carrera.trim()) return 'La carrera es obligatoria';
      if (!grupo.trim()) return 'El grupo es obligatorio';
      if (!nipEstudiante.trim()) return 'El NIP del estudiante es obligatorio';
    }
    if (rol === 'psicologo' || rol === 'enfermero') {
      if (!nipProf.trim()) return 'El NIP del profesional es obligatorio';
      if (!especialidad.trim()) return 'La especialidad es obligatoria';
    }
    if (rol === 'administrador') {
      if (!nipProf.trim()) return 'El NIP del administrador es obligatorio';
    }
    if (email && !/^\S+@\S+\.\S+$/.test(email)) return 'Correo inválido';
    return null;
  };

  const handleCreate = async () => {
    const v = validateForSave();
    if (v) { setErr(v); return; }
    setLoading(true); setErr(null); setMsg(null);
    try {
      const payload: any = { nombre: nombre.trim(), rol };
      if (email.trim()) payload.email = email.trim();
      if (rol === 'estudiante') {
        payload.matricula = matricula.trim();
        payload.carrera = carrera.trim();
        payload.grupo = grupo.trim();
        payload.nip = nipEstudiante.trim();
      } else {
        payload.nip = nipProf.trim();
        payload.especialidad = especialidad.trim();
        payload.activo = activo;
      }
      const res = await fetch('https://api-ep-3czc.onrender.com/api/usuarios', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) { setErr((json && (json.error || json.message)) || 'Error al crear usuario'); }
      else {
        setMsg('Usuario creado correctamente');
        clearForm();
        fetchUsers();
      }
    } catch (e) {
      console.error(e); setErr('Error de conexión');
    } finally { setLoading(false); }
  };

  const handleUpdate = async () => {
    if (!selectedUser || !selectedUser.id) { setErr('Selecciona un usuario para actualizar'); return; }
    const v = validateForSave();
    if (v) { setErr(v); return; }
    setLoading(true); setErr(null); setMsg(null);
    try {
      const payload: any = { nombre: nombre.trim(), rol };
      if (email.trim()) payload.email = email.trim(); else payload.email = '';
      if (rol === 'estudiante') {
        payload.matricula = matricula.trim();
        payload.carrera = carrera.trim();
        payload.grupo = grupo.trim();
        payload.nip = nipEstudiante.trim();
      } else {
        payload.nip = nipProf.trim();
        payload.especialidad = especialidad.trim();
        payload.activo = activo;
      }
      const res = await fetch(`https://api-ep-3czc.onrender.com/api/usuarios/${selectedUser.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const j = await res.json().catch(() => null);
        setErr((j && (j.error || j.message)) || 'No se pudo actualizar');
      } else {
        setMsg('Usuario actualizado');
        fetchUsers();
      }
    } catch (e) {
      console.error(e); setErr('Error de conexión');
    } finally { setLoading(false); }
  };

  const handleDelete = async () => {
    if (!selectedUser || !selectedUser.id) { setErr('Selecciona un usuario para eliminar'); return; }
    Alert.alert('Confirmar eliminación', `Eliminar a ${selectedUser.nombre || selectedUser.id}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar', style: 'destructive', onPress: async () => {
          setLoading(true); setErr(null); setMsg(null);
          try {
            const res = await fetch(`https://api-ep-3czc.onrender.com/api/usuarios/${selectedUser.id}`, { method: 'DELETE' });
            if (!res.ok) {
              const j = await res.json().catch(() => null);
              setErr((j && (j.error || j.message)) || 'No se pudo eliminar');
            } else {
              setMsg('Usuario eliminado');
              clearForm();
              fetchUsers();
            }
          } catch (e) {
            console.error(e); setErr('Error de conexión al eliminar');
          } finally { setLoading(false); }
        }
      }
    ]);
  };

  const onSelectUserFromModal = (u: any) => {
    fillFormFromUser(u);
    setShowUserModal(false);
  };

  const filteredUsers = users.filter(u => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (u.nombre || '').toLowerCase().includes(q) || (u.nip || '').toLowerCase().includes(q) || (u.id || '').toLowerCase().includes(q);
  });

  // ---------------------------
  // CIERRE DE SESIÓN (solo redirección al index)
  // ---------------------------
  const confirmAndLogout = () => {
    Alert.alert('Cerrar Sesión', '¿Deseas cerrar sesión y volver al inicio?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Salir', style: 'destructive', onPress: logout }
    ]);
  };

  const logout = () => {
    // redirige inmediatamente al index (login)
    router.replace('/');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Administrar Usuarios</Text>

          <View style={styles.headerIcons}>
            <TouchableOpacity onPress={() => { fetchUsers(); }} style={styles.iconButton}>
              <Ionicons name="refresh" size={20} color="#007BFF" />
            </TouchableOpacity>

            <TouchableOpacity onPress={confirmAndLogout} style={[styles.iconButton, styles.logoutButton]}>
              <Ionicons name="log-out-outline" size={20} color="#d9534f" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.card}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={styles.sectionTitle}>{selectedUser ? 'Editar usuario seleccionado' : 'Crear nuevo usuario'}</Text>
            <TouchableOpacity onPress={() => setShowUserModal(true)} style={{ padding: 6 }}>
              <Ionicons name="people-outline" size={22} color="#007BFF" />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Nombre</Text>
          <TextInput value={nombre} onChangeText={setNombre} style={styles.input} placeholder="" />

          <Text style={styles.label}>Correo (opcional)</Text>
          <TextInput value={email} onChangeText={setEmail} style={styles.input} placeholder="" keyboardType="email-address" />

          <Text style={styles.label}>Rol</Text>
          <View style={styles.roleRow}>
            <TouchableOpacity style={[styles.roleButton, rol === 'estudiante' && styles.roleButtonActive]} onPress={() => setRol('estudiante')}>
              <Text style={[styles.roleText, rol === 'estudiante' && styles.roleTextActive]}>Estudiante</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.roleButton, rol === 'psicologo' && styles.roleButtonActive]} onPress={() => setRol('psicologo')}>
              <Text style={[styles.roleText, rol === 'psicologo' && styles.roleTextActive]}>Psicólogo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.roleButton, rol === 'enfermero' && styles.roleButtonActive]} onPress={() => setRol('enfermero')}>
              <Text style={[styles.roleText, rol === 'enfermero' && styles.roleTextActive]}>Enfermero</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.roleButton, rol === 'administrador' && styles.roleButtonActive]} onPress={() => setRol('administrador')}>
              <Text style={[styles.roleText, rol === 'administrador' && styles.roleTextActive]}>Administrador</Text>
            </TouchableOpacity>
          </View>

          {rol === 'estudiante' && (
            <>
              <Text style={styles.label}>Matrícula</Text>
              <TextInput value={matricula} onChangeText={setMatricula} style={styles.input} />
              <Text style={styles.label}>Carrera</Text>
              <TextInput value={carrera} onChangeText={setCarrera} style={styles.input} />
              <Text style={styles.label}>Grupo</Text>
              <TextInput value={grupo} onChangeText={setGrupo} style={styles.input} />
              <Text style={styles.label}>NIP</Text>
              <TextInput value={nipEstudiante} onChangeText={setNipEstudiante} style={styles.input} autoCapitalize="none" />
            </>
          )}

          {(rol === 'psicologo' || rol === 'enfermero' || rol === 'administrador') && (
            <>
              <Text style={styles.label}>NIP</Text>
              <TextInput value={nipProf} onChangeText={setNipProf} style={styles.input} autoCapitalize="none" />
              <Text style={styles.label}>Especialidad</Text>
              <TextInput value={especialidad} onChangeText={setEspecialidad} style={styles.input} />
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                <Text style={{ marginRight: 8 }}>Activo</Text>
                <TouchableOpacity onPress={() => setActivo(!activo)} style={[styles.toggle, activo ? styles.toggleOn : styles.toggleOff]}>
                  <Text style={{ color: '#fff', fontWeight: '700' }}>{activo ? 'ON' : 'OFF'}</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {err ? <Text style={styles.errorText}>{err}</Text> : null}
          {msg ? <Text style={styles.successText}>{msg}</Text> : null}

          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.cancelButton} onPress={clearForm} disabled={loading}>
              <Text style={styles.cancelText}>Limpiar</Text>
            </TouchableOpacity>

            {selectedUser ? (
              <>
                <TouchableOpacity style={[styles.saveButton, { marginRight: 8 }]} onPress={handleUpdate} disabled={loading}>
                  {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveText}>Actualizar</Text>}
                </TouchableOpacity>
                <TouchableOpacity style={[styles.deleteButton]} onPress={handleDelete} disabled={loading}>
                  {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.deleteText}>Eliminar</Text>}
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity style={styles.saveButton} onPress={handleCreate} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveText}>Crear</Text>}
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Modal selector de usuarios */}
        <Modal visible={showUserModal} transparent animationType="fade" onRequestClose={() => setShowUserModal(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={{ fontWeight: '700', marginBottom: 8 }}>Seleccionar usuario</Text>
              <TextInput value={searchQuery} onChangeText={setSearchQuery} placeholder="Buscar por nombre, NIP o id" style={styles.input} />
              {loadingUsers ? <ActivityIndicator style={{ marginTop: 12 }} /> : usersError ? <Text style={{ color: '#d9534f', marginTop: 12 }}>{usersError}</Text> : (
                <FlatList
                  data={filteredUsers}
                  keyExtractor={(i) => i.id}
                  style={{ maxHeight: 320, marginTop: 8 }}
                  renderItem={({ item }) => {
                    const isSelected = selectedUser && selectedUser.id === item.id;
                    return (
                      <TouchableOpacity
                        onPress={() => onSelectUserFromModal(item)}
                        style={[styles.userRow, isSelected && { backgroundColor: '#eef6ff' }]}
                      >
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontWeight: '600' }}>{item.nombre || item.id}</Text>
                          <Text style={{ color: '#666', fontSize: 12 }}>{item.rol || ''} {item.nip ? `• NIP: ${item.nip}` : ''}</Text>
                        </View>
                        {isSelected ? <Ionicons name="checkmark" size={18} color="#007BFF" /> : null}
                      </TouchableOpacity>
                    );
                  }}
                />
              )}

              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12 }}>
                <TouchableOpacity onPress={() => { setShowUserModal(false); setSearchQuery(''); }} style={{ marginRight: 12 }}>
                  <Text style={{ color: '#333' }}>Cerrar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f6f7fb' },
  content: { padding: 20 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#333' },

  /* Header icons styling similar to home-student */
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

  card: { backgroundColor: '#fff', padding: 16, borderRadius: 12, elevation: 2 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#333' },
  label: { fontSize: 13, color: '#555', marginTop: 8 },
  input: { marginTop: 6, borderWidth: 1, borderColor: '#e6e6e6', borderRadius: 8, padding: 12, fontSize: 15, backgroundColor: '#fff' },
  roleRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, flexWrap: 'wrap' },
  roleButton: { padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#ddd', marginRight: 8, marginTop: 8 },
  roleButtonActive: { backgroundColor: '#007BFF', borderColor: '#007BFF' },
  roleText: { color: '#333', fontWeight: '600' },
  roleTextActive: { color: '#fff' },
  actionsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 },
  cancelButton: { flex: 1, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#ccc', marginRight: 8, alignItems: 'center' },
  cancelText: { color: '#333', fontWeight: '600' },
  saveButton: { flex: 1, padding: 12, borderRadius: 8, backgroundColor: '#007BFF', alignItems: 'center', marginRight: 8 },
  saveText: { color: '#fff', fontWeight: '700' },
  deleteButton: { flex: 1, padding: 12, borderRadius: 8, backgroundColor: '#dc3545', alignItems: 'center' },
  deleteText: { color: '#fff', fontWeight: '700' },
  errorText: { marginTop: 10, color: '#d9534f', fontWeight: '600' },
  successText: { marginTop: 10, color: '#28a745', fontWeight: '600' },
  toggle: { padding: 8, borderRadius: 8 },
  toggleOn: { backgroundColor: '#28a745' },
  toggleOff: { backgroundColor: '#999' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  modalCard: { width: '92%', backgroundColor: '#fff', padding: 16, borderRadius: 12 },
  userRow: { flexDirection: 'row', alignItems: 'center', padding: 10, borderRadius: 8, marginBottom: 6, backgroundColor: '#fff' }
});










