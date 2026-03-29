'use client';
import React from 'react';
import dynamic from 'next/dynamic';
import { useKDSBoard } from '../../hooks/useKDSBoard';
import './kitchen.css';

const KDSOrderCard   = dynamic(() => import('./components/KDSOrderCard'),   { ssr: false });
const KDSDishSummary = dynamic(() => import('./components/KDSDishSummary'), { ssr: false });

export default function KitchenPage() {
  const { board, loading, error, completeOrder, refetch } = useKDSBoard();

  if (loading) {
    return (
      <div className="kds-page kds-center">
        <div className="kds-spinner" />
        <p>Đang tải...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="kds-page kds-center">
        <p style={{ color: '#dc2626' }}>{error}</p>
        <button className="kds-retry" onClick={refetch}>Thử lại</button>
      </div>
    );
  }

  const orders = board.orders;

  return (
    <div className="kds-page">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="kds-header">
        <div className="kds-header__left">
          <h1>Bếp</h1>
          <span className="kds-header__count">
            {orders.length} bàn đang chờ
          </span>
        </div>
        <button className="kds-refresh" onClick={refetch}>↻</button>
      </div>

      {/* ── Món trùng ──────────────────────────────────────────────────── */}
      <KDSDishSummary summaries={board.dish_summary} />

      {/* ── Danh sách bàn ──────────────────────────────────────────────── */}
      {orders.length === 0 ? (
        <div className="kds-empty">
          <div className="kds-empty__icon">🍽️</div>
          <p>Chưa có đơn nào</p>
        </div>
      ) : (
        <div className="kds-grid">
          {orders.map((order, idx) => (
            <KDSOrderCard
              key={order.order_id || `order-${idx}`}
              order={order}
              onComplete={completeOrder}
            />
          ))}
        </div>
      )}
    </div>
  );
}
