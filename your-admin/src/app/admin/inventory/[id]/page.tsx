'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { use } from 'react';
import './detail.css';
import {
  useIngredientDetail,
  apiCreateReceipt,
  apiCreateBatch,
  apiUpsertRecipeCost,
  type RecipeCostItem,
  type InventoryReceipt,
} from '../../../hooks/useInventory';

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatVnd(n: number) { return n.toLocaleString('vi-VN') + 'đ'; }
function formatDate(s: string) {
  return new Date(s).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}
function wasteBadge(pct: number): string {
  if (pct < 10) return 'good';
  if (pct < 25) return 'medium';
  return 'high';
}

// ── Tab: Nhập hàng ────────────────────────────────────────────────────────────

function ReceiptsTab({ ingredientTypeId, receipts, onAdded }: {
  ingredientTypeId: string;
  receipts: InventoryReceipt[];
  onAdded: () => void;
}) {
  const [show, setShow] = useState(false);
  const [weightKg, setWeightKg] = useState('');
  const [pricePerKg, setPricePerKg] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setErr('');
    const res = await apiCreateReceipt({
      ingredient_type_id: ingredientTypeId,
      raw_weight_kg: parseFloat(weightKg),
      price_per_kg: parseFloat(pricePerKg),
      note,
    });
    setSaving(false);
    if (res.success) {
      setShow(false); setWeightKg(''); setPricePerKg(''); setNote('');
      onAdded();
    } else {
      setErr(res.error ?? 'Lỗi không xác định');
    }
  }

  return (
    <>
      <div className="section-header">
        <h2>Lịch sử nhập hàng</h2>
        <button className="btn-primary" onClick={() => setShow(true)}>+ Nhập hàng mới</button>
      </div>

      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Ngày nhập</th>
              <th>Kg mua vào</th>
              <th>Giá/kg</th>
              <th>Tổng tiền</th>
              <th>Ghi chú</th>
            </tr>
          </thead>
          <tbody>
            {receipts.length === 0 && (
              <tr><td colSpan={5} className="table-empty">Chưa có phiếu nhập nào</td></tr>
            )}
            {receipts.map(r => (
              <tr key={r.id}>
                <td><div className="td-main">{formatDate(r.received_at)}</div></td>
                <td><strong>{r.raw_weight_kg} kg</strong></td>
                <td>{formatVnd(r.price_per_kg)}</td>
                <td className="td-mono">{formatVnd(r.total_cost)}</td>
                <td style={{ color: '#94a3b8' }}>{r.note || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {show && (
        <div className="modal-overlay" onClick={() => setShow(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h2>Nhập hàng mới</h2>
            {err && <div className="error-banner">{err}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Số kg mua vào</label>
                <input type="number" step="0.1" min="0.1" required placeholder="VD: 10"
                  value={weightKg} onChange={e => setWeightKg(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Giá / kg (đồng)</label>
                <input type="number" min="1" required placeholder="VD: 80000"
                  value={pricePerKg} onChange={e => setPricePerKg(e.target.value)} />
                {weightKg && pricePerKg && (
                  <div className="hint">Tổng: {formatVnd(parseFloat(weightKg) * parseFloat(pricePerKg))}</div>
                )}
              </div>
              <div className="form-group">
                <label>Ghi chú</label>
                <input type="text" placeholder="Tùy chọn"
                  value={note} onChange={e => setNote(e.target.value)} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShow(false)}>Hủy</button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? 'Đang lưu...' : 'Lưu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

// ── Tab: Mẻ xử lý ────────────────────────────────────────────────────────────

function BatchesTab({ ingredientTypeId, receipts, batches, onAdded }: {
  ingredientTypeId: string;
  receipts: InventoryReceipt[];
  batches: ReturnType<typeof useIngredientDetail>['batches'];
  onAdded: () => void;
}) {
  const [show, setShow] = useState(false);
  const [receiptId, setReceiptId] = useState('');
  const [inputKg, setInputKg] = useState('');
  const [outputBaskets, setOutputBaskets] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const selectedReceipt = receipts.find(r => r.id === receiptId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setErr('');
    const res = await apiCreateBatch({
      receipt_id: receiptId,
      input_weight_kg: parseFloat(inputKg),
      output_baskets: parseInt(outputBaskets),
      note,
    });
    setSaving(false);
    if (res.success) {
      setShow(false); setReceiptId(''); setInputKg(''); setOutputBaskets(''); setNote('');
      onAdded();
    } else {
      setErr(res.error ?? 'Lỗi không xác định');
    }
  }

  return (
    <>
      <div className="section-header">
        <h2>Lịch sử mẻ xử lý</h2>
        <button
          className="btn-primary"
          onClick={() => setShow(true)}
          disabled={receipts.length === 0}
          title={receipts.length === 0 ? 'Cần nhập hàng trước' : ''}
        >
          + Tạo mẻ xử lý
        </button>
      </div>

      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Ngày xử lý</th>
              <th>Kg đưa vào</th>
              <th>Rổ ra được</th>
              <th>Hao hụt</th>
              <th>Chi phí/rổ</th>
              <th>Ghi chú</th>
            </tr>
          </thead>
          <tbody>
            {batches.length === 0 && (
              <tr><td colSpan={6} className="table-empty">Chưa có mẻ xử lý nào</td></tr>
            )}
            {batches.map(b => (
              <tr key={b.id}>
                <td><div className="td-main">{formatDate(b.processed_at)}</div></td>
                <td>{b.input_weight_kg} kg</td>
                <td><strong style={{ fontSize: '1.1rem' }}>{b.output_baskets} rổ</strong></td>
                <td>
                  <span className={`badge-waste ${wasteBadge(b.waste_percent)}`}>
                    {b.waste_percent.toFixed(1)}%
                  </span>
                </td>
                <td className="td-mono">{formatVnd(Math.round(b.cost_per_basket))}</td>
                <td style={{ color: '#94a3b8' }}>{b.note || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {show && (
        <div className="modal-overlay" onClick={() => setShow(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h2>Tạo mẻ xử lý</h2>
            {err && <div className="error-banner">{err}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Chọn phiếu nhập</label>
                <select required value={receiptId} onChange={e => {
                  setReceiptId(e.target.value);
                  const r = receipts.find(r => r.id === e.target.value);
                  if (r) setInputKg(String(r.raw_weight_kg));
                }}>
                  <option value="">-- Chọn --</option>
                  {receipts.map(r => (
                    <option key={r.id} value={r.id}>
                      {formatDate(r.received_at)} — {r.raw_weight_kg}kg — {formatVnd(r.total_cost)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Kg đưa vào xử lý</label>
                <input type="number" step="0.1" min="0.1" required
                  placeholder="VD: 10"
                  value={inputKg} onChange={e => setInputKg(e.target.value)} />
                {selectedReceipt && (
                  <div className="hint">Phiếu nhập: {selectedReceipt.raw_weight_kg} kg</div>
                )}
              </div>
              <div className="form-group">
                <label>Số rổ ra được</label>
                <input type="number" min="1" required
                  placeholder="VD: 4"
                  value={outputBaskets} onChange={e => setOutputBaskets(e.target.value)} />
                {inputKg && outputBaskets && selectedReceipt && (
                  <div className="hint">
                    Chi phí ước tính: {formatVnd(Math.round(selectedReceipt.total_cost / parseInt(outputBaskets)))}/rổ
                  </div>
                )}
              </div>
              <div className="form-group">
                <label>Ghi chú</label>
                <input type="text" placeholder="VD: hàng nhỏ, chia nhiều rổ hơn bình thường"
                  value={note} onChange={e => setNote(e.target.value)} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShow(false)}>Hủy</button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? 'Đang lưu...' : 'Lưu mẻ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

// ── Tab: Chi phí gia vị ───────────────────────────────────────────────────────

function RecipeCostTab({ ingredientTypeId, recipeCost, onSaved }: {
  ingredientTypeId: string;
  recipeCost: ReturnType<typeof useIngredientDetail>['recipeCost'];
  onSaved: () => void;
}) {
  const [items, setItems] = useState<RecipeCostItem[]>(
    recipeCost?.items ?? [{ name: '', cost_amount: 0, note: '' }]
  );
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
  const [success, setSuccess] = useState(false);

  // Sync khi recipeCost load xong
  React.useEffect(() => {
    if (recipeCost?.items) setItems(recipeCost.items);
  }, [recipeCost]);

  function updateItem(i: number, field: keyof RecipeCostItem, value: string | number) {
    setItems(prev => prev.map((item, idx) => idx === i ? { ...item, [field]: value } : item));
  }
  function removeItem(i: number) {
    setItems(prev => prev.filter((_, idx) => idx !== i));
  }
  function addItem() {
    setItems(prev => [...prev, { name: '', cost_amount: 0, note: '' }]);
  }

  const total = items.reduce((s, item) => s + (Number(item.cost_amount) || 0), 0);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setErr(''); setSuccess(false);
    const res = await apiUpsertRecipeCost({ ingredient_type_id: ingredientTypeId, items });
    setSaving(false);
    if (res.success) { setSuccess(true); onSaved(); }
    else setErr(res.error ?? 'Lỗi không xác định');
  }

  return (
    <>
      <div className="section-header">
        <h2>Chi phí gia vị & nguyên liệu phụ</h2>
      </div>
      <div className="recipe-form-card">
        {err && <div className="error-banner">{err}</div>}
        {success && <div className="success-banner">Đã lưu chi phí gia vị</div>}
        <form onSubmit={handleSave}>
          <div className="recipe-items-list">
            <div className="recipe-item-row" style={{ marginBottom: 8 }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Tên nguyên liệu</span>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Chi phí/rổ (đ)</span>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Ghi chú</span>
              <span />
            </div>
            {items.map((item, i) => (
              <div key={i} className="recipe-item-row">
                <input
                  type="text" placeholder="VD: Tỏi"
                  value={item.name}
                  onChange={e => updateItem(i, 'name', e.target.value)}
                  required
                />
                <input
                  type="number" min="0" placeholder="3000"
                  value={item.cost_amount || ''}
                  onChange={e => updateItem(i, 'cost_amount', parseFloat(e.target.value) || 0)}
                />
                <input
                  type="text" placeholder="VD: ~50g"
                  value={item.note || ''}
                  onChange={e => updateItem(i, 'note', e.target.value)}
                />
                <button type="button" className="btn-remove" onClick={() => removeItem(i)}>×</button>
              </div>
            ))}
          </div>

          <button type="button" className="btn-add-row" onClick={addItem}>
            + Thêm nguyên liệu
          </button>

          {total > 0 && (
            <div className="recipe-total-row">
              Tổng chi phí phụ / rổ: <strong>{formatVnd(total)}</strong>
            </div>
          )}

          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Đang lưu...' : 'Lưu chi phí'}
          </button>
        </form>
      </div>
    </>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function IngredientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { ingredientType, receipts, batches, recipeCost, loading, error, refetch } = useIngredientDetail(id);
  const [tab, setTab] = useState<'receipts' | 'batches' | 'recipe'>('receipts');

  if (loading) {
    return (
      <div className="inv-loading">
        <div className="spinner" />
        <span>Đang tải...</span>
      </div>
    );
  }

  if (error) {
    return <div className="error-banner">Lỗi: {error}</div>;
  }

  const name = ingredientType?.name ?? id;
  const totalBaskets = batches.reduce((s, b) => s + b.output_baskets, 0);
  const avgWaste = batches.length > 0
    ? batches.reduce((s, b) => s + b.waste_percent, 0) / batches.length
    : 0;
  const latestCost = batches.length > 0 ? batches[0].cost_per_basket : 0;

  return (
    <div>
      <div className="detail-header">
        <div>
          <div className="breadcrumb">
            <Link href="/admin/inventory">Tồn kho</Link> / {name}
          </div>
          <h1>{name}</h1>
        </div>
        <Link href="/admin/inventory" className="btn-secondary">← Quay lại</Link>
      </div>

      <div className="detail-info-strip">
        {ingredientType && (
          <span className="info-chip">~<strong>{ingredientType.avg_kg_per_basket}</strong> kg/rổ</span>
        )}
        <span className="info-chip"><strong>{receipts.length}</strong> phiếu nhập</span>
        <span className="info-chip"><strong>{totalBaskets}</strong> rổ đã xử lý tổng</span>
        {avgWaste > 0 && (
          <span className="info-chip">Hao hụt TB: <strong>{avgWaste.toFixed(1)}%</strong></span>
        )}
        {latestCost > 0 && (
          <span className="info-chip">Chi phí sò/rổ gần nhất: <strong>{formatVnd(Math.round(latestCost))}</strong></span>
        )}
        {recipeCost && recipeCost.total_cost_per_basket > 0 && (
          <span className="info-chip">Chi phí gia vị/rổ: <strong>{formatVnd(Math.round(recipeCost.total_cost_per_basket))}</strong></span>
        )}
      </div>

      <div className="tabs">
        <button className={`tab-btn ${tab === 'receipts' ? 'active' : ''}`} onClick={() => setTab('receipts')}>
          Nhập hàng ({receipts.length})
        </button>
        <button className={`tab-btn ${tab === 'batches' ? 'active' : ''}`} onClick={() => setTab('batches')}>
          Mẻ xử lý ({batches.length})
        </button>
        <button className={`tab-btn ${tab === 'recipe' ? 'active' : ''}`} onClick={() => setTab('recipe')}>
          Chi phí gia vị
        </button>
      </div>

      {tab === 'receipts' && (
        <ReceiptsTab ingredientTypeId={id} receipts={receipts} onAdded={refetch} />
      )}
      {tab === 'batches' && (
        <BatchesTab
          ingredientTypeId={id}
          receipts={receipts}
          batches={batches}
          onAdded={refetch}
        />
      )}
      {tab === 'recipe' && (
        <RecipeCostTab ingredientTypeId={id} recipeCost={recipeCost} onSaved={refetch} />
      )}
    </div>
  );
}
