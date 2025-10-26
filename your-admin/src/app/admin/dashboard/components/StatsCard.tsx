// app/components/dashboard/StatsCard.tsx
'use client';
import React from 'react';
import './StatsCard.css';

type Props = { 
  title: string; 
  value: number | string; 
  suffix?: string;
  icon?: React.ReactNode;
  color?: 'blue' | 'green' | 'orange' | 'purple';
  loading?: boolean;
};

export default function StatsCard({ title, value, suffix, icon, color = 'blue', loading }: Props) {
  const formatValue = (val: number | string) => {
    if (typeof val === 'number') {
      return val.toLocaleString('vi-VN');
    }
    return val;
  };

  return (
    <div className={`stats-card stats-card--${color}`}>
      <div className="stats-card__header">
        <div className="stats-card__icon">
          {icon || (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </div>
        <h3 className="stats-card__title">{title}</h3>
      </div>
      <div className="stats-card__content">
        {loading ? (
          <div className="stats-card__loading">
            <div className="loading-spinner"></div>
          </div>
        ) : (
          <div className="stats-card__value">
            {formatValue(value)} {suffix && <span className="stats-card__suffix">{suffix}</span>}
          </div>
        )}
      </div>
    </div>
  );
}