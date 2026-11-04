import React, { useState } from 'react';
import { X, Radio, CheckCircle2, Sparkles, AlertCircle } from 'lucide-react';



export function NfcPairingModal({
  isOpen,
  onClose,
  pet,
  onConfirmPair,
}) {
  const [tagCode, setTagCode] = useState('');

  const [isSimulatingScan, setIsSimulatingScan] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen || !pet) return null;

  const handleSimulateNfcTap = () => {
    setIsSimulatingScan(true);
    setError(null);
    setTimeout(() => {
      const generated = `ENC-${Math.floor(1000 + Math.random() * 9000)}-NFC`;
      setTagCode(generated);
      setIsSimulatingScan(false);
    }, 700);
  };

  const handlePair = async (e) => {
    e.preventDefault();
    if (!tagCode.trim()) {
      setError('Por favor ingresa o escanea un código de dije NFC.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onConfirmPair(pet.id, tagCode.trim().toUpperCase());
      onClose();
    } catch (err) {
      setError(err.message || 'Error al vincular el dije.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
      <div className="bg-surface w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-primary/10 text-primary">
              <Radio className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-text">Llavero</h3>
              <p className="text-xs text-textMuted">
                Para el paciente: <span className="font-bold text-text">{pet.name || pet.nombre}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-textMuted hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
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

        <form onSubmit={handlePair} className="p-6 space-y-5">
          {/* Animación Simulador Toque NFC */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-[#2A8C82]/15 via-[#2A8C82]/5 to-transparent border border-[#2A8C82]/25 text-center relative overflow-hidden">
            <div className="relative z-10">
              <button
                type="button"
                onClick={handleSimulateNfcTap}
                disabled={isSimulatingScan}
                className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-[#2A8C82] text-white flex items-center justify-center shadow-lg shadow-[#2A8C82]/30 hover:scale-105 active:scale-95 transition-transform cursor-pointer disabled:opacity-50"
              >
                <Radio className={`w-8 h-8 ${isSimulatingScan ? 'animate-ping' : ''}`} />
              </button>
              <h4 className="font-bold text-sm text-text">
                {isSimulatingScan ? 'Leyendo chip NFC...' : 'Lector de Mostrador Listo'}
              </h4>
              <p className="text-xs text-textMuted mt-0.5">
                Acerca el llavero físico al lector o presiona el botón para simular la lectura.
              </p>
            </div>
          </div>

          
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-textMuted uppercase tracking-wider">
                Código del LLavero (Tag ID)
              </label>
              <button
                type="button"
                onClick={handleSimulateNfcTap}
                className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Generar aleatorio
              </button>
            </div>
            <input
              type="text"
              required
              value={tagCode}
              onChange={(e) => setTagCode(e.target.value.toUpperCase())}
              placeholder="Ej. ENC-8921-NFC"
              className="w-full font-mono text-center text-lg font-extrabold uppercase tracking-wider px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-surface text-text focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition"
            />
          </div>

        
          {/* Botones de Acción */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold rounded-xl text-textMuted hover:text-text transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !tagCode.trim()}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl bg-[#8D4925] hover:bg-[#5E2F17] dark:bg-[#E3B48F] dark:hover:bg-[#F3E6CF] text-[#FBF7F1] dark:text-[#1E130C] transition shadow-md shadow-[#8D4925]/20 disabled:opacity-50 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              {isSubmitting ? 'Vinculando...' : 'Confirmar Vinculación'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default NfcPairingModal;

