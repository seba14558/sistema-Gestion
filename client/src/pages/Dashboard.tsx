import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, CreditCard, Smartphone, Banknote, ShoppingCart, Database, PieChart as PieChartIcon } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useAuth } from '../hooks/useAuth';
import * as api from '../services/api';
import { MetricCard } from '../components/ui/MetricCard';

const COLORS = ['#7c5cfc', '#5c8cfc', '#4caf87', '#f0a040'];

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.getInformeResumen();
        setData(res);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const quickActions = [
    { title: 'Ventas', icon: DollarSign, color: 'text-accent-purple', path: '/ventas' },
    { title: 'Compras', icon: ShoppingCart, color: 'text-accent-blue', path: '/compras' },
    { title: 'Base de Datos', icon: Database, color: 'text-success', path: '/database' },
    { title: 'Informes', icon: PieChartIcon, color: 'text-warning', path: '/informes' },
  ];

  return (
    <div className="page-container animate-fade-in text-text-primary p-6">
      <div className="mb-8">
        <h1 className="page-title text-3xl font-bold bg-gradient-to-r from-accent-purple to-accent-blue bg-clip-text text-transparent">Panel Principal</h1>
        <p className="text-text-secondary mt-1">Bienvenido, {user?.username || 'Usuario'}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {loading ? (
          Array(4).fill(0).map((_, i) => <div key={i} className="glass-card h-32 rounded-xl animate-pulse"></div>)
        ) : (
          <>
            <MetricCard title="Total Ventas" value={data?.ventasTotales || 0} prefix="$" icon={DollarSign} color="purple" index={0} />
            <MetricCard title="Tarjetas" value={data?.ventasTarjetas || 0} prefix="$" icon={CreditCard} color="blue" index={1} />
            <MetricCard title="Billeteras" value={data?.ventasBilleteras || 0} prefix="$" icon={Smartphone} color="cyan" index={2} />
            <MetricCard title="Efectivo" value={data?.ventasEfectivo || 0} prefix="$" icon={Banknote} color="emerald" index={3} />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="glass-card p-6 rounded-xl lg:col-span-2">
          <h2 className="section-title text-xl font-semibold mb-6">Ventas Mensuales</h2>
          {loading ? (
            <div className="h-64 animate-pulse bg-glass-bg rounded"></div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.chartDataMensual || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                  <XAxis dataKey="name" stroke="#8888aa" />
                  <YAxis stroke="#8888aa" tickFormatter={(val) => `$${val/1000}k`} />
                  <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: '#12122a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                  <Bar dataKey="tarjetas" stackId="a" fill="#5c8cfc" name="Tarjetas" />
                  <Bar dataKey="billeteras" stackId="a" fill="#4caf87" name="Billeteras" />
                  <Bar dataKey="efectivo" stackId="a" fill="#f0a040" name="Efectivo" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="glass-card p-6 rounded-xl">
          <h2 className="section-title text-xl font-semibold mb-6">Distribución</h2>
          {loading ? (
            <div className="h-64 animate-pulse bg-glass-bg rounded"></div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data?.distribucionPagos || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {(data?.distribucionPagos || []).map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#12122a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickActions.map((action, idx) => (
          <button
            key={idx}
            onClick={() => navigate(action.path)}
            className="glass-card-hover p-6 rounded-xl flex flex-col items-center justify-center gap-3 transition-transform hover:-translate-y-1"
          >
            <div className={`p-3 rounded-full bg-glass-bg ${action.color}`}>
              <action.icon size={28} />
            </div>
            <span className="font-medium text-text-primary">{action.title}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
