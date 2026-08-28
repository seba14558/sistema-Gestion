import React from 'react';
import { Edit2, Trash2, Inbox, ChevronLeft, ChevronRight } from 'lucide-react';

export interface Column<T> {
  key: string;
  label: string;
  render?: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  pagination?: {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  showActions?: boolean;
}

export function DataTable<T extends { id?: number | string }>({
  columns,
  data,
  loading = false,
  pagination,
  onEdit,
  onDelete,
  showActions = false
}: DataTableProps<T>) {

  if (loading) {
    return (
      <div className="w-full animate-pulse">
        <div className="h-10 bg-white/5 rounded-t-xl mb-1"></div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-white/5 border-b border-white/5"></div>
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-gray-400 bg-white/5 rounded-xl">
        <Inbox className="w-12 h-12 mb-4 opacity-50" />
        <p>No hay datos disponibles</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto glass-card">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((col, idx) => (
              <th key={idx}>{col.label}</th>
            ))}
            {showActions && <th className="text-right">Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {data.map((item, rowIdx) => (
            <tr key={item.id || rowIdx}>
              {columns.map((col, colIdx) => (
                <td key={colIdx}>
                  {col.render ? col.render(item) : (item as any)[col.key]}
                </td>
              ))}
              {showActions && (
                <td className="text-right whitespace-nowrap">
                  {onEdit && (
                    <button 
                      onClick={() => onEdit(item)}
                      className="p-2 text-accent-blue hover:bg-accent-blue/10 rounded-lg transition-colors mr-2"
                      title="Editar"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}
                  {onDelete && (
                    <button 
                      onClick={() => onDelete(item)}
                      className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/10">
          <span className="text-sm text-gray-400">
            Página {pagination.page} de {pagination.totalPages}
          </span>
          <div className="flex space-x-2">
            <button
              onClick={() => pagination.onPageChange(Math.max(1, pagination.page - 1))}
              disabled={pagination.page === 1}
              className="p-2 bg-white/5 rounded-lg disabled:opacity-50 hover:bg-white/10 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => pagination.onPageChange(Math.min(pagination.totalPages, pagination.page + 1))}
              disabled={pagination.page === pagination.totalPages}
              className="p-2 bg-white/5 rounded-lg disabled:opacity-50 hover:bg-white/10 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
