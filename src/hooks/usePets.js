import { createElement, createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { api } from '../api/config';
import { fetchAllPages } from '../api/pagination';
import { useUser } from '../context/UserContext';
import { useTags } from '../context/TagContext';

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

const PetContext = createContext(null);

function usePetStore() {
  const { users, usersLoaded, fetchUsers } = useUser();
  const { fetchTags } = useTags();
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

  // Cargar datos vivos desde FastAPI y enriquecer las relaciones públicas.
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [items, tagList, userList] = await Promise.all([
        fetchAllPages('/mascotas/', 100),
        fetchTags(),
        usersLoaded ? Promise.resolve(users) : fetchUsers(),
      ]);
      const userById = new Map(userList.map((user) => [String(user.id), user]));
      const tagById = new Map(tagList.map((tag) => [String(tag.id), tag]));
      const normalized = items.filter((item) => item.estado !== false).map((item) => normalizePet({
        ...item,
        usuario: userById.get(String(item.usuario_id)) || null,
        tag: tagById.get(String(item.tag_id)) || null,
      }));
      setPets(normalized);
      setMetrics(calculateMetrics(normalized));
    } catch (apiErr) {
      setError(`No se pudieron cargar las mascotas: ${apiErr.message}`);
    } finally {
      setLoading(false);
    }
  }, [fetchTags, fetchUsers, users, usersLoaded]);

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
      setError(err.message);
      throw err;
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
      setError(err.message);
      throw err;
    }
  };

  const deletePet = async (id, logico = true) => {
    setError(null);
    try {
      await api.delete(`/mascotas/${id}?logico=${logico}`);
      await loadData();
      return true;
    } catch (err) {
      setError(err.message);
      throw err;
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
      await loadData();
      setError(err.message);
      throw err;
    }
  };

  const pairTag = async (petId, tagIdentifier) => {
    setError(null);
    const pet = pets.find((item) => String(item.id) === String(petId));
    if (!pet) throw new Error('No se encontró la mascota seleccionada.');

    try {
      const availableTags = await fetchTags();
      const tag = availableTags.find((item) => (
        String(item.id) === String(tagIdentifier)
        || item.codigoQR === tagIdentifier
        || item.uidNFC === tagIdentifier
        || item.token_publico === tagIdentifier
      ));
      if (!tag || !tag.activo || tag.estado !== 'disponible') {
        throw new Error('El tag no existe o ya no está disponible.');
      }

      await api.put(`/tags/${tag.id}`, { ...tag, estado: 'reclamado' });
      try {
        await api.put(`/mascotas/${petId}`, {
          nombre: pet.nombre,
          especie: pet.especie,
          raza: pet.raza,
          color: pet.color,
          foto_url: pet.foto_url || null,
          estado_extravio: pet.estado_extravio,
          notas_medicas: pet.notas_medicas || null,
          mensaje_personalizado: pet.mensaje_personalizado || null,
          mostrar_telefono: pet.mostrar_telefono,
          mostrar_direccion: pet.mostrar_direccion,
          recompensa: pet.recompensa || null,
          estado: true,
          tag_id: Number(tag.id),
          usuario_id: pet.usuario_id ? Number(pet.usuario_id) : null,
        });
      } catch (petError) {
        try {
          await api.put(`/tags/${tag.id}`, { ...tag, estado: 'disponible' });
        } catch (rollbackError) {
          throw new Error(`${petError.message} Además, no se pudo liberar el tag: ${rollbackError.message}`);
        }
        throw petError;
      }
      await loadData();
    } catch (err) {
      await loadData();
      setError(err.message);
      throw err;
    }
  };

  const unpairTag = async (petId) => {
    setError(null);
    try {
      const pet = pets.find((item) => String(item.id) === String(petId));
      if (!pet?.tag_id) throw new Error('La mascota no tiene un tag asociado.');
      await api.put(`/mascotas/${petId}`, {
        nombre: pet.nombre,
        especie: pet.especie,
        raza: pet.raza,
        color: pet.color,
        foto_url: pet.foto_url || null,
        estado_extravio: pet.estado_extravio,
        notas_medicas: pet.notas_medicas || null,
        mensaje_personalizado: pet.mensaje_personalizado || null,
        mostrar_telefono: pet.mostrar_telefono,
        mostrar_direccion: pet.mostrar_direccion,
        recompensa: pet.recompensa || null,
        estado: true,
        tag_id: null,
        usuario_id: pet.usuario_id ? Number(pet.usuario_id) : null,
      });
      const currentTags = await fetchTags();
      const tag = currentTags.find((item) => String(item.id) === String(pet.tag_id));
      if (tag) {
        await api.put(`/tags/${tag.id}`, { ...tag, estado: 'disponible' });
      }
      await loadData();
    } catch (err) {
      setError(err.message);
      throw err;
    }
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
  };
}

export function PetProvider({ children }) {
  const value = usePetStore();
  return createElement(PetContext.Provider, { value }, children);
}

export function usePets() {
  const context = useContext(PetContext);
  if (!context) throw new Error('usePets debe utilizarse dentro de un PetProvider');
  return context;
}
