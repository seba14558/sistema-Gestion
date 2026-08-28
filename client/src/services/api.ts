import axios from 'axios';
import type { AuthResponse, User, VentasResumen, Compra, PaginatedResponse, InformeResumen } from '../types';

const api = axios.create({
  baseURL: '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const login = async (username: string, password: string): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/login', { username, password });
  return response.data;
};

export const getMe = async (): Promise<User> => {
  const response = await api.get<User>('/auth/me');
  return response.data;
};

export const registrarTarjeta = async (data: any) => {
  const response = await api.post('/ventas/tarjeta', data);
  return response.data;
};

export const registrarBilletera = async (data: any) => {
  const response = await api.post('/ventas/billetera', data);
  return response.data;
};

export const registrarEfectivo = async (data: any) => {
  const response = await api.post('/ventas/efectivo', data);
  return response.data;
};

export const getVentasResumen = async (mes?: number, anio?: number): Promise<VentasResumen> => {
  const params: any = {};
  if (mes !== undefined) params.mes = mes;
  if (anio !== undefined) params.anio = anio;
  const response = await api.get<VentasResumen>('/ventas/resumen', { params });
  return response.data;
};

export const crearCompra = async (data: any): Promise<Compra> => {
  const response = await api.post<Compra>('/compras', data);
  return response.data;
};

export const getCompras = async (params?: any): Promise<PaginatedResponse<Compra>> => {
  const response = await api.get<PaginatedResponse<Compra>>('/compras', { params });
  return response.data;
};

export const getDBRecords = async (tabla: string, params?: any) => {
  const response = await api.get(`/db/${tabla}`, { params });
  return response.data;
};

export const updateDBRecord = async (tabla: string, id: number, data: any) => {
  const response = await api.put(`/db/${tabla}/${id}`, data);
  return response.data;
};

export const deleteDBRecord = async (tabla: string, id: number) => {
  const response = await api.delete(`/db/${tabla}/${id}`);
  return response.data;
};

export const exportDB = async (tabla: string) => {
  const response = await api.get(`/db/${tabla}/export`, { responseType: 'blob' });
  return response.data;
};

export const getInformeResumen = async (): Promise<InformeResumen> => {
  const response = await api.get<InformeResumen>('/informes/resumen');
  return response.data;
};

export default api;
