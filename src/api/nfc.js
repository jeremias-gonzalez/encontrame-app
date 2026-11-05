const ENCONTRAME_RECORD_TYPE = 'application/vnd.encontrame.tag+json';

function createNdefReader() {
  if (!window.isSecureContext) {
    throw new Error('El lector NFC requiere HTTPS o localhost.');
  }
  if (typeof window.NDEFReader !== 'function') {
    throw new Error('Este navegador no admite Web NFC. Usa Chrome en un dispositivo Android compatible.');
  }
  return new window.NDEFReader();
}

export async function writeNfcTag(tag, { signal } = {}) {
  const reader = createNdefReader();
  const publicUrl = new URL(`/scan/${encodeURIComponent(tag.token_publico)}`, window.location.origin).toString();
  const tagData = new TextEncoder().encode(JSON.stringify({
    uidNFC: tag.uidNFC,
    token_publico: tag.token_publico,
  }));

  await reader.write({
    records: [
      { recordType: 'url', data: publicUrl },
      { recordType: 'mime', mediaType: ENCONTRAME_RECORD_TYPE, data: tagData },
    ],
  }, { overwrite: true, signal });
}

export function readNfcTag({ signal } = {}) {
  const reader = createNdefReader();
  const scanController = new AbortController();

  return new Promise((resolve, reject) => {
    let settled = false;
    const cleanup = () => {
      reader.removeEventListener('reading', handleReading);
      reader.removeEventListener('readingerror', handleReadingError);
      signal?.removeEventListener('abort', handleAbort);
    };
    const finish = (callback, value) => {
      if (settled) return;
      settled = true;
      cleanup();
      scanController.abort();
      callback(value);
    };
    const handleAbort = () => {
      finish(reject, signal.reason || new DOMException('Lectura NFC cancelada.', 'AbortError'));
    };
    const handleReadingError = () => {
      finish(reject, new Error('No se pudo leer la chapita NFC. Acércala nuevamente e inténtalo otra vez.'));
    };
    const handleReading = (event) => {
      try {
        const record = Array.from(event.message.records).find(
          (item) => item.recordType === 'mime' && item.mediaType === ENCONTRAME_RECORD_TYPE,
        );
        if (!record) {
          throw new Error('La chapita no tiene datos de Encontrame. Primero usa “Programar NFC”.');
        }

        const tag = JSON.parse(new TextDecoder().decode(record.data));
        if (typeof tag.uidNFC !== 'string' || typeof tag.token_publico !== 'string') {
          throw new Error('Los datos NFC están incompletos o no son válidos.');
        }
        finish(resolve, tag);
      } catch (error) {
        finish(reject, error);
      }
    };

    if (signal?.aborted) {
      handleAbort();
      return;
    }

    reader.addEventListener('reading', handleReading, { once: true });
    reader.addEventListener('readingerror', handleReadingError, { once: true });
    signal?.addEventListener('abort', handleAbort, { once: true });
    reader.scan({ signal: scanController.signal }).catch((error) => {
      finish(reject, error);
    });
  });
}
