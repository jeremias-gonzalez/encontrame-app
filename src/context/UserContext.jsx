import React, { createContext, useContext, useState, useCallback } from 'react';
import { api, getStoredToken, setStoredToken, getStoredUser, setStoredUser } from '../api/config';
import { fetchAllPages } from '../api/pagination';

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [token, setToken] = useState(() => getStoredToken());
  const [currentUser, setCurrentUser] = useState(() => getStoredUser());
  const [users, setUsers] = useState([]);
  const [usersLoaded, setUsersLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Iniciar sesión con FastAPI (/auth/login)
  const login = async (email, contraseña) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/auth/login', { email, contraseña });
      // res: { access_token, token_type, usuario }
      const accessToken = res.access_token;
      const user = res.usuario || { email };

      setToken(accessToken);
      setCurrentUser(user);
      setStoredToken(accessToken);
      setStoredUser(user);

      return res;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Registrar nuevo usuario (/auth/register)
  const register = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/auth/register', userData);
      return res;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Cerrar sesión
  const logout = () => {
    setToken(null);
    setCurrentUser(null);
    setStoredToken(null);
    setStoredUser(null);
  };

  // Obtener lista de usuarios para asignar en mascotas / modales (/usuarios/)
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const list = await fetchAllPages('/usuarios/');
      setUsers(list);
      setUsersLoaded(true);
      return list;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getUser = async (id) => api.get(`/usuarios/${id}`);

  // Crear usuario directo desde CRUD (/usuarios/)
  const createUser = async (userData) => {
    const res = await api.post('/usuarios/', userData);
    await fetchUsers();
    return res;
  };

  // Editar usuario (/usuarios/{id})
  const updateUser = async (id, userData) => {
    const res = await api.put(`/usuarios/${id}`, userData);
    await fetchUsers();
    return res;
  };

  // Eliminar usuario (/usuarios/{id}?logico=true)
  const deleteUser = async (id, logico = true) => {
    const res = await api.delete(`/usuarios/${id}?logico=${logico}`);
    await fetchUsers();
    return res;
  };

  const value = {
    token,
    currentUser,
    isAuthenticated: !!token,
    users,
    usersLoaded,
    loading,
    error,
    login,
    register,
    logout,
    fetchUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser debe ser usado dentro de un UserProvider');
  }
  return context;
}
