import React, { useState } from 'react';
import {
  Phone,
  MessageCircle,
  AlertTriangle,
  MapPin,
  HeartPulse,
  Radio,
  ArrowLeft,
  Share2,
  CheckCircle,
  Building2,
} from 'lucide-react';
import { BrandLogo } from '../Common/BrandLogo';
import { api } from '../../api/config';

export function PublicRescueView({ pet, onBackToDashboard, scanIdentifier }) {
  const [hasReportedLocation, setHasReportedLocation] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [reportError, setReportError] = useState(null);
  const [rescuePhone, setRescuePhone] = useState('');

  const tagIdentifier = scanIdentifier || pet?.tag?.token_publico || pet?.nfcTag?.tagCode || pet?.tag?.codigoQR;

  if (!pet) return null;

  const petName = pet.nombre || pet.name || 'Mascota';
  const guardian = pet.guardian || pet.usuario || {};
  const guardianName = guardian.name || guardian.nombre || 'Tutor';
  const guardianPhone = guardian.phone || guardian.telefono || '';
  const cleanPhone = guardianPhone.replace(/[^0-9]/g, '');
  const emergencyWhatsappText = `¡Hola ${guardianName}! Encontré a tu mascota *${petName}* gracias al dije NFC de Encontrame. Me encuentro con ella. Por favor respóndeme para coordinar el reencuentro.`;
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(emergencyWhatsappText)}`;

  const handleShareLocation = async () => {
    setReporting(true);
    setReportError(null);
    try {
      if (!tagIdentifier) throw new Error('Esta ficha no tiene un identificador de tag para enviar el aviso.');
      let coordinates = {};
      if (navigator.geolocation) {
        try {
          const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 8000 });
          });
          coordinates = {
            latitud: position.coords.latitude,
            longitud: position.coords.longitude,
          };
        } catch {
          coordinates = {};
        }
      }

      const message = `Acabo de escanear el tag de ${petName}.`;
      await api.post(`/scan/${encodeURIComponent(tagIdentifier)}/reportar`, {
        ...coordinates,
        mensaje: message,
        telefono_contacto: rescuePhone.trim() || null,
      });
      setHasReportedLocation(true);
      if (cleanPhone) {
        const hasCoordinates = coordinates.latitud !== undefined;
        const locationMsg = `${message}${hasCoordinates ? ` Mi ubicación: https://maps.google.com/?q=${coordinates.latitud},${coordinates.longitud}` : ''}`;
        window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(locationMsg)}`, '_blank', 'noopener,noreferrer');
      }
    } catch (requestError) {
      setReportError(requestError.message);
    } finally {
      setReporting(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background text-text flex flex-col items-center justify-center p-3 sm:p-6 font-sans">
      {/* Botón flotante para regresar al dashboard clínico si se está probando en la demo */}
      {onBackToDashboard && (
        <div className="w-full max-w-md mb-4 flex justify-between items-center">
          <button
            onClick={onBackToDashboard}
            className="inline-flex items-center gap-2 text-xs font-bold text-textMuted hover:text-text bg-surface hover:bg-bgAlt px-3 py-1.5 rounded-xl border border-primary/15 transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al Panel Veterinario
          </button>
          <span className="text-[11px] text-textMuted font-mono">
            Modo: Simulador NFC Móvil
          </span>
        </div>
      )}

      {/* Frame de Celular / Tarjeta Pública */}
      <div className="w-full max-w-md bg-surface rounded-3xl border border-primary/15 shadow-2xl overflow-hidden flex flex-col">
        {/* Cabecera Oficial con Logotipo Encontrame */}
        <div className="py-2.5 px-4 flex items-center justify-between bg-bgAlt/70 border-b border-primary/10">
          <BrandLogo className="h-5 w-auto" showBadge badgeLabel="NFC 3D" />
          <span className="text-[10px] font-mono text-textMuted">Ficha Pública</span>
        </div>

        {/* Banner de Emergencia Superior */}
        {pet.isLost ? (
          <div className="bg-rose-600 px-4 py-3 text-center text-white font-black text-sm tracking-wider uppercase animate-pulse flex items-center justify-center gap-2">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            ¡ESTOY PERDIDO! AYÚDAME A VOLVER
          </div>
        ) : (
          <div className="bg-primary/10 px-4 py-2 text-center text-primary font-bold text-xs tracking-wide flex items-center justify-center gap-1.5">
            <CheckCircle className="w-4 h-4" />
            Mascota Identificada con Dije NFC Encontrame
          </div>
        )}

        {/* Foto y Datos Principales */}
        <div className="p-6 text-center border-b border-primary/10 relative">
          <div className="relative inline-block mx-auto mb-4">
            <img
              src={pet.photoUrl || pet.foto_url}
              alt={petName}
              className="w-32 h-32 rounded-3xl object-cover border-4 border-primary/20 shadow-xl mx-auto bg-bgAlt"
              onError={(e) => {
                e.target.src =
                  'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=400&q=80';
              }}
            />
            {pet.nfcTag && (
              <span className="absolute -bottom-2 right-1/2 translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-primary text-[#FBF7F1] shadow flex items-center gap-1 tracking-wider whitespace-nowrap dark:text-[#1E130C]">
                <Radio className="w-3 h-3" />
                NFC 3D Activo
              </span>
            )}
          </div>

          <h1 className="text-3xl font-black text-title tracking-tight">{petName}</h1>
          <p className="text-sm text-textMuted mt-1 font-medium">
            {pet.breed || pet.raza || 'Mascota doméstica'} • {pet.gender === 'macho' ? 'Macho' : 'Hembra'}
            {pet.weightKg ? ` • ${pet.weightKg} kg` : ''}
          </p>

          {guardian.city && (
            <p className="text-xs text-textMuted mt-1 flex items-center justify-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {guardian.city}
            </p>
          )}
        </div>

        {/* Acciones de Contacto Inmediato (CTA Gigantes) */}
        <div className="p-6 space-y-3 bg-bgAlt/50">
          <h2 className="text-xs font-bold uppercase tracking-wider text-textMuted text-center mb-1">
            Contactar al Tutor Inmediatamente
          </h2>

          {/* Botón WhatsApp Gigante */}
          {cleanPhone && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-2xl bg-primary hover:bg-primaryHover text-[#FBF7F1] dark:text-[#1E130C] font-extrabold text-base shadow-lg shadow-primary/20 active:scale-95 transition-all text-center"
            >
              <MessageCircle className="w-5 h-5 shrink-0" />
              Enviar WhatsApp al Dueño
            </a>
          )}

          {/* Botón de Llamada Telefónica */}
          {guardianPhone && (
            <a
              href={`tel:${guardianPhone}`}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-2xl bg-accent hover:opacity-90 text-[#1E130C] font-bold text-sm shadow-md shadow-accent/20 active:scale-95 transition-all text-center"
            >
              <Phone className="w-4 h-4 shrink-0" />
              Llamar al {guardianPhone}
            </a>
          )}

          {/* Teléfono secundario si existe */}
          {guardian.secondaryPhone && (
            <a
              href={`tel:${guardian.secondaryPhone}`}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-surface hover:bg-bgAlt text-textMuted font-semibold text-xs border border-primary/15 transition"
            >
              <Phone className="w-3.5 h-3.5" />
              Llamar al teléfono de respaldo: {guardian.secondaryPhone}
            </a>
          )}

          {/* Compartir ubicación */}
          <label className="block text-left text-xs text-textMuted">
            Tu teléfono (opcional)
            <input
              type="tel"
              value={rescuePhone}
              onChange={(event) => setRescuePhone(event.target.value)}
              placeholder="+54 9…"
              className="mt-1 w-full rounded-xl border border-primary/20 bg-surface px-3 py-2 text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </label>
          {reportError && <p role="alert" className="rounded-xl bg-rose-500/10 p-3 text-xs text-rose-700 dark:text-rose-300">{reportError}</p>}
          <button
            onClick={handleShareLocation}
            disabled={reporting || hasReportedLocation}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-surface hover:bg-bgAlt text-accent text-xs font-bold border border-accent/30 transition cursor-pointer"
          >
            <MapPin className="w-4 h-4" />
            {reporting ? 'Enviando aviso…' : hasReportedLocation ? 'Aviso enviado al tutor' : 'Avisar mi ubicación GPS actual'}
          </button>
        </div>

        {/* Ficha Médica y Notas de Emergencia */}
        <div className="p-6 space-y-4 border-t border-primary/10 text-xs">
          {/* Mensaje especial del tutor */}
          {(guardian.emergencyNotes || pet.mensaje_personalizado) && (
            <div className="p-3.5 rounded-2xl bg-bgAlt border border-primary/15 text-text">
              <span className="text-[11px] font-bold text-primary block mb-1">
                💬 Mensaje del tutor para quien encuentre a {petName}:
              </span>
              <p className="leading-relaxed italic">"{guardian.emergencyNotes || pet.mensaje_personalizado}"</p>
            </div>
          )}

          {/* Salud y Alergias */}
          {(pet.medicalNotes || pet.notas_medicas) && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-textMuted">
              <span className="text-[11px] font-bold text-rose-700 dark:text-rose-300 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                <HeartPulse className="w-4 h-4" />
                Información Médica Crítica
              </span>
              <p className="leading-relaxed">{pet.medicalNotes || pet.notas_medicas}</p>
            </div>
          )}

          {/* Veterinaria de Cabecera */}
          {pet.veterinaryClinicName && (
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-bgAlt border border-primary/10 text-textMuted">
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <Building2 className="w-4 h-4" />
              </div>
              <div className="text-left">
                <span className="text-[10px] uppercase font-bold text-textMuted block">
                  Clínica Veterinaria de Referencia
                </span>
                <span className="text-xs font-semibold text-text">
                  {pet.veterinaryClinicName}
                </span>
              </div>
            </div>
          )}

          {/* Dije Físico 3D y Compartir Ficha */}
          <div className="pt-2 flex items-center justify-between text-textMuted text-[11px] border-t border-primary/10">
            {pet.nfcTag && (
              <span className="font-mono">
                Dije NFC: {pet.nfcTag.tagCode} ({pet.nfcTag.filamentColor || '3D'})
              </span>
            )}
            <button
              onClick={handleCopyLink}
              className="text-primary hover:underline flex items-center gap-1 cursor-pointer font-semibold"
            >
              <Share2 className="w-3.5 h-3.5" />
              {copiedLink ? '¡Link Copiado!' : 'Copiar Link'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PublicRescueView;
