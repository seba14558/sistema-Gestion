import React, { useState, useEffect } from 'react';
import { createUser, getUsers, deleteUser } from '../services/api';
import type { User } from '../types';
import { UserPlus, Trash2, Shield, User as UserIcon } from 'lucide-react';

export const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'CLIENTE'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await getUsers();
      setUsers(data);
    } catch (error) {
      console.error('Error loading users:', error);
      setError('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.username || !formData.password) {
      setError('Usuario y contraseña son requeridos');
      return;
    }

    try {
      await createUser(formData.username, formData.password, formData.role);
      setSuccess('Usuario creado exitosamente');
      setFormData({ username: '', password: '', role: 'CLIENTE' });
      setShowForm(false);
      loadUsers();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      console.error('Error creating user:', error);
      setError(error.response?.data?.error || 'Error al crear usuario');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Está seguro de eliminar este usuario?')) {
      return;
    }

    try {
      await deleteUser(id);
      setSuccess('Usuario eliminado exitosamente');
      loadUsers();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      console.error('Error deleting user:', error);
      setError(error.response?.data?.error || 'Error al eliminar usuario');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Cargando usuarios...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Gestión de Usuarios</h1>
          <p className="text-gray-400 mt-1 text-sm sm:text-base">Administrar usuarios del sistema</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center justify-center px-4 py-2 bg-accent-purple hover:bg-accent-purple/80 text-white rounded-lg transition-colors w-auto sm:w-auto"
        >
          <UserPlus className="w-5 h-5 mr-2" />
          <span className="hidden sm:inline">Nuevo Usuario</span>
          <span className="sm:hidden">Nuevo</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400">
          {success}
        </div>
      )}

      {showForm && (
        <div className="p-4 sm:p-6 bg-dark-800/50 backdrop-blur-xl border border-white/10 rounded-xl">
          <h2 className="text-lg sm:text-xl font-semibold text-white mb-4">Crear Nuevo Usuario</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Usuario
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full px-4 py-2 bg-dark-900/50 border border-white/10 rounded-lg text-white focus:outline-none focus:border-accent-purple"
                placeholder="Nombre de usuario"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Contraseña
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-2 bg-dark-900/50 border border-white/10 rounded-lg text-white focus:outline-none focus:border-accent-purple"
                placeholder="Contraseña"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Rol
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-4 py-2 bg-dark-900/50 border border-white/10 rounded-lg text-white focus:outline-none focus:border-accent-purple"
              >
                <option value="CLIENTE">Cliente</option>
                <option value="ADMIN">Administrador</option>
              </select>
            </div>

            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-accent-purple hover:bg-accent-purple/80 text-white rounded-lg transition-colors"
              >
                Crear Usuario
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-dark-800/50 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-4 sm:px-6 py-4 text-left text-xs sm:text-sm font-semibold text-gray-300">Usuario</th>
                <th className="px-4 sm:px-6 py-4 text-left text-xs sm:text-sm font-semibold text-gray-300">Rol</th>
                <th className="hidden sm:table-cell px-6 py-4 text-left text-sm font-semibold text-gray-300">Fecha de Creación</th>
                <th className="px-4 sm:px-6 py-4 text-right text-xs sm:text-sm font-semibold text-gray-300">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-400">
                    No hay usuarios registrados
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="px-4 sm:px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-purple to-accent-blue flex items-center justify-center text-white font-bold mr-3 flex-shrink-0">
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-white font-medium truncate">{user.username}</span>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.role === 'ADMIN' 
                          ? 'bg-accent-purple/20 text-accent-purple' 
                          : 'bg-accent-blue/20 text-accent-blue'
                      }`}>
                        {user.role === 'ADMIN' ? (
                          <>
                            <Shield className="w-3 h-3 mr-1" />
                            Admin
                          </>
                        ) : (
                          <>
                            <UserIcon className="w-3 h-3 mr-1" />
                            Cliente
                          </>
                        )}
                      </span>
                    </td>
                    <td className="hidden sm:table-cell px-6 py-4 text-gray-400 text-sm">
                      {new Date().toLocaleDateString('es-AR')}
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Eliminar usuario"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
