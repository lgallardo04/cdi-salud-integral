import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'urgent' | 'warning' | 'info' | 'neutral' | 'danger' | 'secondary' | 'primary' | string;
  type?: 'success' | 'urgent' | 'warning' | 'info' | 'neutral' | 'danger' | 'secondary' | 'primary' | string;
  icon?: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant,
  type,
  icon,
  className = ''
}) => {
  const finalVariant = variant || type || 'neutral';
  return (
    <span className={`badge badge-${finalVariant} ${className}`}>
      {icon && <span className="badge-icon">{icon}</span>}
      {children}
    </span>
  );
};

