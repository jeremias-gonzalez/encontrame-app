import React, { useState, useEffect } from 'react';
import { X, UserPlus, Check, AlertCircle } from 'lucide-react';
import { useUser } from '../../context/UserContext';

export function UserModal({ isOpen, onClose, editingUser = null, onSuccess }) {
  const { createUser, updateUser } = useUser();

  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [telefono, setTelefono] = useState('');
  const [telefonoSecundario, setTelefonoSecundario] = useState('');
  const [direccion, setDireccion] = useState('');
  const [ciudad, setCiudad] = useState('Córdoba');
  const [rol, setRol] = useState('dueno');
  const [activo, setActivo] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen) return;

    if (editingUser) {
      setNombre(editingUser.nombre || '');
      setEmail(editingUser.email || '');
      setContraseña(''); // En edición FastAPI no requiere contraseña
      setTelefono(editingUser.telefono || '');
      setTelefonoSecundario(editingUser.telefono_secundario || '');
      setDireccion(editingUser.direccion || '');
      setCiudad(editingUser.ciudad || 'Córdoba');
      setRol(editingUser.rol || 'dueno');
      setActivo(editingUser.activo ?? true);
    } else {
      setNombre('');
      setEmail('');
      setContraseña('');
      setTelefono('');
      setTelefonoSecundario('');
      setDireccion('');
      setCiudad('Córdoba');
      setRol('dueno');
      setActivo(true);
    }
    setError(null);
  }, [isOpen, editingUser]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!nombre.trim() || !email.trim()) {
      setError('Nombre y Email son obligatorios.');
      return;
    }
    if (!editingUser && (!contraseña || contraseña.length < 6)) {
      setError('La contraseña es obligatoria y debe tener al menos 6 caracteres.');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        nombre: nombre.trim(),
        email: email.trim(),
        telefono: telefono.trim() || null,
        telefono_secundario: telefonoSecundario.trim() || null,
        direccion: direccion.trim() || null,
        ciudad: ciudad.trim() || 'Córdoba',
        rol,
        activo,
      };

      if (!editingUser) {
        payload.contraseña = contraseña;
        await createUser(payload);
      } else {
        await updateUser(editingUser.id, payload);
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Error al guardar usuario en FastAPI.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-cafe/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-surface w-full max-w-lg rounded-3xl border border-primary/15 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 pb-4 border-b border-primary/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-primary/10 text-primary">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-text">
                {editingUser ? 'Editar Usuario' : 'Nuevo Usuario / Dueño'}
              </h3>
              <p className="text-xs text-textMuted">
                Endpoint FastAPI: /usuarios/
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-textMuted hover:bg-primary/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-textMuted mb-1 uppercase tracking-wider">
                Nombre Completo *
              </label>
              <input
                type="text"
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Carlos Gómez"
                className="w-full px-3.5 py-2.5 rounded-xl border border-primary/20 bg-surface text-text text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-textMuted mb-1 uppercase tracking-wider">
                Email *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="carlos@example.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-primary/20 bg-surface text-text text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              />
            </div>
          </div>

          {!editingUser && (
            <div>
              <label className="block text-xs font-bold text-textMuted mb-1 uppercase tracking-wider">
                Contraseña (mínimo 6 caracteres) *
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={contraseña}
                onChange={(e) => setContraseña(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl border border-primary/20 bg-surface text-text text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-textMuted mb-1 uppercase tracking-wider">
                Teléfono Principal
              </label>
              <input
                type="tel"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="+5493512345678"
                className="w-full px-3.5 py-2.5 rounded-xl border border-primary/20 bg-surface text-text text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-textMuted mb-1 uppercase tracking-wider">
                Teléfono Secundario
              </label>
              <input
                type="tel"
                value={telefonoSecundario}
                onChange={(e) => setTelefonoSecundario(e.target.value)}
                placeholder="+5493519876543"
                className="w-full px-3.5 py-2.5 rounded-xl border border-primary/20 bg-surface text-text text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-textMuted mb-1 uppercase tracking-wider">
                Dirección
              </label>
              <input
                type="text"
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                placeholder="Bv. San Juan 450"
                className="w-full px-3.5 py-2.5 rounded-xl border border-primary/20 bg-surface text-text text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-textMuted mb-1 uppercase tracking-wider">
                Ciudad
              </label>
              <input
                type="text"
                value={ciudad}
                onChange={(e) => setCiudad(e.target.value)}
                placeholder="Córdoba"
                className="w-full px-3.5 py-2.5 rounded-xl border border-primary/20 bg-surface text-text text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-textMuted mb-1 uppercase tracking-wider">
              Rol
            </label>
            <select
              value={rol}
              onChange={(e) => setRol(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-primary/20 bg-surface text-text text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none cursor-pointer"
            >
              <option value="dueno">Dueño / Tutor</option>
              <option value="veterinaria">Veterinaria</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          <div className="pt-4 border-t border-primary/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-textMuted hover:text-text transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl bg-primary hover:bg-primaryHover text-[#FBF7F1] dark:text-[#1E130C] transition shadow-md shadow-primary/20 disabled:opacity-50 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              {isSubmitting ? 'Guardando...' : (editingUser ? 'Guardar Cambios' : 'Crear Usuario')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UserModal;
