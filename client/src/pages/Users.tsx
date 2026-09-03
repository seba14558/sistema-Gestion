import React, { useState, useEffect } from 'react';
import { createUser, getUsers, deleteUser } from '../services/api';
import type { User } from '../types';
import {
  UserPlus,
  Trash2,
  Shield,
  User as UserIcon,
  X,
  AlertTriangle
} from 'lucide-react';

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

  // Estados para el modal de eliminación
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  // Cargar usuarios
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

  // Crear usuario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError('');
    setSuccess('');

    if (!formData.username || !formData.password) {
      setError('Usuario y contraseña son requeridos');
      return;
    }

    try {
      await createUser(
        formData.username,
        formData.password,
        formData.role
      );

      setSuccess('Usuario creado exitosamente');

      setFormData({
        username: '',
        password: '',
        role: 'CLIENTE'
      });

      setShowForm(false);

      loadUsers();

      setTimeout(() => {
        setSuccess('');
      }, 3000);

    } catch (error: any) {
      console.error('Error creating user:', error);

      setError(
        error.response?.data?.error ||
        'Error al crear usuario'
      );
    }
  };

  // Abrir modal para eliminar
  const handleDelete = (id: number) => {
    setUserToDelete(id);
    setShowDeleteModal(true);
  };

  // Cerrar modal
  const closeDeleteModal = () => {
    if (deleting) return;

    setShowDeleteModal(false);
    setUserToDelete(null);
  };

  // Confirmar eliminación
  const confirmDelete = async () => {
    if (userToDelete === null) return;

    try {
      setDeleting(true);
      setError('');

      await deleteUser(userToDelete);

      setSuccess('Usuario eliminado exitosamente');

      setShowDeleteModal(false);
      setUserToDelete(null);

      await loadUsers();

      setTimeout(() => {
        setSuccess('');
      }, 3000);

    } catch (error: any) {
      console.error('Error deleting user:', error);

      setError(
        error.response?.data?.error ||
        'Error al eliminar usuario'
      );

    } finally {
      setDeleting(false);
    }
  };

  // Pantalla de carga
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">
          Cargando usuarios...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* ENCABEZADO */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            Gestión de Usuarios
          </h1>

          <p className="text-gray-400 mt-1 text-sm sm:text-base">
            Administrar usuarios del sistema
          </p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center justify-center px-4 py-2 bg-accent-purple hover:bg-accent-purple/80 text-white rounded-lg transition-colors w-auto sm:w-auto"
        >
          <UserPlus className="w-5 h-5 mr-2" />

          <span className="hidden sm:inline">
            Nuevo Usuario
          </span>

          <span className="sm:hidden">
            Nuevo
          </span>
        </button>
      </div>


      {/* MENSAJE DE ERROR */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
          {error}
        </div>
      )}


      {/* MENSAJE DE ÉXITO */}
      {success && (
        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400">
          {success}
        </div>
      )}


      {/* FORMULARIO */}
      {showForm && (
        <div className="p-4 sm:p-6 bg-dark-800/50 backdrop-blur-xl border border-white/10 rounded-xl">

          <h2 className="text-lg sm:text-xl font-semibold text-white mb-4">
            Crear Nuevo Usuario
          </h2>

          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >

            {/* USUARIO */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Usuario
              </label>

              <input
                type="text"
                value={formData.username}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    username: e.target.value
                  })
                }
                className="w-full px-4 py-2 bg-dark-900/50 border border-white/10 rounded-lg text-white focus:outline-none focus:border-accent-purple"
                placeholder="Nombre de usuario"
              />
            </div>


            {/* CONTRASEÑA */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Contraseña
              </label>

              <input
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    password: e.target.value
                  })
                }
                className="w-full px-4 py-2 bg-dark-900/50 border border-white/10 rounded-lg text-white focus:outline-none focus:border-accent-purple"
                placeholder="Contraseña"
              />
            </div>


            {/* ROL */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Rol
              </label>

              <select
                value={formData.role}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    role: e.target.value
                  })
                }
                className="w-full px-4 py-2 bg-dark-900/50 border border-white/10 rounded-lg text-white focus:outline-none focus:border-accent-purple"
              >
                <option value="CLIENTE">
                  Cliente
                </option>

                <option value="ADMIN">
                  Administrador
                </option>
              </select>
            </div>


            {/* BOTONES DEL FORMULARIO */}
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


      {/* TABLA DE USUARIOS */}
      <div className="bg-dark-800/50 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">

        <div className="overflow-x-auto">

          <table className="w-full min-w-[600px]">

            <thead>
              <tr className="border-b border-white/10">

                <th className="px-4 sm:px-6 py-4 text-left text-xs sm:text-sm font-semibold text-gray-300">
                  Usuario
                </th>

                <th className="px-4 sm:px-6 py-4 text-left text-xs sm:text-sm font-semibold text-gray-300">
                  Rol
                </th>

                <th className="hidden sm:table-cell px-6 py-4 text-left text-sm font-semibold text-gray-300">
                  Fecha de Creación
                </th>

                <th className="px-4 sm:px-6 py-4 text-right text-xs sm:text-sm font-semibold text-gray-300">
                  Acciones
                </th>

              </tr>
            </thead>


            <tbody>

              {users.length === 0 ? (

                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-8 text-center text-gray-400"
                  >
                    No hay usuarios registrados
                  </td>
                </tr>

              ) : (

                users.map((user) => (

                  <tr
                    key={user.id}
                    className="border-b border-white/5 hover:bg-white/5"
                  >

                    {/* USUARIO */}
                    <td className="px-4 sm:px-6 py-4">

                      <div className="flex items-center">

                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-purple to-accent-blue flex items-center justify-center text-white font-bold mr-3 flex-shrink-0">
                          {user.username.charAt(0).toUpperCase()}
                        </div>

                        <span className="text-white font-medium truncate">
                          {user.username}
                        </span>

                      </div>

                    </td>


                    {/* ROL */}
                    <td className="px-4 sm:px-6 py-4">

                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.role === 'ADMIN'
                            ? 'bg-accent-purple/20 text-accent-purple'
                            : 'bg-accent-blue/20 text-accent-blue'
                          }`}
                      >

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


                    {/* FECHA */}
                    <td className="hidden sm:table-cell px-6 py-4 text-gray-400 text-sm">
                      {new Date().toLocaleDateString('es-AR')}
                    </td>


                    {/* ACCIONES */}
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


      {/* =========================
          MODAL ELIMINAR USUARIO
         ========================= */}
      {showDeleteModal && (

        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

          {/* FONDO OSCURO */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={closeDeleteModal}
          />


          {/* CONTENIDO DEL MODAL */}
          <div className="relative w-full max-w-md bg-dark-800 border border-white/10 rounded-2xl shadow-2xl p-6">

            {/* BOTÓN CERRAR */}
            <button
              onClick={closeDeleteModal}
              disabled={deleting}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-50 rounded-lg transition-colors"
              title="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>


            {/* ICONO DE ADVERTENCIA */}
            <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center mb-5">
              <AlertTriangle className="w-7 h-7 text-red-400" />
            </div>


            {/* TÍTULO */}
            <h2 className="text-xl font-bold text-white">
              ¿Eliminar usuario?
            </h2>


            {/* DESCRIPCIÓN */}
            <p className="text-gray-400 mt-2 leading-relaxed">
              Esta acción eliminará permanentemente al usuario seleccionado.
              Esta operación no se puede deshacer.
            </p>


            {/* BOTONES */}
            <div className="flex flex-col-reverse sm:flex-row gap-3 mt-6">

              {/* CANCELAR */}
              <button
                onClick={closeDeleteModal}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                Cancelar
              </button>


              {/* CONFIRMAR */}
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center justify-center"
              >

                {deleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Eliminando...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Sí, eliminar
                  </>
                )}

              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
};