import { useState, useEffect, useCallback, useMemo } from 'react';
import { api } from '../api/config';
import { petRepository } from '../repositories/LocalStoragePetRepository';

/**
 * Normaliza los datos que vienen de FastAPI (con campos en español)
 * para mantener compatibilidad total con la UI existente.
 */
export function normalizePet(raw) {
  if (!raw) return null;
  const isLost = raw.estado_extravio === 'perdido' || raw.isLost === true;
  return {
    id: String(raw.id),
    name: raw.nombre || raw.name || 'Sin nombre',
    nombre: raw.nombre || raw.name || 'Sin nombre',
    species: (raw.especie || raw.species || 'perro').toLowerCase(),
    especie: raw.especie || raw.species || 'Perro',
    breed: raw.raza || raw.breed || 'Mestizo',
    raza: raw.raza || raw.breed || 'Mestizo',
    color: raw.color || 'No especificado',
    gender: raw.genero || raw.gender || 'macho',
    birthDate: raw.fecha_nacimiento || raw.birthDate || '',
    weightKg: raw.peso_kg || raw.weightKg || undefined,
    photoUrl: raw.foto_url || raw.photoUrl || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80',
    foto_url: raw.foto_url || raw.photoUrl || '',
    medicalNotes: raw.notas_medicas || raw.medicalNotes || '',
    notas_medicas: raw.notas_medicas || raw.medicalNotes || '',
    mensaje_personalizado: raw.mensaje_personalizado || '',
    mostrar_telefono: raw.mostrar_telefono !== undefined ? raw.mostrar_telefono : true,
    mostrar_direccion: raw.mostrar_direccion !== undefined ? raw.mostrar_direccion : false,
    recompensa: raw.recompensa || '',
    estado_extravio: raw.estado_extravio || (isLost ? 'perdido' : 'en_casa'),
    isLost: isLost,
    lostSince: raw.lostSince || (isLost ? new Date().toISOString() : undefined),
    isSterilized: raw.isSterilized ?? false,
    microchipNumber: raw.microchipNumber || '',
    tag_id: raw.tag_id || null,
    usuario_id: raw.usuario_id || null,
    guardian: {
      name: raw.usuario?.nombre || raw.guardian?.name || 'Tutor no asignado',
      phone: raw.usuario?.telefono || raw.guardian?.phone || 'Sin teléfono',
      secondaryPhone: raw.usuario?.telefono_secundario || raw.guardian?.secondaryPhone || '',
      email: raw.usuario?.email || raw.guardian?.email || '',
      address: raw.usuario?.direccion || raw.guardian?.address || '',
      city: raw.usuario?.ciudad || raw.guardian?.city || 'Córdoba Capital',
      emergencyNotes: raw.guardian?.emergencyNotes || '',
    },
    usuario: raw.usuario || null,
    nfcTag: raw.tag
      ? {
          tagCode: raw.tag.codigoQR || raw.tag.token_publico || raw.tag.uidNFC || `TAG-${raw.tag.id}`,
          status: raw.tag.estado === 'disponible' ? 'active' : (raw.tag.estado || 'active'),
          pairedAt: raw.tag.created_at || new Date().toISOString(),
          lastScannedAt: raw.tag.last_scan || undefined,
          scanCount: raw.tag.scan_count || 0,
          filamentColor: raw.tag.color || 'Azul Cobalto',
        }
      : raw.nfcTag || null,
    tag: raw.tag || null,
  };
}

