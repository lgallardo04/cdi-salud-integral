import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  iconVariant?: 'blue' | 'teal' | 'red' | 'amber';
  trend?: string;
  trendType?: 'positive' | 'warning' | 'negative';
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  iconVariant = 'blue',
  trend,
  trendType = 'positive',
  onClick
}) => {
  return (
    <div
      className="stat-card"
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div style={{ flex: 1 }}>
        <div className="stat-title">{title}</div>
        <div className="stat-value">{value}</div>
        {trend && (
          <div className={`stat-trend ${trendType}`}>
            <span>{trend}</span>
          </div>
        )}
      </div>
      <div className={`stat-icon-wrapper stat-icon-${iconVariant}`}>
        {icon}
      </div>
    </div>
  );
};
