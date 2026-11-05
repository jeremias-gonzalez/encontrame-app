import React, { useEffect, useState } from 'react';
import { Nfc, Plus, RefreshCw } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { TagModal } from '../components/Modals/TagModal';
import { useTags } from '../context/TagContext';
import { useToast } from '../context/ToastContext';
import { readNfcTag, writeNfcTag } from '../api/nfc';

export function TagManagementPage() {
  const { tags, loading, error, fetchTags, getTag, deleteTag } = useTags();
  const { showToast } = useToast();
  const [editingTag, setEditingTag] = useState(null);
  const [selectedTag, setSelectedTag] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [nfcOperation, setNfcOperation] = useState(null);
  const [nfcController, setNfcController] = useState(null);

  useEffect(() => {
    fetchTags().catch(() => {});
  }, [fetchTags]);

  const showDetails = async (tag) => {
    setActionError(null);
    try {
      setSelectedTag(await getTag(tag.id));
    } catch (requestError) {
      setActionError(requestError.message);
    }
  };

  const handleDelete = async (tag) => {
    if (!window.confirm(`¿Dar de baja el tag ${tag.codigoQR}?`)) return;
    setActionError(null);
    try {
      await deleteTag(tag.id, true);
      showToast('Tag desactivado', `${tag.codigoQR} quedó inactivo.`, 'success');
    } catch (requestError) {
      setActionError(requestError.message);
    }
  };

  const handleNfcOperation = async (tag, operation) => {
    setActionError(null);
    if (operation === 'write' && !window.confirm(
      `Se programará ${tag.codigoQR} con su enlace público y UID ${tag.uidNFC}. El contenido NFC existente será reemplazado. ¿Continuar?`,
    )) return;

    const controller = new AbortController();
    setNfcController(controller);
    setNfcOperation({ tagId: tag.id, operation });
    try {
      if (operation === 'write') {
        await writeNfcTag(tag, { signal: controller.signal });
        showToast('NFC programado', `La chapita quedó vinculada con ${tag.codigoQR}.`, 'success');
        return;
      }

      const readTag = await readNfcTag({ signal: controller.signal });
      const matchingTag = tags.find((item) => item.uidNFC === readTag.uidNFC);
      if (!matchingTag || matchingTag.token_publico !== readTag.token_publico) {
        throw new Error('El UID leído no coincide con ningún tag del inventario.');
      }
      setSelectedTag(await getTag(matchingTag.id));
      showToast('Tag NFC identificado', `${matchingTag.codigoQR} quedó vinculado con sus datos.`, 'success');
    } catch (requestError) {
      if (requestError.name !== 'AbortError') setActionError(requestError.message);
    } finally {
      setNfcOperation(null);
      setNfcController(null);
    }
  };

  const cancelNfcOperation = () => nfcController?.abort();

  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black text-[#92553A] dark:text-[#E3B48F]">Inventario de tags</h1>
          <p className="text-sm text-textMuted">Alta, consulta, edición y baja lógica desde FastAPI.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => fetchTags().catch(() => {})} className="inline-flex items-center gap-2 rounded-xl border border-primary/20 px-3 py-2 text-sm">
            <RefreshCw className="h-4 w-4" />Actualizar
          </button>
          <button onClick={() => { setEditingTag(null); setModalOpen(true); }} className="inline-flex items-center gap-2 rounded-xl bg-primary px-3 py-2 text-sm font-bold text-white">
            <Plus className="h-4 w-4" />Nuevo tag
          </button>
        </div>
      </header>

      {actionError && <p role="alert" className="rounded-xl bg-rose-500/10 p-3 text-sm text-rose-700">{actionError}</p>}
      {error && <p role="alert" className="rounded-xl bg-rose-500/10 p-3 text-sm text-rose-700">{error}</p>}
      {nfcOperation && (
        <div role="status" className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-primary/10 p-3 text-sm text-primary">
          <span>
            {nfcOperation.operation === 'write'
              ? 'Acerca la chapita NFC al dispositivo para programarla…'
              : 'Acerca una chapita NFC de Encontrame al dispositivo para identificarla…'}
          </span>
          <button type="button" onClick={cancelNfcOperation} className="font-semibold underline">Cancelar</button>
        </div>
      )}
      {loading ? <p role="status" className="rounded-2xl bg-surface p-6 text-sm text-textMuted">Cargando tags…</p> : (
        <div className="overflow-x-auto rounded-2xl bg-surface shadow-sm">
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead className="border-b border-primary/10 text-xs uppercase text-textMuted">
              <tr><th className="p-4">QR / token</th><th className="p-4">UID NFC</th><th className="p-4">Estado</th><th className="p-4">Veterinaria</th><th className="p-4">Acciones</th></tr>
            </thead>
            <tbody>
              {tags.map((tag) => (
                <tr key={tag.id} className="border-b border-primary/5">
                  <td className="p-4">
                    <span className="font-semibold">{tag.codigoQR}</span>
                    <span className="block font-mono text-xs text-textMuted">{tag.token_publico}</span>
                    <a href={`/scan/${encodeURIComponent(tag.token_publico)}`} className="text-xs text-primary hover:underline">Abrir escaneo público</a>
                  </td>
                  <td className="p-4 font-mono text-xs">{tag.uidNFC}</td>
                  <td className="p-4">{tag.estado}{tag.activo ? '' : ' · inactivo'}</td>
                  <td className="p-4">{tag.veterinaria?.nombre || tag.veterinaria_id || 'Sin asignar'}</td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => showDetails(tag)} className="text-primary hover:underline">Detalle</button>
                      <button onClick={() => { setEditingTag(tag); setModalOpen(true); }} className="text-primary hover:underline">Editar</button>
                      <button
                        type="button"
                        disabled={Boolean(nfcOperation)}
                        onClick={() => handleNfcOperation(tag, 'write')}
                        className="inline-flex items-center gap-1 text-primary hover:underline disabled:opacity-50"
                      >
                        <Nfc className="h-4 w-4" />Programar NFC
                      </button>
                      <button
                        type="button"
                        disabled={Boolean(nfcOperation)}
                        onClick={() => handleNfcOperation(tag, 'read')}
                        className="inline-flex items-center gap-1 text-primary hover:underline disabled:opacity-50"
                      >
                        <Nfc className="h-4 w-4" />Leer NFC
                      </button>
                      <button onClick={() => handleDelete(tag)} className="text-rose-600 hover:underline">Dar de baja</button>
                    </div>
                  </td>
                </tr>
              ))}
              {tags.length === 0 && <tr><td colSpan="5" className="p-8 text-center text-textMuted">No hay tags registrados.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {selectedTag && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/60 p-4" onClick={() => setSelectedTag(null)}>
          <div className="w-full max-w-md space-y-2 rounded-2xl bg-surface p-6 text-sm" onClick={(event) => event.stopPropagation()}>
            <h2 className="text-lg font-bold">Detalle de tag</h2>
            <div className="flex justify-center py-3">
              <QRCodeSVG
                value={new URL(`/scan/${encodeURIComponent(selectedTag.token_publico)}`, window.location.origin).toString()}
                size={160}
                level="M"
                title={`QR público de ${selectedTag.codigoQR}`}
              />
            </div>
            <p>QR: {selectedTag.codigoQR}</p><p>UID NFC: {selectedTag.uidNFC}</p>
            <p>Token público: {selectedTag.token_publico}</p>
            <p>Estado: {selectedTag.estado}</p>
            <p>Mascota: {selectedTag.mascota?.nombre || 'Sin mascota'}</p>
            <p>Veterinaria: {selectedTag.veterinaria?.nombre || 'Sin asignar'}</p>
            <button onClick={() => setSelectedTag(null)} className="mt-3 rounded-xl bg-primary px-4 py-2 text-white">Cerrar</button>
          </div>
        </div>
      )}

      {modalOpen && (
        <TagModal
          isOpen
          editingTag={editingTag}
          onClose={() => setModalOpen(false)}
          onSuccess={() => showToast('Tag guardado', 'Los datos se sincronizaron con la API.', 'success')}
        />
      )}
    </section>
  );
}
