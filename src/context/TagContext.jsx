import React, { createContext, useCallback, useContext, useState } from 'react';
import { api } from '../api/config';
import { fetchAllPages } from '../api/pagination';

const TagContext = createContext(null);

export function TagProvider({ children }) {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTags = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await fetchAllPages('/tags/');
      setTags(list);
      return list;
    } catch (requestError) {
      setError(requestError.message);
      throw requestError;
    } finally {
      setLoading(false);
    }
  }, []);

  const getTag = async (id) => api.get(`/tags/${id}`);

  const createTag = async (tag) => {
    const result = await api.post('/tags/', tag);
    await fetchTags();
    return result;
  };

  const updateTag = async (id, tag) => {
    const result = await api.put(`/tags/${id}`, tag);
    await fetchTags();
    return result;
  };

  const deleteTag = async (id, logico = true) => {
    const result = await api.delete(`/tags/${id}?logico=${logico}`);
    await fetchTags();
    return result;
  };

  return (
    <TagContext.Provider value={{ tags, loading, error, fetchTags, getTag, createTag, updateTag, deleteTag }}>
      {children}
    </TagContext.Provider>
  );
}

export function useTags() {
  const context = useContext(TagContext);
  if (!context) throw new Error('useTags debe utilizarse dentro de un TagProvider');
  return context;
}