export function usePets() {
  const [pets, setPets] = useState([]);
  const [metrics, setMetrics] = useState({
    totalPets: 0,
    activeNfcTags: 0,
    lostPetsCount: 0,
    unpairedCount: 0,
    totalScans: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filtros de búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [speciesFilter, setSpeciesFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Calcular métricas derivadas en vivo
  const calculateMetrics = (petList) => {
    const total = petList.length;
    const paired = petList.filter((p) => !!p.nfcTag || !!p.tag_id).length;
    const lost = petList.filter((p) => p.isLost || p.estado_extravio === 'perdido').length;
    const unpaired = total - paired;
    const scans = petList.reduce((acc, p) => acc + (p.nfcTag?.scanCount || 0), 0);
    return {
      totalPets: total,
      activeNfcTags: paired,
      lostPetsCount: lost,
      unpairedCount: unpaired,
      totalScans: scans,
    };
  };

  // Cargar datos desde FastAPI (/mascotas/) con fallback a localStorage
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Intentar fetch a FastAPI
      const res = await api.get('/mascotas/?page=1&size=100');
      const items = Array.isArray(res) ? res : (res?.items || []);
      const normalized = items.map(normalizePet);
      setPets(normalized);
      setMetrics(calculateMetrics(normalized));
    } catch (apiErr) {
      console.warn('FastAPI no respondió o dio error. Usando almacenamiento local de respaldo:', apiErr.message);
      try {
        const localPets = await petRepository.getAll();
        setPets(localPets);
        setMetrics(calculateMetrics(localPets));
      } catch {
        setError('Error al cargar mascotas: ' + apiErr.message);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Mascotas filtradas
  const filteredPets = useMemo(() => {
    return pets.filter((pet) => {
      const q = searchTerm.toLowerCase().trim();
      if (q) {
        const matchesName = (pet.name || pet.nombre || '').toLowerCase().includes(q);
        const matchesBreed = (pet.breed || pet.raza || '').toLowerCase().includes(q);
        const matchesGuardian = (pet.guardian?.name || '').toLowerCase().includes(q);
        const matchesPhone = (pet.guardian?.phone || '').toLowerCase().includes(q);
        const matchesTag = pet.nfcTag?.tagCode?.toLowerCase().includes(q) ?? false;
        if (!matchesName && !matchesBreed && !matchesGuardian && !matchesPhone && !matchesTag) {
          return false;
        }
      }

      if (speciesFilter !== 'all' && pet.species !== speciesFilter) {
        return false;
      }

      if (statusFilter === 'paired' && !pet.nfcTag && !pet.tag_id) return false;
      if (statusFilter === 'unpaired' && (pet.nfcTag || pet.tag_id)) return false;
      if (statusFilter === 'lost' && !pet.isLost) return false;

      return true;
    });
  }, [pets, searchTerm, speciesFilter, statusFilter]);

  // CRUD con FastAPI según README.md l. 153-169
  const createPet = async (formData) => {
    setError(null);
    const body = {
      nombre: formData.nombre || formData.name,
      especie: formData.especie || formData.species,
      raza: formData.raza || formData.breed || 'Mestizo',
      color: formData.color || 'No especificado',
      foto_url: formData.foto_url || formData.photoUrl || '',
      estado_extravio: formData.estado_extravio || (formData.isLost ? 'perdido' : 'en_casa'),
      notas_medicas: formData.notas_medicas || formData.medicalNotes || null,
      mensaje_personalizado: formData.mensaje_personalizado || null,
      mostrar_telefono: formData.mostrar_telefono !== undefined ? formData.mostrar_telefono : true,
      mostrar_direccion: formData.mostrar_direccion !== undefined ? formData.mostrar_direccion : false,
      recompensa: formData.recompensa || null,
      estado: formData.estado !== undefined ? formData.estado : true,
      tag_id: formData.tag_id ? Number(formData.tag_id) : null,
      usuario_id: formData.usuario_id ? Number(formData.usuario_id) : null,
    };

    try {
      const res = await api.post('/mascotas/', body);
      await loadData();
      return normalizePet(res);
    } catch (err) {
      console.warn('Fallo llamada a FastAPI /mascotas/, guardando localmente:', err.message);
      const createdLocal = await petRepository.create(formData);
      await loadData();
      return createdLocal;
    }
  };

  const updatePet = async (id, formData) => {
    setError(null);
    const body = {
      nombre: formData.nombre || formData.name,
      especie: formData.especie || formData.species,
      raza: formData.raza || formData.breed || 'Mestizo',
      color: formData.color || 'No especificado',
      foto_url: formData.foto_url || formData.photoUrl || '',
      estado_extravio: formData.estado_extravio || (formData.isLost ? 'perdido' : 'en_casa'),
      notas_medicas: formData.notas_medicas || formData.medicalNotes || null,
      mensaje_personalizado: formData.mensaje_personalizado || null,
      mostrar_telefono: formData.mostrar_telefono !== undefined ? formData.mostrar_telefono : true,
      mostrar_direccion: formData.mostrar_direccion !== undefined ? formData.mostrar_direccion : false,
      recompensa: formData.recompensa || null,
      estado: formData.estado !== undefined ? formData.estado : true,
      tag_id: formData.tag_id ? Number(formData.tag_id) : null,
      usuario_id: formData.usuario_id ? Number(formData.usuario_id) : null,
    };

    try {
      const res = await api.put(`/mascotas/${id}`, body);
      await loadData();
      return normalizePet(res);
    } catch (err) {
      console.warn('Fallo llamada a FastAPI PUT /mascotas/, actualizando localmente:', err.message);
      const updatedLocal = await petRepository.update(id, formData);
      await loadData();
      return updatedLocal;
    }
  };

  const deletePet = async (id, logico = true) => {
    setError(null);
    try {
      await api.delete(`/mascotas/${id}?logico=${logico}`);
      await loadData();
      return true;
    } catch (err) {
      console.warn('Fallo llamada a FastAPI DELETE /mascotas/, eliminando localmente:', err.message);
      const ok = await petRepository.delete(id);
      await loadData();
      return ok;
    }
  };

  const toggleLost = async (id, isLost) => {
    setError(null);
    const nextEstado = isLost ? 'perdido' : 'en_casa';
    try {
      // Obtenemos la mascota actual para mantener sus campos obligatorios
      const current = pets.find((p) => String(p.id) === String(id));
      if (current) {
        await api.put(`/mascotas/${id}`, {
          nombre: current.name || current.nombre,
          especie: current.species || current.especie,
          raza: current.breed || current.raza,
          color: current.color || '',
          foto_url: current.photoUrl || current.foto_url || '',
          estado_extravio: nextEstado,
          notas_medicas: current.medicalNotes || current.notas_medicas || null,
          mensaje_personalizado: current.mensaje_personalizado || null,
          mostrar_telefono: current.mostrar_telefono ?? true,
          mostrar_direccion: current.mostrar_direccion ?? false,
          recompensa: current.recompensa || null,
          estado: true,
          tag_id: current.tag_id || null,
          usuario_id: current.usuario_id || null,
        });
      }
      await loadData();
    } catch (err) {
      console.warn('Fallo llamada a FastAPI toggleLost, usando local:', err.message);
      await petRepository.toggleLostStatus(id, isLost);
      await loadData();
    }
  };

  const pairTag = async (petId, tagCode, color) => {
    setError(null);
    try {
      // Si se cuenta con endpoint de vinculación o alta de tag en FastAPI
      await petRepository.pairNfcTag(petId, tagCode, color);
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const unpairTag = async (petId) => {
    setError(null);
    try {
      await petRepository.unpairNfcTag(petId);
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const resetToSeeds = async () => {
    petRepository.resetDemoData();
    await loadData();
  };

  return {
    pets: filteredPets,
    allPetsCount: pets.length,
    metrics,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    speciesFilter,
    setSpeciesFilter,
    statusFilter,
    setStatusFilter,
    refresh: loadData,
    createPet,
    updatePet,
    deletePet,
    toggleLost,
    pairTag,
    unpairTag,
    resetToSeeds,
  };
}
