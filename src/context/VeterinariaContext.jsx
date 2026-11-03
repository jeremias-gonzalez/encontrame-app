import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../api/config';

const VeterinariaContext = createContext(null);

export function VeterinariaProvider({ children }) {
  const [veterinarias, setVeterinarias] = useState([]);
  const [currentVeterinaria, setCurrentVeterinaria] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar lista de veterinarias (/veterinarias/)
  const fetchVeterinarias = useCallback(async (page = 1, size = 50) => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/veterinarias/?page=${page}&size=${size}`);
      const list = Array.isArray(res) ? res : (res?.items || []);
      setVeterinarias(list);
      if (list.length > 0 && !currentVeterinaria) {
        setCurrentVeterinaria(list[0]);
      }
      return list;
    } catch (err) {
      console.warn('No se pudo cargar la lista de veterinarias de FastAPI:', err.message);
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, [currentVeterinaria]);

  // Detalle de veterinaria con tags asignados (/veterinarias/{id})
  const getVeterinaria = async (id) => {
    return await api.get(`/veterinarias/${id}`);
  };

  // Crear veterinaria (/veterinarias/)
  const createVeterinaria = async (data) => {
    setLoading(true);
    try {
      const payload = {
        nombre: data.nombre,
        telefono: data.telefono,
        activo: data.activo !== undefined ? data.activo : true,
      };
      const res = await api.post('/veterinarias/', payload);
      await fetchVeterinarias();
      return res;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Modificar veterinaria (/veterinarias/{id})
  const updateVeterinaria = async (id, data) => {
    setLoading(true);
    try {
      const res = await api.put(`/veterinarias/${id}`, data);
      await fetchVeterinarias();
      return res;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Baja lógica (/veterinarias/{id}?logico=true)
  const deleteVeterinaria = async (id, logico = true) => {
    setLoading(true);
    try {
      const res = await api.delete(`/veterinarias/${id}?logico=${logico}`);
      await fetchVeterinarias();
      return res;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Seleccionar veterinaria activa
  const selectVeterinaria = (vet) => {
    setCurrentVeterinaria(vet);
  };

  useEffect(() => {
    fetchVeterinarias();
  }, [fetchVeterinarias]);

  const value = {
    veterinarias,
    currentVeterinaria,
    loading,
    error,
    fetchVeterinarias,
    getVeterinaria,
    createVeterinaria,
    updateVeterinaria,
    deleteVeterinaria,
    selectVeterinaria,
  };

  return (
    <VeterinariaContext.Provider value={value}>
      {children}
    </VeterinariaContext.Provider>
  );
}

export function useVeterinaria() {
  const context = useContext(VeterinariaContext);
  if (!context) {
    throw new Error('useVeterinaria debe ser usado dentro de un VeterinariaProvider');
  }
  return context;
}

