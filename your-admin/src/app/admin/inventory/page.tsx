'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import './inventory.css';
import {
  useStockSummary,
  apiCreateIngredientType,
  apiCreateReceipt,
  type StockSummaryItem,
  type IngredientType,
} from '../../hooks/useInventory';

// ── Helpers ───────────────────────────────────────────────────────────────────

function stockStatus(baskets: number): 'good' | 'low' | 'empty' {
  if (baskets <= 0) return 'empty';
  if (baskets <= 2) return 'low';
  return 'good';
}

function formatVnd(n: number) {
  return n.toLocaleString('vi-VN') + 'đ';
}

// ── Sub-components ────────────────────────────────────────────────────────────

function IngredientCard({
  item,
  ingredientType,
  onReceiptAdded,
}: {
  item: StockSummaryItem;
  ingredientType: IngredientType | undefined;
  onReceiptAdded: () => void;
}) {
  const [showReceiptForm, setShowReceiptForm] = useState(false);
  const [weightKg, setWeightKg] = useState('');
  const [pricePerKg, setPricePerKg] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const status = stockStatus(item.available_baskets);

  async function handleAddReceipt(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErr('');
    const res = await apiCreateReceipt({
      ingredient_type_id: item.ingredient_type_id,
      raw_weight_kg: parseFloat(weightKg),
      price_per_kg: parseFloat(pricePerKg),
      note,
    });
    setSaving(false);
    if (res.success) {
      setShowReceiptForm(false);
      setWeightKg(''); setPricePerKg(''); setNote('');
      onReceiptAdded();
    } else {
      setErr(res.error ?? 'Lỗi không xác định');
    }
  }

  return (
    <>
      <div className="ing-card">
        <div className="ing-card__header">
          <div>
            <div className="ing-card__name">{item.ingredient_name}</div>
            {ingredientType && (
              <div className="ing-card__avg">~{ingredientType.avg_kg_per_basket}kg/rổ</div>
            )}
          </div>
          <span className={`stock-badge ${status}`}>
            {status === 'good' && '✓ Đủ hàng'}
            {status === 'low' && '⚠ Sắp hết'}
            {status === 'empty' && '✗ Hết hàng'}
          </span>
        </div>

        <div className="ing-card__baskets">
          <div className={`baskets-number ${status === 'low' ? 'text-orange' : status === 'empty' ? 'text-red' : ''}`}>
            {item.available_baskets}
          </div>
          <div className="baskets-label">rổ còn sẵn</div>
        </div>

        {item.total_cost_per_basket > 0 && (
          <div className="ing-card__cost">
            Giá thành: <strong>{formatVnd(Math.round(item.total_cost_per_basket))}/rổ</strong>
          </div>
        )}

        <div className="ing-card__actions">
          <button className="btn-secondary" onClick={() => setShowReceiptForm(true)}>
            + Nhập hàng
          </button>
          <Link href={`/admin/inventory/${item.ingredient_type_id}`} className="btn-primary">
            Quản lý
          </Link>
        </div>
      </div>

      {showReceiptForm && (
        <div className="modal-overlay" onClick={() => setShowReceiptForm(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h2>Nhập hàng — {item.ingredient_name}</h2>
            {err && <div className="error-banner">{err}</div>}
            <form onSubmit={handleAddReceipt}>
              <div className="form-group">
                <label>Số kg mua vào</label>
                <input
                  type="number" step="0.1" min="0.1" required
                  placeholder="VD: 10"
                  value={weightKg}
                  onChange={e => setWeightKg(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Giá / kg (đồng)</label>
                <input
                  type="number" min="1" required
                  placeholder="VD: 80000"
                  value={pricePerKg}
                  onChange={e => setPricePerKg(e.target.value)}
                />
                {weightKg && pricePerKg && (
                  <div className="hint">
                    Tổng: {formatVnd(parseFloat(weightKg) * parseFloat(pricePerKg))}
                  </div>
                )}
              </div>
              <div className="form-group">
                <label>Ghi chú (tùy chọn)</label>
                <input
                  type="text"
                  placeholder="VD: hàng tươi, chất lượng tốt"
                  value={note}
                  onChange={e => setNote(e.target.value)}
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowReceiptForm(false)}>
                  Hủy
                </button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? 'Đang lưu...' : 'Lưu phiếu nhập'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function InventoryPage() {
  const { stock, ingredientTypes, loading, error, refetch } = useStockSummary();
  const [showAddType, setShowAddType] = useState(false);
  const [newName, setNewName] = useState('');
  const [newAvgKg, setNewAvgKg] = useState('');
  const [addErr, setAddErr] = useState('');
  const [adding, setAdding] = useState(false);

  async function handleAddType(e: React.FormEvent) {
    e.preventDefault();
    setAdding(true);
    setAddErr('');
    const res = await apiCreateIngredientType(newName, parseFloat(newAvgKg) || 0);
    setAdding(false);
    if (res.success) {
      setShowAddType(false);
      setNewName(''); setNewAvgKg('');
      refetch();
    } else {
      setAddErr(res.error ?? 'Lỗi không xác định');
    }
  }

  if (loading) {
    return (
      <div className="inv-loading">
        <div className="spinner" />
        <span>Đang tải tồn kho...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-banner" style={{ margin: 0 }}>
        Lỗi tải dữ liệu: {error}
      </div>
    );
  }

  const items = stock?.items ?? [];
  const totalBaskets = items.reduce((s, i) => s + i.available_baskets, 0);
  const lowStockCount = items.filter(i => stockStatus(i.available_baskets) !== 'good').length;

  return (
    <div className="inv-page">
      <div className="inv-header">
        <div>
          <h1>📦 Quản lý tồn kho</h1>
          <p>Theo dõi rổ ốc/sò từ nhập hàng đến bán ra</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link href="/admin/inventory/sessions" className="btn-secondary">
            🌙 Mở ca tối
          </Link>
          <button className="btn-primary" onClick={() => setShowAddType(true)}>
            + Thêm loại
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="inv-stats-row">
        <div className="inv-stat-card accent-blue">
          <div className="stat-value">{ingredientTypes.length}</div>
          <div className="stat-label">Loại nguyên liệu</div>
        </div>
        <div className="inv-stat-card accent-green">
          <div className="stat-value">{totalBaskets}</div>
          <div className="stat-label">Tổng rổ còn sẵn</div>
        </div>
        <div className={`inv-stat-card ${lowStockCount > 0 ? 'accent-orange' : 'accent-green'}`}>
          <div className="stat-value">{lowStockCount}</div>
          <div className="stat-label">Cần nhập thêm</div>
        </div>
      </div>

      {/* Ingredient cards */}
      {items.length === 0 ? (
        <div className="inv-empty">
          <div className="empty-icon">📦</div>
          <h3>Chưa có nguyên liệu nào</h3>
          <p>Bắt đầu bằng cách thêm loại nguyên liệu (sò huyết, sò lông, ốc len...)</p>
          <button className="btn-primary" style={{ marginTop: 16 }} onClick={() => setShowAddType(true)}>
            + Thêm loại nguyên liệu
          </button>
        </div>
      ) : (
        <div className="inv-grid">
          {items.map(item => (
            <IngredientCard
              key={item.ingredient_type_id}
              item={item}
              ingredientType={ingredientTypes.find(t => t.id === item.ingredient_type_id)}
              onReceiptAdded={refetch}
            />
          ))}
        </div>
      )}

      {/* Modal: Thêm loại nguyên liệu */}
      {showAddType && (
        <div className="modal-overlay" onClick={() => setShowAddType(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h2>Thêm loại nguyên liệu</h2>
            {addErr && <div className="error-banner">{addErr}</div>}
            <form onSubmit={handleAddType}>
              <div className="form-group">
                <label>Tên nguyên liệu</label>
                <input
                  type="text" required
                  placeholder="VD: Sò huyết, Sò lông, Ốc len..."
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Trung bình kg / rổ</label>
                <input
                  type="number" step="0.1" min="0"
                  placeholder="VD: 3 (sò huyết ~3kg/rổ)"
                  value={newAvgKg}
                  onChange={e => setNewAvgKg(e.target.value)}
                />
                <div className="hint">Dùng để ước tính chi phí, không bắt buộc chính xác</div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowAddType(false)}>
                  Hủy
                </button>
                <button type="submit" className="btn-primary" disabled={adding}>
                  {adding ? 'Đang lưu...' : 'Thêm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
