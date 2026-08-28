import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Database, 
  BarChart3, 
  LogOut, 
  X
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const { user, logout, isAdmin } = useAuth();

  const links = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/ventas', label: 'Ventas', icon: ShoppingCart },
    { to: '/compras', label: 'Compras', icon: Package },
    { to: '/database', label: 'Base de Datos', icon: Database, requireAdmin: true },
    { to: '/informes', label: 'Informes', icon: BarChart3, requireAdmin: true },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-screen w-[280px] bg-dark-800/90 backdrop-blur-xl border-r border-white/10
        flex flex-col z-50 transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-accent-purple to-accent-blue bg-clip-text text-transparent">
            Sistema de Gestión
          </h1>
          <button 
            className="lg:hidden p-2 text-gray-400 hover:text-white"
            onClick={() => setIsOpen(false)}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
          {links.map((link) => {
            if (link.requireAdmin && !isAdmin) return null;
            
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) => `
                  flex items-center px-4 py-3 rounded-xl transition-all duration-200
                  ${isActive 
                    ? 'bg-accent-purple/10 text-accent-purple border-l-4 border-accent-purple font-medium shadow-[0_0_20px_rgba(124,92,252,0.1)]' 
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }
                `}
                onClick={() => setIsOpen(false)}
              >
                <Icon className="w-5 h-5 mr-3" />
                {link.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-6 border-t border-white/10">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-purple to-accent-blue flex items-center justify-center text-white font-bold mr-3 shadow-lg">
              {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <p className="text-sm font-medium text-white">{user?.username || 'Usuario'}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full ${isAdmin ? 'bg-accent-purple/20 text-accent-purple' : 'bg-accent-blue/20 text-accent-blue'}`}>
                {isAdmin ? 'Admin' : 'Cliente'}
              </span>
            </div>
          </div>
          
          <button 
            onClick={logout}
            className="flex items-center w-full px-4 py-2.5 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Cerrar Sesión
          </button>
        </div>
      </aside>
    </>
  );
};
