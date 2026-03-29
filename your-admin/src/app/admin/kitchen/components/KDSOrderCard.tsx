'use client';
import React, { useState } from 'react';
import { KDSOrder } from '../../../hooks/useKDSBoard';
import './KDSOrderCard.css';

interface Props {
  order: KDSOrder;
  onComplete: (orderId: string) => Promise<void>;
}

export default function KDSOrderCard({ order, onComplete }: Props) {
  const [loading, setLoading] = useState(false);

  const urgent  = order.wait_minutes >= 15;
  const warning = order.wait_minutes >= 8 && !urgent;

  const handleComplete = async () => {
    if (!order.order_id) return; // guard: ID rỗng thì không gọi API
    setLoading(true);
    try {
      await onComplete(order.order_id);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`kc ${urgent ? 'kc--urgent' : warning ? 'kc--warning' : ''}`}>

      {/* ── Header: ưu tiên + số bàn + thời gian chờ ─────────────────── */}
      <div className="kc__head">
        <div className="kc__priority">#{order.priority}</div>

        <div className="kc__table">
          <span className="kc__table-label">BÀN</span>
          <span className="kc__table-num">{order.table_number}</span>
        </div>

        <div className={`kc__timer ${urgent ? 'kc__timer--urgent' : ''}`}>
          ⏱ {order.wait_minutes} phút
        </div>
      </div>

      {/* ── Danh sách món ─────────────────────────────────────────────── */}
      <ul className="kc__items">
        {order.items.map((item, idx) => (
          <li key={item.item_id || `item-${idx}`} className="kc__item">
            <span className="kc__item-name">{item.title}</span>
            <span className="kc__item-qty">×{item.quantity}</span>
            {item.is_duplicate && item.duplicate_info && item.duplicate_info.length > 0 && (
              <span
                className="kc__item-dup"
                title={item.duplicate_info.map(d => `Bàn ${d.table_number}: ×${d.quantity}`).join(', ')}
              >
                ⚡
              </span>
            )}
          </li>
        ))}
      </ul>

      {/* ── Nút hoàn thành ────────────────────────────────────────────── */}
      <button
        className="kc__done-btn"
        onClick={handleComplete}
        disabled={loading}
      >
        {loading ? 'Đang lưu...' : '✓ Hoàn thành bàn ' + order.table_number}
      </button>
    </div>
  );
}
