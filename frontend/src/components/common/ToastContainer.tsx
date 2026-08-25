import React from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useData } from '../../context/DataContext';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useData();

  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        maxWidth: '380px'
      }}
    >
      {toasts.map((toast) => {
        const getStyles = () => {
          switch (toast.type) {
            case 'success':
              return { bg: '#f0fdf4', border: '#bbf7d0', text: '#166534', icon: <CheckCircle2 size={18} color="#16a34a" /> };
            case 'error':
              return { bg: '#fef2f2', border: '#fecaca', text: '#991b1b', icon: <AlertCircle size={18} color="#dc2626" /> };
            case 'warning':
              return { bg: '#fffbeb', border: '#fde68a', text: '#92400e', icon: <AlertTriangle size={18} color="#d97706" /> };
            default:
              return { bg: '#f0f9ff', border: '#bae6fd', text: '#075985', icon: <Info size={18} color="#0284c7" /> };
          }
        };

        const config = getStyles();

        return (
          <div
            key={toast.id}
            style={{
              backgroundColor: config.bg,
              border: `1px solid ${config.border}`,
              color: config.text,
              borderRadius: '8px',
              padding: '0.75rem 1rem',
              boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.75rem',
              fontSize: '0.85rem',
              fontWeight: 500,
              animation: 'slideUp 200ms ease-out'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {config.icon}
              <span>{toast.message}</span>
            </div>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: config.text,
                opacity: 0.7,
                padding: '2px'
              }}
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
