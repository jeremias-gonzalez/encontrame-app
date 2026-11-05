import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Radio,
  MessageCircle,
  AlertTriangle,
  ExternalLink,
  Edit,
  Trash2,
  Unlink,
  Link as LinkIcon,
  ShieldAlert,
  Calendar,
  Weight,
  Info,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export function PetCard({
  pet,
  onEdit,
  onDelete,
  onToggleLost,
  onPairTag,
  onUnpairTag,
  onPreviewNfc,
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const getSpeciesEmoji = (species = '') => {
    switch (species.toLowerCase()) {
      case 'perro':
        return '🐶';
      case 'gato':
        return '🐱';
      case 'conejo':
        return '🐰';
      case 'ave':
        return '🦜';
      default:
        return '🐾';
    }
  };

 

  const petName = pet.nombre || pet.name || 'Mascota';
  const guardianName = pet.guardian?.name || pet.usuario?.nombre || 'Tutor';
  const guardianPhone = pet.guardian?.phone || pet.usuario?.telefono || '';
  const cleanPhone = guardianPhone.replace(/[^0-9]/g, '');
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    `Hola ${guardianName}, nos comunicamos desde la veterinaria respecto a ${petName}.`
  )}`;

  const handleToggleLostStatus = async (nextLost) => {
    try {
      await onToggleLost(pet.id, nextLost);
      if (nextLost) {
        showToast('¡Alerta SOS Activada!', `${petName} fue marcado como extraviado/a.`, 'error');
      } else {
        showToast('Mascota Recuperada', `${petName} está seguro en casa. Alerta desactivada.`, 'success');
      }
    } catch (requestError) {
      showToast('No se pudo actualizar', requestError.message, 'error');
    }
  };

  const handleUnpair = async () => {
    try {
      await onUnpairTag(pet.id);
      showToast('Dije Desvinculado', `El chip NFC ha sido liberado de la ficha de ${petName}.`, 'info');
    } catch (requestError) {
      showToast('No se pudo desvincular', requestError.message, 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await onDelete(pet.id, true);
      showToast('Registro desactivado', `La ficha de ${petName} fue desactivada.`, 'info');
      setIsDeleting(false);
    } catch (requestError) {
      showToast('No se pudo desactivar', requestError.message, 'error');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.94 }}
      transition={{ type: 'spring', stiffness: 320, damping: 25 }}
      whileHover={{ y: -3 }}
      className={`glass-card rounded-3xl overflow-hidden flex flex-col justify-between relative group ${
        pet.isLost ? 'border-rose-500/80 ring-2 ring-rose-500/30' : ''
      }`}
    >
      <div>
        {/* Banner de Emergencia SOS */}
        {pet.isLost && (
          <div className="bg-rose-600 text-white px-4 py-1.5 text-xs font-black flex items-center justify-between tracking-wide uppercase">
            <span className="flex items-center gap-1.5 animate-pulse">
              <ShieldAlert className="w-4 h-4" />
              ¡ALERTA DE EXTRAVÍO ACTIVA!
            </span>
            <button
              onClick={() => handleToggleLostStatus(false)}
              className="text-[10px] font-bold underline bg-white/20 hover:bg-white/30 px-2 py-0.5 rounded-lg transition-colors cursor-pointer"
            >
              Recuperado
            </button>
          </div>
        )}

        {/* Encabezado con Foto y Datos Principales */}
        <div className="p-5 pb-3">
          <div className="flex items-start gap-4">
            <div className="relative shrink-0">
              <img
                src={pet.photoUrl || pet.foto_url}
                alt={petName}
                className="w-20 h-20 rounded-2xl object-cover border border-primary/15 shadow-sm bg-surface"
                onError={(e) => {
                  e.target.src =
                    'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=400&q=80';
                }}
              />
              <span
                className="absolute -bottom-2 -right-2 text-sm bg-surface rounded-xl p-1 shadow-md border border-primary/15"
                title={pet.species || pet.especie}
              >
                {getSpeciesEmoji(pet.species || pet.especie)}
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-xl font-black truncate text-text tracking-tight">
                  {petName}
                </h3>
                <span className="text-[11px] px-2 py-0.5 rounded-lg font-bold bg-surface/80 text-textMuted capitalize border border-primary/10">
                  {pet.gender || 'macho'}
                </span>
              </div>
              <p className="text-xs font-semibold text-textMuted truncate mt-0.5">
                {pet.breed || pet.raza || 'Mestizo'}
              </p>

              {/* Peso y Nacimiento */}
              <div className="flex flex-wrap items-center gap-2.5 text-[11px] text-textMuted mt-2 font-medium">
                {pet.weightKg && (
                  <span className="flex items-center gap-1 bg-surface/50 px-2 py-0.5 rounded-md border border-primary/10">
                    <Weight className="w-3 h-3 text-primary" />
                    {pet.weightKg} kg
                  </span>
                )}
                {pet.birthDate && (
                  <span className="flex items-center gap-1 bg-surface/50 px-2 py-0.5 rounded-md border border-primary/10">
                    <Calendar className="w-3 h-3 text-primary" />
                    {new Date(pet.birthDate).toLocaleDateString()}
                  </span>
                )}
                {pet.isSterilized && (
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold text-[10px]">
                    Castrado/a
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sección del Dije 3D NFC */}
        <div className="px-5 py-3 bg-[#F1E8DC]/70 dark:bg-[#2A1B11]/70 border-y border-primary/10">
          {pet.nfcTag ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-xl bg-[#2A8C82]/15 text-[#2A8C82]">
                    <Radio className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider font-extrabold text-textMuted block">
                      Dije NFC Asignado
                    </span>
                    <span className="font-mono text-xs font-extrabold text-primary">
                      {pet.nfcTag.tagCode}
                    </span>
                  </div>
                </div>

              </div>

              <div className="flex items-center justify-between text-[11px] text-textMuted pt-0.5 font-medium">
                <span>{pet.nfcTag.scanCount || 0} lecturas</span>
                <button
                  onClick={() => onPreviewNfc(pet)}
                  className="font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <ExternalLink className="w-3 h-3" />
                  Simular Escaneo
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between py-1">
              <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span className="text-xs font-bold">Sin dije NFC</span>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onPairTag(pet)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-[#8D4925] hover:bg-[#5E2F17] dark:bg-[#E3B48F] dark:hover:bg-[#F3E6CF] text-[#FBF7F1] dark:text-[#1E130C] hover:opacity-90 transition shadow-sm cursor-pointer"
              >
                <LinkIcon className="w-3 h-3" />
                Vincular Dije 3D
              </motion.button>
            </div>
          )}
        </div>

      
        <div className="p-5 space-y-3 text-xs">
          <div>
            <span className="text-[10px] uppercase font-extrabold text-textMuted tracking-wider block mb-1">
              Tutor Responsable
            </span>
            <div className="flex items-center justify-between bg-surface/70 rounded-2xl p-2.5 border border-primary/10">
              <div className="min-w-0 pr-2">
                <p className="font-bold text-text truncate">{guardianName}</p>
                <p className="text-textMuted text-[11px] truncate">{guardianPhone || 'Sin teléfono'}</p>
              </div>
              {guardianPhone && (
                <div className="flex items-center gap-1.5 shrink-0">
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition shadow-sm"
                    title="Enviar WhatsApp"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Footer con Acciones */}
      <div className="px-5 py-3 border-t border-primary/10 flex items-center justify-between bg-surface/30">
        <button
          onClick={() => handleToggleLostStatus(!pet.isLost)}
          className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer ${
            pet.isLost
              ? 'border-rose-500/40 text-rose-600 dark:text-rose-400 bg-rose-500/10 hover:bg-rose-500/20'
              : 'border-primary/15 text-textMuted hover:text-rose-600 hover:border-rose-400 hover:bg-rose-500/5'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          {pet.isLost ? '¡Perdido!' : 'Alerta SOS'}
        </button>

        <div className="flex items-center gap-1">
          <button
            onClick={() => navigate(`/mascotas/${pet.id}`)}
            className="rounded-xl p-2 text-textMuted transition-colors hover:bg-primary/10 hover:text-primary"
            title="Ver ficha completa"
            aria-label={`Ver ficha completa de ${petName}`}
          >
            <Info className="h-4 w-4" />
          </button>
          {pet.nfcTag ? (
            <button
              onClick={handleUnpair}
              className="p-2 rounded-xl text-textMuted hover:text-amber-600 hover:bg-amber-500/10 transition-colors cursor-pointer"
              title="Desvincular dije"
            >
              <Unlink className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => onPairTag(pet)}
              className="p-2 rounded-xl text-textMuted hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer"
              title="Vincular dije"
            >
              <LinkIcon className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => onEdit(pet)}
            className="p-2 rounded-xl text-textMuted hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer"
            title="Editar paciente"
          >
            <Edit className="w-4 h-4" />
          </button>

          {isDeleting ? (
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  handleDelete();
                }}
                className="px-2 py-1 text-[11px] font-bold rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition cursor-pointer"
              >
                Sí
              </button>
              <button
                onClick={() => setIsDeleting(false)}
                className="px-2 py-1 text-[11px] rounded-lg bg-surface text-text cursor-pointer"
              >
                No
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsDeleting(true)}
              className="p-2 rounded-xl text-textMuted hover:text-rose-600 hover:bg-rose-500/10 transition-colors cursor-pointer"
              title="Eliminar paciente"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default PetCard;
