'use client';
import React from 'react';
import { DishSummary } from '../../../hooks/useKDSBoard';
import './KDSDishSummary.css';

interface Props {
  summaries: DishSummary[];
}

export default function KDSDishSummary({ summaries }: Props) {
  if (summaries.length === 0) return null;

  return (
    <div className="ds">
      <span className="ds__label">⚡ Nấu chung được:</span>
      <div className="ds__chips">
        {summaries.map((s) => (
          <div key={s.dish_id} className="ds__chip">
            <span className="ds__chip-name">{s.title}</span>
            <span className="ds__chip-total">×{s.total_qty}</span>
            <span className="ds__chip-detail">
              ({s.tables.map((t) => `Bàn ${t.table_number}: ×${t.quantity}`).join(' · ')})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
