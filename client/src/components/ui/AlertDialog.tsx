import React, { useEffect } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

interface AlertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'success' | 'error';
}

export const AlertDialog: React.FC<AlertDialogProps> = ({
  isOpen,
  onClose,
  title,
  message,
  type = 'success'
}) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isSuccess = type === 'success';
  const Icon = isSuccess ? CheckCircle : XCircle;
  const iconColor = isSuccess ? 'text-emerald-400' : 'text-red-400';
  const bgColor = isSuccess ? 'bg-emerald-500/10' : 'bg-red-500/10';
  const borderColor = isSuccess ? 'border-emerald-500/30' : 'border-red-500/30';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-md glass-card shadow-2xl animate-slide-up">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={`flex-shrink-0 p-3 rounded-full ${bgColor} ${borderColor} border`}>
              <Icon className={`w-6 h-6 ${iconColor}`} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
              <p className="text-gray-300 text-sm">{message}</p>
            </div>
            <button 
              onClick={onClose}
              className="flex-shrink-0 p-1 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
