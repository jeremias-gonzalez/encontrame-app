/**
 * Configuración de cliente HTTP para FastAPI (Encontrame)
 * Maneja cabeceras automáticas, JSON y token JWT Bearer.
 */

export const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000').replace(/\/+$/, '');

export function getStoredToken() {
  return localStorage.getItem('encontrame_token');
}

export function setStoredToken(token) {
  if (token) {
    localStorage.setItem('encontrame_token', token);
  } else {
    localStorage.removeItem('encontrame_token');
  }
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem('encontrame_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setStoredUser(user) {
  if (user) {
    localStorage.setItem('encontrame_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('encontrame_user');
  }
}

/**
 * Función central de peticiones fetch a FastAPI
 */
export async function apiRequest(endpoint, { method = 'GET', body = null, headers = {} } = {}) {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const requestHeaders = {
    'Accept': 'application/json',
    ...headers,
  };

  if (body && !(body instanceof FormData)) {
    requestHeaders['Content-Type'] = 'application/json';
  }

  const token = getStoredToken();
  if (token) {
    requestHeaders['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    method,
    headers: requestHeaders,
  };

  if (body) {
    config.body = body instanceof FormData ? body : JSON.stringify(body);
  }

  const res = await fetch(url, config);

  // Intentar parsear JSON de respuesta
  let data = null;
  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    data = await res.json();
  } else {
    data = await res.text();
  }

  if (!res.ok) {
    let errorMsg = `Error HTTP ${res.status}`;
    if (data && typeof data === 'object') {
      if (typeof data.detail === 'string') {
        errorMsg = data.detail;
      } else if (Array.isArray(data.detail)) {
        errorMsg = data.detail.map(d => `${d.loc ? d.loc.join('.') + ': ' : ''}${d.msg}`).join(' | ');
      } else if (data.message) {
        errorMsg = data.message;
      }
    } else if (typeof data === 'string' && data.length > 0) {
      errorMsg = data;
    }
    const err = new Error(errorMsg);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

export const api = {
  get: (endpoint, headers) => apiRequest(endpoint, { method: 'GET', headers }),
  post: (endpoint, body, headers) => apiRequest(endpoint, { method: 'POST', body, headers }),
  put: (endpoint, body, headers) => apiRequest(endpoint, { method: 'PUT', body, headers }),
  delete: (endpoint, headers) => apiRequest(endpoint, { method: 'DELETE', headers }),
};
