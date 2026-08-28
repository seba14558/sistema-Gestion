export interface User {
  id: number;
  username: string;
  role: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Billetera {
  id: number;
  fecha: string;
  medio: string;
  monto: number;
  createdAt: string;
}

export interface Efectivo {
  id: number;
  fecha: string;
  medio: string;
  monto: number;
  createdAt: string;
}

export interface Tarjeta {
  id: number;
  fecha: string;
  medio: string;
  monto: number;
  createdAt: string;
}

export interface Compra {
  id: number;
  fecha: string;
  medio: string;
  monto: number;
  cuit: string;
  tipoFactura: string;
  registroMovimiento: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

export interface VentasResumen {
  totalTarjetas: number;
  totalBilleteras: number;
  totalEfectivo: number;
  totalGeneral: number;
  ventasPorDia: { fecha: string; tarjetas: number; billeteras: number; efectivo: number }[];
  topeBilleteras: {
    personalPay: { total: number; operaciones: number };
    mercadoPago: { total: number; operaciones: number };
    naranja: { total: number; operaciones: number };
  };
  facturacionDiaria: { fecha: string; total: number }[];
}

export interface InformeResumen {
  ventasTotales: number;
  ventasEfectivo: number;
  ventasBilleteras: number;
  ventasTarjetas: number;
  totalCompras: number;
  comprasFacturadas: number;
  comprasSinFactura: number;
  costo?: number;
  rentabilidad?: number;
  ventasPorMes: { mes: string; tarjetas: number; billeteras: number; efectivo: number; total: number }[];
}

export const formatDate = (dateInput: string | Date | null | undefined): string => {
  if (!dateInput) return '-';
  if (typeof dateInput === 'string') {
    const match = dateInput.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      const [, y, m, d] = match;
      return `${d}/${m}/${y}`;
    }
  }
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('es-AR', { timeZone: 'UTC' });
};
