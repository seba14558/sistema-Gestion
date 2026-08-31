import { useState, useEffect } from 'react';
import { Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import * as api from '../services/api';
import { DataTable } from '../components/ui/DataTable';
import { Modal } from '../components/ui/Modal';
import { formatDate } from '../types';
import { DayPicker } from 'react-day-picker';
import { es } from 'date-fns/locale';

export default function Database() {
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'billeteras'|'efectivo'|'tarjetas'>('billeteras');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [filters, setFilters] = useState({ fechaDesde: '', fechaHasta: '', medio: '', montoMin: '', montoMax: '', search: '' });
  
  // Date picker state
  const [showDesdePicker, setShowDesdePicker] = useState(false);
  const [showHastaPicker, setShowHastaPicker] = useState(false);
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modals
  const [editItem, setEditItem] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const fetchRecords = async (targetPage = page, customFilters = filters) => {
    setLoading(true);
    try {
      const cleanedParams: any = { page: targetPage, limit: 10 };
      if (customFilters.fechaDesde) cleanedParams.fechaDesde = customFilters.fechaDesde;
      if (customFilters.fechaHasta) cleanedParams.fechaHasta = customFilters.fechaHasta;
      if (customFilters.medio && customFilters.medio !== 'Todos') cleanedParams.medio = customFilters.medio;
      if (customFilters.montoMin) cleanedParams.montoMin = customFilters.montoMin;
      if (customFilters.montoMax) cleanedParams.montoMax = customFilters.montoMax;
      if (customFilters.search) cleanedParams.search = customFilters.search;

      const res = await api.getDBRecords(activeTab, cleanedParams);
      setData(res.data || []);
      setTotalPages(res.totalPages || 1);
    } catch (error) {
      console.error('Error fetching records:', error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const defaultFilters = { fechaDesde: '', fechaHasta: '', medio: '', montoMin: '', montoMax: '', search: '' };
    setFilters(defaultFilters);
    setPage(1);
    fetchRecords(1, defaultFilters);
  }, [activeTab]);

  useEffect(() => {
    fetchRecords(page, filters);
  }, [page]);

  const handleFilter = () => {
    setPage(1);
    fetchRecords(1, filters);
  };

  const clearFilter = () => {
    const emptyFilters = { fechaDesde: '', fechaHasta: '', medio: '', montoMin: '', montoMax: '', search: '' };
    setFilters(emptyFilters);
    setPage(1);
    fetchRecords(1, emptyFilters);
  };

  const handleExport = async () => {
    try {
      const blob = await api.exportDB(activeTab);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${activeTab}.csv`);
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      alert('Error al exportar');
    }
  };

  const saveEdit = async () => {
    try {
      await api.updateDBRecord(activeTab, editItem.id, { fecha: editItem.fecha, medio: editItem.medio, monto: Number(editItem.monto) });
      setEditItem(null);
      fetchRecords(page, filters);
    } catch (error) {
      alert('Error al actualizar');
    }
  };

  const confirmDelete = async () => {
    if (deleteId === null) return;
    try {
      await api.deleteDBRecord(activeTab, deleteId);
      setDeleteId(null);
      fetchRecords(page, filters);
    } catch (error) {
      alert('Error al eliminar');
    }
  };

  const columns = [
    { key: 'fecha', label: 'Fecha', render: (row: any) => formatDate(row.fecha) },
    { key: 'medio', label: 'Medio de Pago' },
    { key: 'monto', label: 'Monto', render: (row: any) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(row.monto) }
  ];

  const getMediosOptions = () => {
    if (activeTab === 'billeteras') return ['Personal Pay', 'Mercado Pago', 'Naranja', 'Brubank'];
    if (activeTab === 'efectivo') return ['Efectivo', 'GO Cuota'];
    return ['VISA CREDITO', 'VISA DEBITO', 'NARANJA', 'DATA', 'MASTERCARD'];
  };

  return (
    <div className="page-container p-6 animate-fade-in text-text-primary">
      <div className="flex justify-between items-center mb-8">
        <h1 className="page-title text-3xl font-bold bg-gradient-to-r from-accent-purple to-accent-blue bg-clip-text text-transparent">Base de Datos</h1>
        {isAdmin && (
          <button onClick={handleExport} className="btn-secondary flex items-center gap-2 bg-dark-800 border border-white/10 px-4 py-2 rounded-xl hover:bg-white/10 transition-colors font-medium">
            <Download size={18} /> Exportar CSV
          </button>
        )}
      </div>

      <div className="flex gap-4 mb-6">
        {(['billeteras', 'efectivo', 'tarjetas'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-2.5 rounded-full capitalize font-semibold transition-all ${activeTab === tab ? 'bg-gradient-to-r from-accent-purple to-accent-blue text-white shadow-lg shadow-accent-purple/20' : 'bg-dark-800 text-text-secondary hover:bg-white/5 border border-white/5'}`}>
            {tab === 'billeteras' ? 'Billeteras Virtuales' : tab}
          </button>
        ))}
      </div>

      <div className="glass-card p-6 rounded-xl border border-white/10 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6 items-end">
          <div className="relative">
            <label className="block text-sm text-text-secondary font-medium mb-1">Desde</label>
            <input 
              type="text" 
              className="input-field w-full p-2.5 bg-dark-800 border border-white/10 rounded-xl text-text-primary text-sm cursor-pointer" 
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
              className="input-field w-full p-2.5 bg-dark-800 border border-white/10 rounded-xl text-text-primary text-sm cursor-pointer" 
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
          <div><label className="block text-sm text-text-secondary font-medium mb-1">Medio</label>
            <select className="select-field w-full p-2.5 bg-dark-800 border border-white/10 rounded-xl text-text-primary text-sm" value={filters.medio} onChange={e => setFilters({...filters, medio: e.target.value})}>
              <option value="">Todos</option>{getMediosOptions().map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div><label className="block text-sm text-text-secondary font-medium mb-1">Min $</label><input type="number" className="input-field w-full p-2.5 bg-dark-800 border border-white/10 rounded-xl text-text-primary text-sm" placeholder="0" value={filters.montoMin} onChange={e => setFilters({...filters, montoMin: e.target.value})} /></div>
          <div><label className="block text-sm text-text-secondary font-medium mb-1">Max $</label><input type="number" className="input-field w-full p-2.5 bg-dark-800 border border-white/10 rounded-xl text-text-primary text-sm" placeholder="Sin límite" value={filters.montoMax} onChange={e => setFilters({...filters, montoMax: e.target.value})} /></div>
          <div className="flex gap-2">
            <button onClick={handleFilter} className="btn-primary flex-1 bg-gradient-to-r from-accent-purple to-accent-blue text-white py-2.5 rounded-xl font-semibold hover:shadow-lg transition-all">Filtrar</button>
            <button onClick={clearFilter} className="btn-secondary flex-1 bg-dark-800 border border-white/10 py-2.5 rounded-xl font-semibold hover:bg-white/10">Limpiar</button>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={data}
          loading={loading}
          pagination={{ page, totalPages, onPageChange: setPage }}
          showActions={isAdmin}
          onEdit={setEditItem}
          onDelete={(row: any) => setDeleteId(row.id)}
        />
      </div>

      <Modal isOpen={!!editItem} onClose={() => setEditItem(null)} title="Editar Registro">
        {editItem && (
          <div className="space-y-4">
            <div><label className="block text-sm font-medium mb-1">Fecha</label><input type="date" className="input-field w-full p-2.5 bg-dark-800 border border-white/10 rounded-xl text-text-primary text-sm" value={editItem.fecha ? editItem.fecha.split('T')[0] : ''} onChange={e => setEditItem({...editItem, fecha: e.target.value})} /></div>
            <div><label className="block text-sm font-medium mb-1">Medio</label>
              <select className="select-field w-full p-2.5 bg-dark-800 border border-white/10 rounded-xl text-text-primary text-sm" value={editItem.medio} onChange={e => setEditItem({...editItem, medio: e.target.value})}>
                {getMediosOptions().map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div><label className="block text-sm font-medium mb-1">Monto</label><input type="number" className="input-field w-full p-2.5 bg-dark-800 border border-white/10 rounded-xl text-text-primary text-sm" value={editItem.monto} onChange={e => setEditItem({...editItem, monto: e.target.value})} /></div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setEditItem(null)} className="btn-secondary px-4 py-2 border border-white/10 rounded-xl">Cancelar</button>
              <button onClick={saveEdit} className="btn-primary px-4 py-2 bg-gradient-to-r from-accent-purple to-accent-blue text-white rounded-xl">Guardar</button>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={deleteId !== null} onClose={() => setDeleteId(null)} title="Confirmar Eliminación">
        <p className="mb-6 text-gray-300">¿Estás seguro de que deseas eliminar este registro? Esta acción no se puede deshacer.</p>
        <div className="flex justify-end gap-3">
          <button onClick={() => setDeleteId(null)} className="btn-secondary px-4 py-2 border border-white/10 rounded-xl">Cancelar</button>
          <button onClick={confirmDelete} className="btn-danger px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl">Eliminar</button>
        </div>
      </Modal>
    </div>
  );
}
