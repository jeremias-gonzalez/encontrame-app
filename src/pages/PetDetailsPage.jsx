import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api/config';

export function PetDetailsPage() {
  const { id } = useParams();
  const [detail, setDetail] = useState({ id: null, pet: null, error: null });

  useEffect(() => {
    let active = true;
    api.get(`/mascotas/${id}`)
      .then((response) => { if (active) setDetail({ id, pet: response, error: null }); })
      .catch((requestError) => { if (active) setDetail({ id, pet: null, error: requestError.message }); });
    return () => { active = false; };
  }, [id]);

  const loading = detail.id !== id;
  const pet = loading ? null : detail.pet;
  const error = loading ? null : detail.error;

  if (loading) return <p role="status" className="rounded-2xl bg-surface p-6 text-textMuted">Cargando ficha…</p>;
  if (error) return <section className="space-y-4"><p role="alert" className="rounded-xl bg-rose-500/10 p-4 text-rose-700">{error}</p><Link to="/" className="text-primary hover:underline">Volver al panel</Link></section>;
  if (!pet) return null;

  return (
    <article className="mx-auto max-w-3xl space-y-5 rounded-3xl bg-surface p-6 text-text shadow-sm">
      <Link to="/" className="text-sm font-bold text-primary hover:underline">← Volver a mascotas</Link>
      {pet.foto_url && <img src={pet.foto_url} alt={pet.nombre} className="h-64 w-full rounded-2xl object-cover" />}
      <div>
        <h1 className="text-3xl font-black">{pet.nombre}</h1>
        <p className="text-textMuted">{pet.especie} · {pet.raza} · {pet.color || 'Color no informado'}</p>
        <p className="mt-2 text-sm">Estado: {pet.estado_extravio}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <section className="rounded-2xl border border-primary/10 p-4">
          <h2 className="font-bold">Tutor</h2>
          <p>{pet.usuario?.nombre || 'Sin asignar'}</p>
          <p className="text-sm text-textMuted">{pet.usuario?.telefono || pet.usuario?.email || ''}</p>
        </section>
        <section className="rounded-2xl border border-primary/10 p-4">
          <h2 className="font-bold">Tag NFC</h2>
          <p>{pet.tag?.codigoQR || pet.tag?.token_publico || 'Sin tag asociado'}</p>
          <p className="text-sm text-textMuted">{pet.tag?.uidNFC || ''}</p>
        </section>
      </div>
      {pet.mensaje_personalizado && <section><h2 className="font-bold">Mensaje público</h2><p>{pet.mensaje_personalizado}</p></section>}
      {pet.notas_medicas && <section><h2 className="font-bold">Notas médicas</h2><p>{pet.notas_medicas}</p></section>}
      {pet.recompensa && <section><h2 className="font-bold">Recompensa</h2><p>{pet.recompensa}</p></section>}
    </article>
  );
}
