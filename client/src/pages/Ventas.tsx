import { useEffect, useState } from 'react';
import { CreditCard, Smartphone, Banknote } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import * as api from '../services/api';
import type { VentasResumen } from '../types';
import { AlertDialog } from '../components/ui/AlertDialog';

export default function Ventas() {
  const { isAdmin } = useAuth();
  const [resumen, setResumen] = useState<VentasResumen | null>(null);
  const [loading, setLoading] = useState(true);
  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [anio, setAnio] = useState(new Date().getFullYear());

  const today = new Date().toISOString().split('T')[0];

  const [formTarjeta, setFormTarjeta] = useState({ fecha: today, medio: 'VISA CREDITO', monto: '' });
  const [formBilletera, setFormBilletera] = useState({ fecha: today, medio: 'Mercado Pago', monto: '' });
  const [formEfectivo, setFormEfectivo] = useState({ fecha: today, medio: 'Efectivo', monto: '' });

  const [alertDialog, setAlertDialog] = useState({ isOpen: false, title: '', message: '', type: 'success' as 'success' | 'error' });

  const fetchResumen = async () => {
    setLoading(true);
    try {
      const data = await api.getVentasResumen(mes, anio);
      setResumen(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumen();
  }, [mes, anio]);

  const formatMoney = (val: number) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(val || 0);

  const handleSubmit = async (tipo: string, data: any) => {
    try {
      const formattedData = { ...data, monto: Number(data.monto) };
      
      if (tipo === 'tarjeta') await api.registrarTarjeta(formattedData);
      if (tipo === 'billetera') await api.registrarBilletera(formattedData);
      if (tipo === 'efectivo') await api.registrarEfectivo(formattedData);
      
      setAlertDialog({ isOpen: true, title: 'Venta Registrada', message: 'La venta se ha registrado exitosamente', type: 'success' });
      fetchResumen();
      setFormTarjeta({ fecha: today, medio: 'VISA CREDITO', monto: '' });
      setFormBilletera({ fecha: today, medio: 'Mercado Pago', monto: '' });
      setFormEfectivo({ fecha: today, medio: 'Efectivo', monto: '' });
    } catch (error) {
      setAlertDialog({ isOpen: true, title: 'Error', message: 'Error al registrar la venta', type: 'error' });
    }
  };

  const totalGeneral = resumen?.totalGeneral || 0;
  const totalTarjetas = resumen?.totalTarjetas || 0;
  const totalBilleteras = resumen?.totalBilleteras || 0;
  const totalEfectivo = resumen?.totalEfectivo || 0;

  return (
    <div className="page-container p-6 animate-fade-in text-text-primary">
      <h1 className="page-title text-3xl font-bold bg-gradient-to-r from-accent-purple to-accent-blue bg-clip-text text-transparent mb-8">Registro de Ventas</h1>

      <div className="flex flex-col lg:flex-row gap-6">
        {isAdmin && (
          <div className="lg:w-2/3 space-y-6">
            {/* Tarjetas */}
            <div className="glass-card p-6 rounded-xl border border-white/10 shadow-xl">
              <div className="flex items-center gap-3 mb-4 text-accent-blue">
                <CreditCard size={24} />
                <h2 className="text-xl font-semibold text-text-primary">Cobro Tarjetas</h2>
              </div>
              <form onSubmit={(e) => { e.preventDefault(); handleSubmit('tarjeta', formTarjeta); }} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div className="space-y-1">
                  <label className="text-sm text-text-secondary font-medium">Fecha</label>
                  <input 
                    type="date" 
                    required 
                    className="input-field w-full p-2.5 bg-dark-800 border border-white/10 rounded-xl text-text-primary text-sm focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20" 
                    value={formTarjeta.fecha} 
                    onChange={(e) => setFormTarjeta({ ...formTarjeta, fecha: e.target.value })} 
                  />
                </div>
                <div className="space-y-1 md:col-span-1">
                  <label className="text-sm text-text-secondary font-medium">Tarjeta</label>
                  <select required className="select-field w-full p-2.5 bg-dark-800 border border-white/10 rounded-xl text-text-primary text-sm" value={formTarjeta.medio} onChange={(e) => setFormTarjeta({ ...formTarjeta, medio: e.target.value })}>
                    <option>VISA CREDITO</option><option>VISA DEBITO</option><option>NARANJA</option><option>DATA</option><option>MASTERCARD</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-text-secondary font-medium">Monto</label>
                  <input type="number" required min="0" step="0.01" className="input-field w-full p-2.5 bg-dark-800 border border-white/10 rounded-xl text-text-primary text-sm" placeholder="$ 0,00" value={formTarjeta.monto} onChange={(e) => setFormTarjeta({ ...formTarjeta, monto: e.target.value })} />
                </div>
                <button type="submit" className="btn-primary p-2.5 bg-gradient-to-r from-blue-600 to-accent-blue text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/20 transition-all">Registrar</button>
              </form>
            </div>

            {/* Billeteras */}
            <div className="glass-card p-6 rounded-xl border border-white/10 shadow-xl">
              <div className="flex items-center gap-3 mb-4 text-emerald-400">
                <Smartphone size={24} />
                <h2 className="text-xl font-semibold text-text-primary">Cobro Billeteras Virtuales</h2>
              </div>
              <form onSubmit={(e) => { e.preventDefault(); handleSubmit('billetera', formBilletera); }} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div className="space-y-1">
                  <label className="text-sm text-text-secondary font-medium">Fecha</label>
                  <input 
                    type="date" 
                    required 
                    className="input-field w-full p-2.5 bg-dark-800 border border-white/10 rounded-xl text-text-primary text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20" 
                    value={formBilletera.fecha} 
                    onChange={(e) => setFormBilletera({ ...formBilletera, fecha: e.target.value })} 
                  />
                </div>
                <div className="space-y-1 md:col-span-1">
                  <label className="text-sm text-text-secondary font-medium">Medio</label>
                  <select required className="select-field w-full p-2.5 bg-dark-800 border border-white/10 rounded-xl text-text-primary text-sm" value={formBilletera.medio} onChange={(e) => setFormBilletera({ ...formBilletera, medio: e.target.value })}>
                    <option>Personal Pay</option><option>Mercado Pago</option><option>Naranja</option><option>Brubank</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-text-secondary font-medium">Monto</label>
                  <input type="number" required min="0" step="0.01" className="input-field w-full p-2.5 bg-dark-800 border border-white/10 rounded-xl text-text-primary text-sm" placeholder="$ 0,00" value={formBilletera.monto} onChange={(e) => setFormBilletera({ ...formBilletera, monto: e.target.value })} />
                </div>
                <button type="submit" className="btn-primary p-2.5 bg-gradient-to-r from-emerald-600 to-teal-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-emerald-500/20 transition-all">Registrar</button>
              </form>
            </div>

            {/* Efectivo */}
            <div className="glass-card p-6 rounded-xl border border-white/10 shadow-xl">
              <div className="flex items-center gap-3 mb-4 text-amber-400">
                <Banknote size={24} />
                <h2 className="text-xl font-semibold text-text-primary">Cobro Efectivo</h2>
              </div>
              <form onSubmit={(e) => { e.preventDefault(); handleSubmit('efectivo', formEfectivo); }} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div className="space-y-1">
                  <label className="text-sm text-text-secondary font-medium">Fecha</label>
                  <input 
                    type="date" 
                    required 
                    className="input-field w-full p-2.5 bg-dark-800 border border-white/10 rounded-xl text-text-primary text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20" 
                    value={formEfectivo.fecha} 
                    onChange={(e) => setFormEfectivo({ ...formEfectivo, fecha: e.target.value })} 
                  />
                </div>
                <div className="space-y-1 md:col-span-1">
                  <label className="text-sm text-text-secondary font-medium">Medio</label>
                  <select required className="select-field w-full p-2.5 bg-dark-800 border border-white/10 rounded-xl text-text-primary text-sm" value={formEfectivo.medio} onChange={(e) => setFormEfectivo({ ...formEfectivo, medio: e.target.value })}>
                    <option>Efectivo</option><option>GO Cuota</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-text-secondary font-medium">Monto</label>
                  <input type="number" required min="0" step="0.01" className="input-field w-full p-2.5 bg-dark-800 border border-white/10 rounded-xl text-text-primary text-sm" placeholder="$ 0,00" value={formEfectivo.monto} onChange={(e) => setFormEfectivo({ ...formEfectivo, monto: e.target.value })} />
                </div>
                <button type="submit" className="btn-primary p-2.5 bg-gradient-to-r from-amber-600 to-orange-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-amber-500/20 transition-all">Registrar</button>
              </form>
            </div>
          </div>
        )}

        <div className={`lg:w-1/3 ${!isAdmin ? 'lg:w-full' : ''}`}>
          <div className="glass-card p-6 rounded-xl sticky top-6 border border-white/10 shadow-xl">
            <h2 className="text-xl font-semibold text-text-primary mb-4">Resumen del Período</h2>
            <div className="flex gap-2 mb-6">
              <select className="select-field flex-1 p-2.5 bg-dark-800 border border-white/10 rounded-xl text-text-primary text-sm" value={mes} onChange={(e) => setMes(Number(e.target.value))}>
                {Array.from({length: 12}, (_, i) => (<option key={i+1} value={i+1}>{new Date(0, i).toLocaleString('es', {month: 'long'})}</option>))}
              </select>
              <select className="select-field flex-1 p-2.5 bg-dark-800 border border-white/10 rounded-xl text-text-primary text-sm" value={anio} onChange={(e) => setAnio(Number(e.target.value))}>
                {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>

            {loading ? (
              <div className="space-y-4 animate-pulse"><div className="h-10 bg-glass-bg rounded-xl"></div><div className="h-32 bg-glass-bg rounded-xl"></div></div>
            ) : (
              <div className="space-y-6 text-text-primary">
                <div>
                  <p className="text-sm text-text-secondary font-medium">Total Ventas</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-accent-purple to-accent-blue bg-clip-text text-transparent">{formatMoney(totalGeneral)}</p>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center"><span className="text-text-secondary text-sm">Tarjetas</span><span className="font-semibold text-accent-blue">{formatMoney(totalTarjetas)}</span></div>
                  <div className="h-2 bg-dark-800 rounded-full overflow-hidden"><div className="h-full bg-accent-blue" style={{width: `${totalGeneral ? (totalTarjetas/totalGeneral)*100 : 0}%`}}></div></div>
                  
                  <div className="flex justify-between items-center mt-2"><span className="text-text-secondary text-sm">Billeteras</span><span className="font-semibold text-emerald-400">{formatMoney(totalBilleteras)}</span></div>
                  <div className="h-2 bg-dark-800 rounded-full overflow-hidden"><div className="h-full bg-emerald-500" style={{width: `${totalGeneral ? (totalBilleteras/totalGeneral)*100 : 0}%`}}></div></div>
                  
                  <div className="flex justify-between items-center mt-2"><span className="text-text-secondary text-sm">Efectivo</span><span className="font-semibold text-amber-400">{formatMoney(totalEfectivo)}</span></div>
                  <div className="h-2 bg-dark-800 rounded-full overflow-hidden"><div className="h-full bg-amber-500" style={{width: `${totalGeneral ? (totalEfectivo/totalGeneral)*100 : 0}%`}}></div></div>
                </div>

                <div className="pt-4 border-t border-white/10">
                  <h3 className="font-semibold text-sm mb-3">Tope Billeteras</h3>
                  <div className="space-y-2 text-sm">
                    {resumen?.topeBilleteras && Object.entries(resumen.topeBilleteras).map(([key, val]) => (
                      <div key={key} className="flex justify-between items-center">
                        <span className="text-text-secondary capitalize">{key.replace(/([A-Z])/g, ' $1')} <span className="text-xs text-gray-500">({val.operaciones} ops)</span></span>
                        <span className="font-medium">{formatMoney(val.total)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <AlertDialog
        isOpen={alertDialog.isOpen}
        onClose={() => setAlertDialog({ ...alertDialog, isOpen: false })}
        title={alertDialog.title}
        message={alertDialog.message}
        type={alertDialog.type}
      />
    </div>
  );
}
