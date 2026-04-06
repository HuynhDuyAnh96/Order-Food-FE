'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getApiBaseOrThrow } from '@/lib/api';
import './order-detail.css';

interface OrderItem {
  item_id: string;
  dish_id: string;
  quantity: number;
  price: number;
  title: string;
  is_custom?: boolean;
  note?: string;
  item_status?: string;
}

interface Order {
  id: string;
  user_id: string;
  order_type: 'dine_in' | 'takeaway';
  table_number: number;
  total_price: number;
  status: string;
  created_at: string;
  updated_at?: string;
  items: OrderItem[];
}

const STATUS_LABEL: Record<string, string> = {
  pending: 'Chờ xử lý',
  preparing: 'Đang nấu',
  ready: 'Sẵn sàng',
  completed: 'Hoàn thành',
  paid: 'Đã thanh toán',
  cancelled: 'Đã huỷ',
};

const STATUS_COLOR: Record<string, string> = {
  pending: '#f59e0b',
  preparing: '#3b82f6',
  ready: '#10b981',
  completed: '#6b7280',
  paid: '#059669',
  cancelled: '#ef4444',
};

const fmt = (n: number) => new Intl.NumberFormat('vi-VN').format(n) + '₫';
const fmtDate = (s: string) =>
  new Date(s).toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

const canEdit = (status: string) => !['paid', 'cancelled'].includes(status);

