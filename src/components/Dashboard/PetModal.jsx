import React, { useState, useEffect } from 'react';
import { X, PawPrint, User, Radio, Sparkles, Check, AlertCircle } from 'lucide-react';
import { useUser } from '../../context/UserContext';
import { api } from '../../api/config';

const PRESET_PHOTOS = [
  { label: 'Golden', url: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=600&q=80' },
  { label: 'Siamés', url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=600&q=80' },
  { label: 'Bulldog', url: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=600&q=80' },
  { label: 'Caniche', url: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=600&q=80' },
  { label: 'Mestizo', url: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80' },
  { label: 'Atigrado', url: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&w=600&q=80' },
];


export function PetModal({ isOpen, onClose, onSave, editingPet = null }) {
  // Contextos
  const { users, fetchUsers } = useUser();

  // Pestaña activa del formulario
  const [activeTab, setActiveTab] = useState('pet');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  // Estados de Mascota (Mapeados 1:1 con FastAPI README.md l. 153-169)
  const [nombre, setNombre] = useState('');
  const [especie, setEspecie] = useState('Perro');
  const [raza, setRaza] = useState('');
  const [color, setColor] = useState('Marrón');
  const [fotoUrl, setFotoUrl] = useState(PRESET_PHOTOS[0].url);
  const [estadoExtravio, setEstadoExtravio] = useState('en_casa');
  const [notasMedicas, setNotasMedicas] = useState('');
  const [mensajePersonalizado, setMensajePersonalizado] = useState('');
  const [mostrarTelefono, setMostrarTelefono] = useState(true);
  const [mostrarDireccion, setMostrarDireccion] = useState(false);
  const [recompensa, setRecompensa] = useState('');
  const [usuarioId, setUsuarioId] = useState('');
  const [tagId, setTagId] = useState('');

  // Estados complementarios de UI
  const [gender, setGender] = useState('macho');
  const [birthDate, setBirthDate] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [isSterilized, setIsSterilized] = useState(false);
  const [microchipNumber, setMicrochipNumber] = useState('');

  // Estados de tutor local (en caso de no elegir usuario_id de la lista)
  const [guardianName, setGuardianName] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [guardianEmail, setGuardianEmail] = useState('');
  const [guardianAddress, setGuardianAddress] = useState('');

  // Estados de NFC
  const [hasNfc, setHasNfc] = useState(false);
  const [tagCode, setTagCode] = useState('');
  const [availableTags, setAvailableTags] = useState([]);

  // useEffect para sincronizar cuando se abre el modal o cambia editingPet
  useEffect(() => {
    if (!isOpen) return;

    if (editingPet) {
      setNombre(editingPet.nombre || editingPet.name || '');
      setEspecie(editingPet.especie || editingPet.species || 'Perro');
      setRaza(editingPet.raza || editingPet.breed || '');
    
      setFotoUrl(editingPet.foto_url || editingPet.photoUrl || PRESET_PHOTOS[0].url);
      setEstadoExtravio(editingPet.estado_extravio || (editingPet.isLost ? 'perdido' : 'en_casa'));
      setNotasMedicas(editingPet.notas_medicas || editingPet.medicalNotes || '');
      setMensajePersonalizado(editingPet.mensaje_personalizado || editingPet.guardian?.emergencyNotes || '');
      setMostrarTelefono(editingPet.mostrar_telefono !== undefined ? editingPet.mostrar_telefono : true);
      setMostrarDireccion(editingPet.mostrar_direccion !== undefined ? editingPet.mostrar_direccion : false);
      setRecompensa(editingPet.recompensa || '');
      setUsuarioId(editingPet.usuario_id ? String(editingPet.usuario_id) : '');
      setTagId(editingPet.tag_id ? String(editingPet.tag_id) : '');

      setGender(editingPet.gender || 'macho');
      setBirthDate(editingPet.birthDate || '');
      setWeightKg(editingPet.weightKg ? String(editingPet.weightKg) : '');
      setIsSterilized(editingPet.isSterilized ?? false);
      setMicrochipNumber(editingPet.microchipNumber || '');

      setGuardianName(editingPet.guardian?.name || editingPet.usuario?.nombre || '');
      setGuardianPhone(editingPet.guardian?.phone || editingPet.usuario?.telefono || '');
      setGuardianEmail(editingPet.guardian?.email || editingPet.usuario?.email || '');
      setGuardianAddress(editingPet.guardian?.address || editingPet.usuario?.direccion || '');

      setHasNfc(!!editingPet.nfcTag || !!editingPet.tag_id);
      setTagCode(editingPet.nfcTag?.tagCode || '');
    } else {
      // Reset formulario limpio
      setNombre('');
      setEspecie('Perro');
      setRaza('');
      setFotoUrl(PRESET_PHOTOS[0].url);
      setEstadoExtravio('en_casa');
      setNotasMedicas('');
      setMensajePersonalizado('');
      setMostrarTelefono(true);
      setMostrarDireccion(false);
      setRecompensa('');
      setUsuarioId(users.length > 0 ? String(users[0].id) : '');
      setTagId('');
      setGender('macho');
      setBirthDate('');
      setWeightKg('');
      setIsSterilized(false);
      setMicrochipNumber('');
      setGuardianName('');
      setGuardianPhone('');
      setGuardianEmail('');
      setGuardianAddress('');
      setHasNfc(false);
      setTagCode('');
    }

    setFormError(null);
    setActiveTab('pet');
  }, [isOpen, editingPet, users]);

  // useEffect para cargar tags disponibles desde FastAPI
  useEffect(() => {
    if (!isOpen) return;
    let isCancelled = false;

    async function loadTags() {
      try {
        const res = await api.get('/tags/?page=1&size=50');
        const list = Array.isArray(res) ? res : (res?.items || []);
        if (!isCancelled) {
          setAvailableTags(list);
        }
      } catch (e) {
        console.warn('FastAPI tags no disponibles, operando en modo local:', e.message);
      }
    }

    loadTags();
    fetchUsers();

    return () => {
      isCancelled = true;
    };
  }, [isOpen, fetchUsers]);

  if (!isOpen) return null;

  const generateRandomTagCode = () => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    setTagCode(`ENC-${randomNum}-NFC`);
  };

  const handleSelectUser = (id) => {
    setUsuarioId(id);
    const selected = users.find((u) => String(u.id) === String(id));
    if (selected) {
      setGuardianName(selected.nombre || '');
      setGuardianPhone(selected.telefono || '');
      setGuardianEmail(selected.email || '');
      setGuardianAddress(selected.direccion || '');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!nombre.trim()) {
      setActiveTab('pet');
      setFormError('El nombre de la mascota es obligatorio.');
      return;
    }
    if (!raza.trim()) {
      setActiveTab('pet');
      setFormError('La raza es obligatoria.');
      return;
    }

    try {
      setIsSubmitting(true);

      // Request Body exacto de FastAPI README.md l. 153-169
      const payload = {
        nombre: nombre.trim(),
        especie: especie.trim(),
        raza: raza.trim(),
        foto_url: fotoUrl.trim(),
        estado_extravio: estadoExtravio,
        notas_medicas: notasMedicas.trim() || null,
        mensaje_personalizado: mensajePersonalizado.trim() || null,
        mostrar_telefono: Boolean(mostrarTelefono),
        mostrar_direccion: Boolean(mostrarDireccion),
        recompensa: recompensa.trim() || null,
        estado: true,
        tag_id: tagId ? Number(tagId) : null,
        usuario_id: usuarioId ? Number(usuarioId) : null,

        // Metadatos adicionales para mantener compatibilidad en UI
        gender,
        birthDate: birthDate || undefined,
        weightKg: weightKg ? parseFloat(weightKg) : undefined,
        isSterilized,
        microchipNumber: microchipNumber.trim() || undefined,
        guardian: {
          name: guardianName.trim() || 'Tutor',
          phone: guardianPhone.trim(),
          email: guardianEmail.trim() || undefined,
          address: guardianAddress.trim() || undefined,
          city: 'Córdoba Capital',
          emergencyNotes: mensajePersonalizado.trim() || undefined,
        },
        nfcTag: hasNfc
          ? {
              tagCode: tagCode.trim().toUpperCase() || `ENC-${Math.floor(1000 + Math.random() * 9000)}-NFC`,
              status: 'active',      
            }
          : undefined,
      };

      await onSave(payload);
      onClose();
    } catch (err) {
      setFormError(err.message || 'Error al guardar los datos en FastAPI.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-surface w-full max-w-2xl rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-primary/10 text-primary">
              <PawPrint className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-text">
                {editingPet ? `Editar Mascota: ${nombre || editingPet.name}` : 'Registrar Mascota en FastAPI'}
              </h3>
              <p className="text-xs text-textMuted">
                Ficha clínica de mascota y asignación de tag NFC
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-textMuted hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pestañas de Navegación del Formulario */}
        <div className="flex justify-center px-6 bg-slate-50/50 dark:bg-slate-900/30 text-sm font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('pet')}
            className={`py-3 px-4 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'pet'
                ? 'border-primary text-primary'
                : 'border-transparent text-textMuted hover:text-text'
            }`}
          >
            <PawPrint className="w-4 h-4" />
            1. Datos Mascota
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('guardian')}
            className={`py-3 px-4 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'guardian'
                ? 'border-primary text-primary'
                : 'border-transparent text-textMuted hover:text-text'
            }`}
          >
            <User className="w-4 h-4" />
            2. Tutor / Contacto
          </button>
    
        </div>

        {/* Alerta de Error si aplica */}
        {formError && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
          {/* TAB 1: MASCOTA */}
          {activeTab === 'pet' && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-textMuted mb-1 uppercase tracking-wider">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    required
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Ej. Milo, Luna, Rocco"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-surface text-text focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-textMuted mb-1 uppercase tracking-wider">
                    Especie *
                  </label>
                  <select
                    value={especie}
                    onChange={(e) => setEspecie(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-surface text-text focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition cursor-pointer"
                  >
                    <option value="Perro">🐶 Perro</option>
                    <option value="Gato">🐱 Gato</option>
                    <option value="Conejo">🐰 Conejo</option>
                    <option value="Ave">🦜 Ave</option>
                    <option value="Otro">🐾 Otro</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-textMuted mb-1 uppercase tracking-wider">
                    Raza *
                  </label>
                  <input
                    type="text"
                    required
                    value={raza}
                    onChange={(e) => setRaza(e.target.value)}
                    placeholder="Ej. Golden, Mestizo"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-surface text-text focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-textMuted mb-1 uppercase tracking-wider">
                    Color
                  </label>
                  <input
                    type="text"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    placeholder="Ej. Marrón, Dorado"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-surface text-text focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-textMuted mb-1 uppercase tracking-wider">
                    Estado de Extravío
                  </label>
                  <select
                    value={estadoExtravio}
                    onChange={(e) => setEstadoExtravio(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-surface text-text focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition cursor-pointer"
                  >
                    <option value="en_casa">🏠 En Casa (Seguro)</option>
                    <option value="perdido">🚨 Perdido (Alerta SOS)</option>
                    <option value="encontrado">🎉 Encontrado</option>
                    <option value="en_veterinaria">🏥 En Veterinaria</option>
                    <option value="en_adopcion">🐾 En Adopción</option>
                  </select>
                </div>
              </div>

              {/* Selector Rápido de Fotos Demo */}
              <div>
                <label className="block text-xs font-bold text-textMuted mb-1 uppercase tracking-wider">
                  Foto de la Mascota (URL)
                </label>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="url"
                    value={fotoUrl}
                    onChange={(e) => setFotoUrl(e.target.value)}
                    placeholder="https://ejemplo.com/foto.jpg"
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-surface text-text text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition"
                  />
                  <img
                    src={fotoUrl}
                    alt="Preview"
                    className="w-10 h-10 rounded-xl object-cover border border-slate-300 dark:border-slate-700 shrink-0 bg-slate-100"
                    onError={(e) => {
                      e.target.src = PRESET_PHOTOS[4].url;
                    }}
                  />
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                  <span className="text-textMuted font-medium text-[11px] shrink-0">Preajustes:</span>
                  {PRESET_PHOTOS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setFotoUrl(preset.url)}
                      className={`px-2 py-1 rounded-lg border text-[11px] font-semibold transition shrink-0 ${
                        fotoUrl === preset.url
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-slate-200 dark:border-slate-800 text-textMuted hover:text-text'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notas Médicas y Recompensa */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-textMuted mb-1 uppercase tracking-wider">
                    Notas Médicas / Alergias
                  </label>
                  <textarea
                    rows={2}
                    value={notasMedicas}
                    onChange={(e) => setNotasMedicas(e.target.value)}
                    placeholder="Ej. Alérgica a pulgas, requiere medicación..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-surface text-text focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-textMuted mb-1 uppercase tracking-wider">
                    Recompensa (Opcional)
                  </label>
                  <input
                    type="text"
                    value={recompensa}
                    onChange={(e) => setRecompensa(e.target.value)}
                    placeholder="Ej. Se ofrece $50.000 de gratificación"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-surface text-text focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TUTOR */}
          {activeTab === 'guardian' && (
            <div className="space-y-4 text-sm">
              {/* Selector de Usuario Existente (del Contexto) */}
              <div className="p-3.5 rounded-2xl bg-primary/5 border border-primary/20">
                <label className="block text-xs font-bold text-primary mb-1 uppercase tracking-wider">
                  Vincular a Usuario del Sistema (FastAPI /usuarios/)
                </label>
                <select
                  value={usuarioId}
                  onChange={(e) => handleSelectUser(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-primary/30 bg-surface text-text font-bold text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition cursor-pointer"
                >
                  <option value="">-- Sin usuario registrado / Carga manual --</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.nombre} ({u.email || u.telefono || `ID ${u.id}`})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-textMuted mt-1">
                  Al seleccionar un usuario, se completarán automáticamente sus datos de contacto.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-textMuted mb-1 uppercase tracking-wider">
                    Nombre del Tutor / Dueño
                  </label>
                  <input
                    type="text"
                    value={guardianName}
                    onChange={(e) => setGuardianName(e.target.value)}
                    placeholder="Ej. Juan Pérez"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-surface text-text focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-textMuted mb-1 uppercase tracking-wider">
                    Teléfono Celular / WhatsApp
                  </label>
                  <input
                    type="tel"
                    value={guardianPhone}
                    onChange={(e) => setGuardianPhone(e.target.value)}
                    placeholder="Ej. +54 9 351 123-4567"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-surface text-text focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-textMuted mb-1 uppercase tracking-wider">
                    Email de Contacto
                  </label>
                  <input
                    type="email"
                    value={guardianEmail}
                    onChange={(e) => setGuardianEmail(e.target.value)}
                    placeholder="tutor@ejemplo.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-surface text-text focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-textMuted mb-1 uppercase tracking-wider">
                    Dirección Habitual
                  </label>
                  <input
                    type="text"
                    value={guardianAddress}
                    onChange={(e) => setGuardianAddress(e.target.value)}
                    placeholder="Ej. Av. Colón 123"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-surface text-text focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-textMuted mb-1 uppercase tracking-wider">
                  Mensaje Personalizado en caso de escaneo
                </label>
                <textarea
                  rows={2}
                  value={mensajePersonalizado}
                  onChange={(e) => setMensajePersonalizado(e.target.value)}
                  placeholder="Ej. Por favor llámame si me encuentras, es muy amigable..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-surface text-text focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition text-xs"
                />
              </div>

              {/* Privacidad de datos */}
              <div className="flex flex-wrap gap-4 pt-1">
                <label className="flex items-center gap-2 text-xs text-text cursor-pointer">
                  <input
                    type="checkbox"
                    checked={mostrarTelefono}
                    onChange={(e) => setMostrarTelefono(e.target.checked)}
                    className="w-4 h-4 rounded text-primary focus:ring-primary"
                  />
                  Mostrar teléfono en ficha pública
                </label>

                <label className="flex items-center gap-2 text-xs text-text cursor-pointer">
                  <input
                    type="checkbox"
                    checked={mostrarDireccion}
                    onChange={(e) => setMostrarDireccion(e.target.checked)}
                    className="w-4 h-4 rounded text-primary focus:ring-primary"
                  />
                  Mostrar dirección en ficha pública
                </label>
              </div>
            </div>
          )}

        

          {/* Footer del Modal */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex gap-2">
              {activeTab !== 'pet' && (
                <button
                  type="button"
                  onClick={() => setActiveTab(activeTab === 'nfc' ? 'guardian' : 'pet')}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Anterior
                </button>
              )}
              {activeTab !== 'nfc' && (
                <button
                  type="button"
                  onClick={() => setActiveTab(activeTab === 'pet' ? 'guardian' : 'nfc')}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                >
                  Siguiente
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
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
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl bg-[#8D4925] hover:bg-[#5E2F17] dark:bg-[#E3B48F] dark:hover:bg-[#F3E6CF] text-[#FBF7F1] dark:text-[#1E130C] transition shadow-md shadow-[#8D4925]/20 disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <>Guardando...</>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    {editingPet ? 'Guardar Cambios' : 'Registrar Mascota'}
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PetModal;
