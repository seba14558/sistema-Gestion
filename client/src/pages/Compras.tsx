import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import * as api from '../services/api';
import { DataTable } from '../components/ui/DataTable';
import { formatDate, type Compra } from '../types';
import { DayPicker } from 'react-day-picker';
import { es } from 'date-fns/locale';

export default function Compras() {
  const { isAdmin } = useAuth();
  const [compras, setCompras] = useState<Compra[]>([]);
  const [loading, setLoading] = useState(true);
  
  const today = new Date().toISOString().split('T')[0];

  // Filters
  const [filters, setFilters] = useState({ fechaDesde: '', fechaHasta: '', medio: '', tipoFactura: '' });
  
  // Date picker state
  const [showDesdePicker, setShowDesdePicker] = useState(false);
  const [showHastaPicker, setShowHastaPicker] = useState(false);
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Form
  const [form, setForm] = useState({ fecha: today, medio: 'Transferencia', monto: '', cuit: '', tipoFactura: 'A' });

  const fetchCompras = async (targetPage = page, customFilters = filters) => {
    setLoading(true);
    try {
      const cleanedParams: any = { page: targetPage, limit: 10 };
      if (customFilters.fechaDesde) cleanedParams.fechaDesde = customFilters.fechaDesde;
      if (customFilters.fechaHasta) cleanedParams.fechaHasta = customFilters.fechaHasta;
      if (customFilters.medio && customFilters.medio !== 'Todos') cleanedParams.medio = customFilters.medio;
      if (customFilters.tipoFactura && customFilters.tipoFactura !== 'Todas') cleanedParams.tipoFactura = customFilters.tipoFactura;

      const res = await api.getCompras(cleanedParams);
      setCompras(res.data || []);
      setTotalPages(res.totalPages || 1);
    } catch (error) {
      console.error(error);
      setCompras([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompras(page, filters);
  }, [page]);

  const handleFilter = () => {
    setPage(1);
    fetchCompras(1, filters);
  };

  const clearFilter = () => {
    const emptyFilters = { fechaDesde: '', fechaHasta: '', medio: '', tipoFactura: '' };
    setFilters(emptyFilters);
    setPage(1);
    fetchCompras(1, emptyFilters);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.crearCompra({ ...form, monto: Number(form.monto) });
      alert('Compra registrada exitosamente');
      setForm({ fecha: today, medio: 'Transferencia', monto: '', cuit: '', tipoFactura: 'A' });
      fetchCompras(page, filters);
    } catch (error) {
      alert('Error al registrar compra');
    }
  };

  const columns = [
    { key: 'fecha', label: 'Fecha', render: (row: Compra) => formatDate(row.fecha) },
    { key: 'medio', label: 'Medio' },
    { key: 'monto', label: 'Monto', render: (row: Compra) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(row.monto) },
    { key: 'cuit', label: 'CUIT' },
    { key: 'tipoFactura', label: 'Tipo Factura', render: (row: Compra) => {
        const colors: Record<string, string> = { 'A': 'bg-emerald-500/20 text-emerald-400', 'B': 'bg-blue-500/20 text-blue-400', 'C': 'bg-amber-500/20 text-amber-400' };
        return <span className={`px-2 py-1 rounded text-xs font-medium ${colors[row.tipoFactura] || ''}`}>{row.tipoFactura}</span>;
      }
    },
    { key: 'registroMovimiento', label: 'Registro', render: (row: Compra) => formatDate(row.registroMovimiento) }
  ];

  return (
    <div className="page-container p-4 sm:p-6 animate-fade-in text-text-primary">
      <h1 className="page-title text-2xl sm:text-3xl font-bold bg-gradient-to-r from-accent-purple to-accent-blue bg-clip-text text-transparent mb-6 sm:mb-8">Registro de Compras</h1>

      {isAdmin && (
        <div className="glass-card p-4 sm:p-6 rounded-xl mb-6 sm:mb-8 border border-white/10 shadow-xl">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">Nueva Compra</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-sm text-text-secondary font-medium">Fecha</label>
                <input
                  type="date"
                  required
                  className="input-field w-full p-2.5 bg-dark-800 border border-white/10 rounded-xl text-text-primary text-sm focus:border-accent-purple focus:ring-2 focus:ring-accent-purple/20"
                  value={form.fecha}
                  onChange={e => setForm({...form, fecha: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-text-secondary font-medium">Medio</label>
                <select required className="select-field w-full p-2.5 bg-dark-800 border border-white/10 rounded-xl text-text-primary text-sm" value={form.medio} onChange={e => setForm({...form, medio: e.target.value})}>
                  <option>Transferencia</option><option>Efectivo</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm text-text-secondary font-medium">Monto</label>
                <input type="number" required min="0" step="0.01" className="input-field w-full p-2.5 bg-dark-800 border border-white/10 rounded-xl text-text-primary text-sm" placeholder="$ 0,00" value={form.monto} onChange={e => setForm({...form, monto: e.target.value})} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm text-text-secondary font-medium">CUIT</label>
                <input type="text" required className="input-field w-full p-2.5 bg-dark-800 border border-white/10 rounded-xl text-text-primary text-sm" placeholder="20-12345678-9" value={form.cuit} onChange={e => setForm({...form, cuit: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-text-secondary font-medium">Tipo de Factura</label>
                <select required className="select-field w-full p-2.5 bg-dark-800 border border-white/10 rounded-xl text-text-primary text-sm" value={form.tipoFactura} onChange={e => setForm({...form, tipoFactura: e.target.value})}>
                  <option>A</option><option>B</option><option>C</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end">
              <button type="submit" className="btn-primary bg-gradient-to-r from-accent-purple to-accent-blue text-white px-6 py-2.5 rounded-xl font-semibold hover:shadow-lg transition-all w-full sm:w-auto">Registrar Compra</button>
            </div>
          </form>
        </div>
      )}

      <div className="glass-card p-4 sm:p-6 rounded-xl border border-white/10 shadow-xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6 items-end">
          <div className="relative">
            <label className="block text-sm text-text-secondary font-medium mb-1">Desde</label>
            <input
              type="text"
              className="input-field p-2.5 bg-dark-800 border border-white/10 rounded-xl text-text-primary text-sm cursor-pointer w-full"
              value={filters.fechaDesde}
              onClick={() => setShowDesdePicker(!showDesdePicker)}
              readOnly
              placeholder="dd/mm/aaaa"
            />
            {showDesdePicker && (
              <div className="absolute top-full left-0 z-50 mt-2">
                <div className="glass-card p-4 rounded-xl border border-white/10 shadow-xl">
                  <DayPicker
                    locale={es}
                    mode="single"
                    selected={filters.fechaDesde ? new Date(filters.fechaDesde) : undefined}
                    onSelect={(date) => {
                      if (date) {
                        const formattedDate = date.toISOString().split('T')[0];
                        setFilters({...filters, fechaDesde: formattedDate});
                      }
                      setShowDesdePicker(false);
                    }}
                    className="rdp"
                    components={{
                      Chevron: ({ orientation }) =>
                        orientation === 'left'
                          ? <ChevronLeft className="w-4 h-4 text-white" />
                          : <ChevronRight className="w-4 h-4 text-white" />
                    }}
                  />
                </div>
              </div>
            )}
          </div>
          <div className="relative">
            <label className="block text-sm text-text-secondary font-medium mb-1">Hasta</label>
            <input
              type="text"
              className="input-field p-2.5 bg-dark-800 border border-white/10 rounded-xl text-text-primary text-sm cursor-pointer w-full"
              value={filters.fechaHasta}
              onClick={() => setShowHastaPicker(!showHastaPicker)}
              readOnly
              placeholder="dd/mm/aaaa"
            />
            {showHastaPicker && (
              <div className="absolute top-full left-0 z-50 mt-2">
                <div className="glass-card p-4 rounded-xl border border-white/10 shadow-xl">
                  <DayPicker
                    locale={es}
                    mode="single"
                    selected={filters.fechaHasta ? new Date(filters.fechaHasta) : undefined}
                    onSelect={(date) => {
                      if (date) {
                        const formattedDate = date.toISOString().split('T')[0];
                        setFilters({...filters, fechaHasta: formattedDate});
                      }
                      setShowHastaPicker(false);
                    }}
                    className="rdp"
                    components={{
                      Chevron: ({ orientation }) =>
                        orientation === 'left'
                          ? <ChevronLeft className="w-4 h-4 text-white" />
                          : <ChevronRight className="w-4 h-4 text-white" />
                    }}
                  />
                </div>
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm text-text-secondary font-medium mb-1">Medio</label>
            <select className="select-field p-2.5 bg-dark-800 border border-white/10 rounded-xl text-text-primary text-sm w-full" value={filters.medio} onChange={e => setFilters({...filters, medio: e.target.value})}>
              <option value="">Todos</option><option>Transferencia</option><option>Efectivo</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-text-secondary font-medium mb-1">Factura</label>
            <select className="select-field p-2.5 bg-dark-800 border border-white/10 rounded-xl text-text-primary text-sm w-full" value={filters.tipoFactura} onChange={e => setFilters({...filters, tipoFactura: e.target.value})}>
              <option value="">Todas</option><option>A</option><option>B</option><option>C</option>
            </select>
          </div>
          <button onClick={handleFilter} className="btn-secondary bg-dark-800 border border-white/10 px-5 py-2.5 rounded-xl hover:bg-white/10 transition-colors font-medium w-full sm:w-auto">Filtrar</button>
          <button onClick={clearFilter} className="btn-secondary bg-dark-800 border border-white/10 px-5 py-2.5 rounded-xl hover:bg-white/10 transition-colors font-medium w-full sm:w-auto">Limpiar</button>
        </div>

        <DataTable
          columns={columns}
          data={compras}
          loading={loading}
          pagination={{ page, totalPages, onPageChange: setPage }}
          showActions={false}
        />
      </div>
    </div>
  );
}
