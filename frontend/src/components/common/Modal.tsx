import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen?: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'normal' | 'large' | 'md' | 'lg' | 'sm';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen = true,
  onClose,
  title,
  children,
  footer,
  size = 'normal'
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (isOpen === false) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className={`modal-content ${size === 'large' || size === 'lg' ? 'modal-lg' : ''} ${size === 'sm' ? 'modal-sm' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Drag/Grab Handle */}
        <div className="modal-sheet-handle-bar">
          <div className="modal-sheet-handle" />
        </div>

        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button
            type="button"
            className="btn btn-secondary btn-icon btn-sm"
            onClick={onClose}
            aria-label="Cerrar modal"
          >
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">{children}</div>

        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
};
