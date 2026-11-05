import React, { useEffect, useState } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import { UserModal } from '../components/Modals/UserModal';
import { useToast } from '../context/ToastContext';
import { useUser } from '../context/UserContext';

export function UsersPage() {
  const { users, loading, error, fetchUsers, getUser, deleteUser } = useUser();
  const { showToast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionError, setActionError] = useState(null);

  useEffect(() => {
    fetchUsers().catch(() => {});
  }, [fetchUsers]);

  const showDetails = async (user) => {
    setActionError(null);
    try {
      setSelectedUser(await getUser(user.id));
    } catch (requestError) {
      setActionError(requestError.message);
    }
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`¿Desactivar a ${user.nombre}?`)) return;
    setActionError(null);
    try {
      await deleteUser(user.id, true);
      showToast('Usuario desactivado', `${user.nombre} quedó inactivo.`, 'success');
    } catch (requestError) {
      setActionError(requestError.message);
    }
  };

  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black text-title">Usuarios</h1>
          <p className="text-sm text-textMuted">Gestión de tutores, perfiles y mascotas asociadas.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => fetchUsers().catch(() => {})} className="inline-flex items-center gap-2 rounded-xl border border-primary/20 px-3 py-2 text-sm"><RefreshCw className="h-4 w-4" />Actualizar</button>
          <button onClick={() => { setEditingUser(null); setModalOpen(true); }} className="inline-flex items-center gap-2 rounded-xl bg-primary px-3 py-2 text-sm font-bold text-[#FBF7F1] transition hover:bg-primaryHover dark:text-[#1E130C]"><Plus className="h-4 w-4" />Nuevo usuario</button>
        </div>
      </header>
      {(actionError || error) && <p role="alert" className="rounded-xl bg-rose-500/10 p-3 text-sm text-rose-700 dark:text-rose-300">{actionError || error}</p>}
      {loading ? <p role="status" className="rounded-2xl bg-surface p-6 text-sm text-textMuted">Cargando usuarios…</p> : (
        <div className="overflow-x-auto rounded-2xl bg-surface shadow-sm">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="border-b border-primary/10 text-xs uppercase text-textMuted">
              <tr><th className="p-4">Nombre</th><th className="p-4">Email</th><th className="p-4">Teléfono</th><th className="p-4">Estado</th><th className="p-4">Acciones</th></tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-primary/5">
                  <td className="p-4 font-semibold">{user.nombre}</td><td className="p-4">{user.email}</td><td className="p-4">{user.telefono || '—'}</td><td className="p-4">{user.activo ? 'Activo' : 'Inactivo'}</td>
                  <td className="p-4"><div className="flex gap-3">
                    <button onClick={() => showDetails(user)} className="text-primary hover:underline">Detalle</button>
                    <button onClick={() => { setEditingUser(user); setModalOpen(true); }} className="text-primary hover:underline">Editar</button>
                    {user.activo && <button onClick={() => handleDelete(user)} className="text-rose-600 hover:underline">Desactivar</button>}
                  </div></td>
                </tr>
              ))}
              {users.length === 0 && <tr><td colSpan="5" className="p-8 text-center text-textMuted">No hay usuarios registrados.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
      {selectedUser && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-40 flex items-center justify-center bg-cafe/60 p-4 backdrop-blur-sm" onClick={() => setSelectedUser(null)}>
          <div className="w-full max-w-lg space-y-3 rounded-2xl bg-surface p-6 text-sm" onClick={(event) => event.stopPropagation()}>
            <h2 className="text-lg font-bold">{selectedUser.nombre}</h2><p>{selectedUser.email}</p><p>{selectedUser.telefono || 'Sin teléfono'}</p><p>{selectedUser.direccion || 'Sin dirección'} · {selectedUser.ciudad || ''}</p>
            <h3 className="font-bold">Mascotas ({selectedUser.mascotas?.length || 0})</h3>
            {selectedUser.mascotas?.map((pet) => <p key={pet.id}>{pet.nombre} · {pet.especie} · {pet.raza}</p>)}
            <button onClick={() => setSelectedUser(null)} className="rounded-xl bg-primary px-4 py-2 font-semibold text-[#FBF7F1] hover:bg-primaryHover dark:text-[#1E130C]">Cerrar</button>
          </div>
        </div>
      )}
      <UserModal
        isOpen={modalOpen}
        editingUser={editingUser}
        onClose={() => setModalOpen(false)}
        onSuccess={() => showToast('Usuario guardado', 'Los datos se sincronizaron con la API.', 'success')}
      />
    </section>
  );
}
