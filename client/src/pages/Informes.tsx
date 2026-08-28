import { useEffect, useState } from 'react';
import { DollarSign, CreditCard, Smartphone, Banknote } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useAuth } from '../hooks/useAuth';
import * as api from '../services/api';
import { MetricCard } from '../components/ui/MetricCard';

export default function Informes() {
  const { isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.getInformeResumen();
        setData(res);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatMoney = (val: number) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(val || 0);

  const totalVentas = data?.ventasTotales || 0;
  const totalCompras = data?.totalCompras || 0;
  const rentabilidadMonto = data?.rentabilidad ?? (totalVentas - totalCompras);
  const rentabilidadPorcentaje = totalVentas > 0 ? Math.round((rentabilidadMonto / totalVentas) * 100) : 0;
  const rentColor = rentabilidadPorcentaje >= 0 ? 'text-emerald-400' : 'text-red-400';

  const facturadoData = [
    { name: 'Facturado', value: data?.comprasFacturadas || 0, color: '#4caf87' },
    { name: 'Sin Factura', value: data?.comprasSinFactura || 0, color: '#f0a040' }
  ];

  return (
    <div className="page-container p-6 animate-fade-in text-text-primary">
      <h1 className="page-title text-3xl font-bold bg-gradient-to-r from-accent-purple to-accent-blue bg-clip-text text-transparent mb-8">Informes 2026</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {loading ? (
          Array(4).fill(0).map((_, i) => <div key={i} className="glass-card h-32 rounded-xl animate-pulse"></div>)
        ) : (
          <>
            <MetricCard title="Ventas Totales" value={data?.ventasTotales || 0} prefix="$" icon={DollarSign} color="purple" index={0} />
            <MetricCard title="Efectivo" value={data?.ventasEfectivo || 0} prefix="$" icon={Banknote} color="emerald" index={1} />
            <MetricCard title="Billeteras V." value={data?.ventasBilleteras || 0} prefix="$" icon={Smartphone} color="cyan" index={2} />
            <MetricCard title="Tarjetas" value={data?.ventasTarjetas || 0} prefix="$" icon={CreditCard} color="blue" index={3} />
          </>
        )}
      </div>

      {isAdmin && (
        <div className="glass-card p-6 rounded-xl mb-8 flex flex-col md:flex-row justify-between items-center bg-gradient-to-r from-dark-800 to-dark-900 border-l-4 border-accent-purple">
          <div>
            <h2 className="text-xl font-semibold mb-2">Análisis de Rentabilidad</h2>
            <div className="flex gap-8 text-sm text-text-secondary">
              <div>Costo: <span className="font-medium text-text-primary">{formatMoney(totalCompras)}</span></div>
              <div>Rentabilidad: <span className={`font-medium ${rentColor}`}>{formatMoney(rentabilidadMonto)}</span></div>
            </div>
          </div>
          <div className="mt-4 md:mt-0 text-right">
            <span className={`text-4xl font-bold ${rentColor}`}>
              {rentabilidadPorcentaje > 0 ? '+' : ''}{rentabilidadPorcentaje}%
            </span>
          </div>
        </div>
      )}

      <div className="glass-card p-6 rounded-xl mb-8">
        <h2 className="section-title text-xl font-semibold mb-6">Tendencia Mensual</h2>
        {loading ? (
          <div className="h-80 animate-pulse bg-glass-bg rounded"></div>
        ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.ventasPorMes || []}>
                <defs>
                  <linearGradient id="colorTarjetas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#5c8cfc" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#5c8cfc" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorBilleteras" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4caf87" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#4caf87" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorEfectivo" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f0a040" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f0a040" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                <XAxis dataKey="mes" stroke="#8888aa" />
                <YAxis stroke="#8888aa" tickFormatter={(val) => `$${val/1000}k`} />
                <Tooltip contentStyle={{ backgroundColor: '#12122a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="tarjetas" stroke="#5c8cfc" fillOpacity={1} fill="url(#colorTarjetas)" />
                <Area type="monotone" dataKey="billeteras" stroke="#4caf87" fillOpacity={1} fill="url(#colorBilleteras)" />
                <Area type="monotone" dataKey="efectivo" stroke="#f0a040" fillOpacity={1} fill="url(#colorEfectivo)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="glass-card p-6 rounded-xl">
        <h2 className="section-title text-xl font-semibold mb-6">Compras y Facturación</h2>
        <div className="flex flex-col md:flex-row gap-8 items-center">
          <div className="flex-1 space-y-4 w-full">
            <div className="p-4 bg-dark-800 rounded-lg border border-glass-border">
              <p className="text-sm text-text-secondary mb-1">Total Compras</p>
              <p className="text-2xl font-bold">{formatMoney(data?.totalCompras || 0)}</p>
            </div>
            <div className="p-4 bg-dark-800 rounded-lg border border-glass-border flex justify-between items-center">
              <div>
                <p className="text-sm text-text-secondary mb-1">Facturado (A + B)</p>
                <p className="text-xl font-medium text-emerald-400">{formatMoney(data?.comprasFacturadas || 0)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-text-secondary mb-1">Sin Factura (C)</p>
                <p className="text-xl font-medium text-amber-400">{formatMoney(data?.comprasSinFactura || 0)}</p>
              </div>
            </div>
          </div>
          <div className="flex-1 h-64 w-full">
            {!loading && (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={facturadoData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {facturadoData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#12122a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} formatter={(value: any) => formatMoney(Number(value || 0))} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
