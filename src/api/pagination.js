import { api } from './config';

export async function fetchAllPages(endpoint, size = 50) {
  const items = [];
  let page = 1;
  let totalPages = 1;

  do {
    const separator = endpoint.includes('?') ? '&' : '?';
    const response = await api.get(`${endpoint}${separator}page=${page}&size=${size}`);
    const pageItems = Array.isArray(response) ? response : response?.items;

    if (!Array.isArray(pageItems)) {
      throw new Error(`La respuesta paginada de ${endpoint} no contiene una lista de elementos.`);
    }

    items.push(...pageItems);
    totalPages = Number(response?.pages) || 1;
    page += 1;
  } while (page <= totalPages);

  return items;
}
