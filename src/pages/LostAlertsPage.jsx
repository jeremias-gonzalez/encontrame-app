import React from 'react';
import { AlertTriangle, Phone, MessageCircle, ExternalLink, CheckCircle, ShieldAlert } from 'lucide-react';
import { usePets } from '../hooks/usePets';
import { useToast } from '../context/ToastContext';

export function LostAlertsPage({ onPreviewNfc }) {
  const { pets, toggleLost } = usePets();
  const { showToast } = useToast();

  const lostPets = pets.filter((p) => p.isLost);

  const handleMarkRecovered = async (pet) => {
    const petName = pet.nombre || pet.name;
    await toggleLost(pet.id, false);
    showToast('Mascota Recuperada', `${petName} fue marcado como seguro en casa.`, 'success');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider mb-1">
          <ShieldAlert className="w-3.5 h-3.5" />
          Protocolo de Búsqueda Activo
        </div>
        <h2 className="text-3xl font-black text-[#92553A] dark:text-[#E3B48F] tracking-tight">
          Alertas SOS de Extravío
        </h2>
        <p className="text-xs text-textMuted mt-0.5">
          Animales reportados como perdidos que requieren atención urgente y difusión de contacto.
        </p>
      </div>

      {lostPets.length === 0 ? (
        <div className="glass-panel rounded-3xl p-12 text-center max-w-lg mx-auto">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-black text-text mb-1">No hay alertas SOS activas</h3>
          <p className="text-xs text-textMuted leading-relaxed">
            Todas las mascotas registradas en la veterinaria se encuentran seguras con sus tutores.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-rose-500/15 border border-rose-500/30 rounded-2xl p-4 flex items-center justify-between text-xs text-rose-800 dark:text-rose-200">
            <div className="flex items-center gap-2.5 font-bold">
              <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 animate-pulse" />
              <span>Hay {lostPets.length} mascota(s) reportadas extraviadas actualmente.</span>
            </div>
            <span className="text-[11px] uppercase tracking-wider font-extrabold bg-rose-500 text-white px-2.5 py-0.5 rounded-full">
              Prioridad Alta
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {lostPets.map((pet) => {
              const petName = pet.nombre || pet.name;
              const guardianName = pet.guardian?.name || pet.usuario?.nombre || 'Tutor';
              const guardianPhone = pet.guardian?.phone || pet.usuario?.telefono || '';
              const cleanPhone = guardianPhone.replace(/[^0-9]/g, '');
              const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                `Hola ${guardianName}, nos comunicamos desde la veterinaria respecto a la búsqueda activa de ${petName}.`
              )}`;

              return (
                <div
                  key={pet.id}
                  className="glass-card rounded-3xl p-5 border-2 border-rose-500/50 space-y-4 relative overflow-hidden"
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={pet.photoUrl || pet.foto_url}
                      alt={petName}
                      className="w-20 h-20 rounded-2xl object-cover border-2 border-rose-500/60 shadow-md shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xl font-black text-text truncate">{petName}</h4>
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-rose-600 text-white">
                          Perdido
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-textMuted truncate">
                        {pet.breed || pet.raza} • {pet.gender || 'macho'}
                      </p>
                      {pet.nfcTag && (
                        <p className="font-mono text-xs font-bold text-primary mt-1">
                          Dije NFC: {pet.nfcTag.tagCode}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Notas de emergencia del tutor */}
                  {(pet.guardian?.emergencyNotes || pet.mensaje_personalizado) && (
                    <div className="p-3 rounded-2xl bg-surface/80 border border-primary/10 text-xs text-text italic">
                      "{pet.guardian?.emergencyNotes || pet.mensaje_personalizado}"
                    </div>
                  )}

                  {/* Contactos del tutor */}
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-[#F1E8DC]/80 dark:bg-[#2A1B11]/80 border border-primary/15 text-xs">
                    <div>
                      <p className="font-bold text-text">{guardianName}</p>
                      <p className="text-[11px] text-textMuted">{guardianPhone || 'Sin teléfono'}</p>
                    </div>
                    {guardianPhone && (
                      <div className="flex items-center gap-1.5">
                        <a
                          href={`tel:${guardianPhone}`}
                          className="p-2 rounded-xl bg-surface text-text hover:text-primary transition shadow-sm border border-primary/10"
                          title="Llamar"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 transition shadow-sm"
                          title="WhatsApp"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Acciones */}
                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => onPreviewNfc(pet)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Ver Ficha de Rescate
                    </button>

                    <button
                      onClick={() => handleMarkRecovered(pet)}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm cursor-pointer"
                    >
                      Marcar Recuperado
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default LostAlertsPage;