export default function OrderDetailPage() {
  const { id: orderId } = useParams() as { id: string };
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // add-item modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState({ title: '', price: '', quantity: '1', is_custom: true, note: '' });

  const fetchOrder = useCallback(async () => {
    try {
      const apiBase = getApiBaseOrThrow();
      const res = await fetch(`${apiBase}/orders`);
      if (!res.ok) throw new Error('Không thể tải đơn hàng');
      const result = await res.json();
      const found = (result.data as Order[]).find(o => o.id === orderId);
      if (!found) throw new Error('Không tìm thấy đơn hàng');
      setOrder(found);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Lỗi không xác định');
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => { fetchOrder(); }, [fetchOrder]);

  const call = async (fn: () => Promise<Response>, successMsg?: string) => {
    setBusy(true);
    try {
      const res = await fn();
      const body = await res.json();
      if (!res.ok) { alert(`Lỗi: ${body.error ?? res.statusText}`); return; }
      if (body.data) setOrder(body.data);
      if (successMsg) alert(successMsg);
    } catch { alert('Lỗi kết nối mạng'); }
    finally { setBusy(false); }
  };

  const handleConfirm = () => {
    const apiBase = getApiBaseOrThrow();
    call(() => fetch(`${apiBase}/orders/${orderId}/confirm`, { method: 'POST' }), 'Đã xác nhận đơn');
  };

  const handleCancel = () => {
    if (!confirm('Huỷ toàn bộ đơn hàng này?')) return;
    const apiBase = getApiBaseOrThrow();
    call(() => fetch(`${apiBase}/orders/${orderId}/cancel`, { method: 'POST' }), 'Đã huỷ đơn');
  };

  const handlePay = () => {
    if (!confirm('Xác nhận đã thu tiền?')) return;
    const apiBase = getApiBaseOrThrow();
    call(() => fetch(`${apiBase}/orders/${orderId}/pay`, { method: 'POST' }), 'Thanh toán thành công');
  };

  const handleRemoveItem = (itemId: string, title: string) => {
    if (!confirm(`Xoá món "${title}" khỏi đơn?`)) return;
    const apiBase = getApiBaseOrThrow();
    call(() => fetch(`${apiBase}/orders/${orderId}/items/${itemId}`, { method: 'DELETE' }));
  };

  const handleQtyChange = (itemId: string, qty: number) => {
    if (qty < 1) return;
    const apiBase = getApiBaseOrThrow();
    call(() =>
      fetch(`${apiBase}/orders/${orderId}/items/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: qty }),
      })
    );
  };

  const handleAddItem = async () => {
    const price = parseFloat(newItem.price);
    const quantity = parseInt(newItem.quantity);
    if (!newItem.title.trim()) { alert('Nhập tên món'); return; }
    if (isNaN(price) || price <= 0) { alert('Giá không hợp lệ'); return; }
    if (isNaN(quantity) || quantity < 1) { alert('Số lượng không hợp lệ'); return; }
    const apiBase = getApiBaseOrThrow();
    await call(() =>
      fetch(`${apiBase}/orders/${orderId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: '',
          title: newItem.title.trim(),
          price,
          quantity,
          is_custom: true,
          note: newItem.note.trim(),
        }),
      })
    );
    setShowAddModal(false);
    setNewItem({ title: '', price: '', quantity: '1', is_custom: true, note: '' });
  };

  if (loading) return (
    <div className="order-detail-container">
      <div className="loading-container"><div className="loading-spinner-large" /><p>Đang tải...</p></div>
    </div>
  );

  if (error || !order) return (
    <div className="order-detail-container">
      <div className="error-container">
        <h2>Lỗi</h2><p>{error || 'Không tìm thấy đơn hàng'}</p>
        <Link href="/admin/dashboard" className="back-button">← Quay lại</Link>
      </div>
    </div>
  );

  const editable = canEdit(order.status);
  const isTakeaway = order.order_type === 'takeaway';

  return (
    <div className="order-detail-container">
      <div className="order-detail-header">
        <Link href="/admin/dashboard" className="back-link">← Quay lại Dashboard</Link>
        <h1 className="order-detail-title">Chi tiết đơn hàng</h1>
      </div>

      <div className="order-detail-content">
        {/* ── Info card ───────────────────────────────────────────── */}
        <div className="order-info-card">
          <div className="card-header">
            <div className="order-id-section">
              <span className="order-id-label">Mã đơn</span>
              <span className="order-id-value">#{order.id}</span>
            </div>
            <div className="od-badges">
              {isTakeaway && <span className="od-badge-takeaway">🛵 MANG VỀ</span>}
              <div className="status-badge-large" style={{ backgroundColor: STATUS_COLOR[order.status] }}>
                {STATUS_LABEL[order.status] ?? order.status}
              </div>
            </div>
          </div>

          <div className="order-info-grid">
            <div className="info-item">
              <span className="info-label">{isTakeaway ? 'Loại đơn' : 'Bàn số'}</span>
              <span className="info-value">{isTakeaway ? 'Mang về' : `Bàn ${order.table_number}`}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Người đặt</span>
              <span className="info-value">{order.user_id || 'Khách'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Tạo lúc</span>
              <span className="info-value">{fmtDate(order.created_at)}</span>
            </div>
            {order.updated_at && (
              <div className="info-item">
                <span className="info-label">Cập nhật</span>
                <span className="info-value">{fmtDate(order.updated_at)}</span>
              </div>
            )}
          </div>
        </div>

        {/* ── Items card ──────────────────────────────────────────── */}
        <div className="order-items-card">
          <div className="od-items-header">
            <h2 className="card-title">Danh sách món</h2>
            {editable && (
              <button className="od-add-btn" onClick={() => setShowAddModal(true)} disabled={busy}>
                + Thêm món
              </button>
            )}
          </div>

          <div className="items-table">
            <div className="items-table-header">
              <div className="table-col-name">Tên món</div>
              <div className="table-col-quantity">SL</div>
              <div className="table-col-price">Đơn giá</div>
              <div className="table-col-total">Thành tiền</div>
              {editable && <div className="table-col-action"></div>}
            </div>

            {order.items.map((item, idx) => (
              <div key={item.item_id || idx} className="items-table-row">
                <div className="table-col-name">
                  <span className="item-name">{item.title}</span>
                  {item.is_custom && <span className="od-custom-tag">Món lậu</span>}
                  {item.note && <span className="od-note">{item.note}</span>}
                </div>

                <div className="table-col-quantity">
                  {editable ? (
                    <div className="od-qty-ctrl">
                      <button onClick={() => handleQtyChange(item.item_id, item.quantity - 1)} disabled={busy || item.quantity <= 1}>−</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => handleQtyChange(item.item_id, item.quantity + 1)} disabled={busy}>+</button>
                    </div>
                  ) : item.quantity}
                </div>

                <div className="table-col-price">{fmt(item.price)}</div>
                <div className="table-col-total">{fmt(item.price * item.quantity)}</div>

                {editable && (
                  <div className="table-col-action">
                    <button
                      className="od-remove-btn"
                      onClick={() => handleRemoveItem(item.item_id, item.title)}
                      disabled={busy}
                      title="Xoá món"
                    >✕</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Summary ─────────────────────────────────────────────── */}
        <div className="order-summary-card">
          <div className="summary-row">
            <span className="summary-label">Tổng số món:</span>
            <span className="summary-value">{order.items.length} món</span>
          </div>
          <div className="summary-row total-row">
            <span className="summary-label">Tổng cộng:</span>
            <span className="summary-value total-amount">{fmt(order.total_price)}</span>
          </div>
        </div>

        {/* ── Actions ─────────────────────────────────────────────── */}
        <div className="order-actions">
          {order.status === 'pending' && (
            <button className="action-btn action-btn-primary" onClick={handleConfirm} disabled={busy}>
              {busy ? 'Đang xử lý...' : 'Xác nhận đơn'}
            </button>
          )}
          {(order.status === 'ready' || (isTakeaway && ['preparing', 'ready'].includes(order.status))) && (
            <button className="action-btn action-btn-success" onClick={handlePay} disabled={busy}>
              {busy ? 'Đang xử lý...' : '💰 Thu tiền'}
            </button>
          )}
          {editable && (
            <button className="action-btn action-btn-danger" onClick={handleCancel} disabled={busy}>
              {busy ? 'Đang xử lý...' : 'Huỷ đơn hàng'}
            </button>
          )}
        </div>
      </div>

      {/* ── Add item modal ──────────────────────────────────────────── */}
      {showAddModal && (
        <div className="od-modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="od-modal" onClick={e => e.stopPropagation()}>
            <h3 className="od-modal-title">Thêm món vào đơn</h3>

            <label className="od-label">Tên món <span className="od-required">*</span></label>
            <input
              className="od-input"
              placeholder="Ví dụ: Ghẹ hấp bia"
              value={newItem.title}
              onChange={e => setNewItem(p => ({ ...p, title: e.target.value }))}
            />

            <label className="od-label">Giá (đ) <span className="od-required">*</span></label>
            <input
              className="od-input"
              type="number"
              placeholder="50000"
              value={newItem.price}
              onChange={e => setNewItem(p => ({ ...p, price: e.target.value }))}
            />

            <label className="od-label">Số lượng <span className="od-required">*</span></label>
            <input
              className="od-input"
              type="number"
              min={1}
              value={newItem.quantity}
              onChange={e => setNewItem(p => ({ ...p, quantity: e.target.value }))}
            />

            <label className="od-label">Ghi chú (tuỳ chọn)</label>
            <input
              className="od-input"
              placeholder="Ít cay, không hành..."
              value={newItem.note}
              onChange={e => setNewItem(p => ({ ...p, note: e.target.value }))}
            />

            <div className="od-modal-actions">
              <button className="od-modal-cancel" onClick={() => setShowAddModal(false)}>Huỷ</button>
              <button className="od-modal-confirm" onClick={handleAddItem} disabled={busy}>
                {busy ? 'Đang lưu...' : 'Thêm món'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
