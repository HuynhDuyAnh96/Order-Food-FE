'use client';
import React, { useState } from 'react';
import './sessions.css';
import {
  useSessions,
  apiOpenSession,
  apiCloseSession,
  type EveningSession,
  type IngredientType,
} from '../../../hooks/useInventory';

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(s: string) {
  return new Date(s).toLocaleDateString('vi-VN', {
    weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric',
  });
}
function formatTime(s: string) {
  return new Date(s).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}
function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

// ── Active Session Card ───────────────────────────────────────────────────────

function ActiveSessionCard({
  session,
  onClosed,
}: {
  session: EveningSession;
  onClosed: () => void;
}) {
  const [showClose, setShowClose] = useState(false);
  const [usage, setUsage] = useState(
    session.usage.map(u => ({ ...u, used_baskets: 0, wasted_baskets: 0 }))
  );
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  function updateUsed(i: number, val: number)   { setUsage(prev => prev.map((u, idx) => idx === i ? { ...u, used_baskets: val } : u)); }
  function updateWasted(i: number, val: number) { setUsage(prev => prev.map((u, idx) => idx === i ? { ...u, wasted_baskets: val } : u)); }

  async function handleClose(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setErr('');
    const res = await apiCloseSession(session.id, { usage, note });
    setSaving(false);
    if (res.success) { setShowClose(false); onClosed(); }
    else setErr(res.error ?? 'Lỗi không xác định');
  }

  return (
    <>
      <div className="active-session-card">
        <div className="session-label">Ca đang mở</div>
        <h2>🌙 {formatDate(session.opened_at)}</h2>
        <div className="session-usage-grid">
          {session.usage.map((u, i) => (
            <div key={i} className="session-usage-item">
              <div className="usage-name">{u.ingredient_name}</div>
              <div className="usage-value">{u.planned_baskets}</div>
              <div className="usage-sub">rổ chuẩn bị</div>
            </div>
          ))}
        </div>
        <div className="active-session-actions">
          <button className="btn-success" onClick={() => setShowClose(true)}>
            Đóng ca & nhập kết quả
          </button>
          <span style={{ color: '#94a3b8', fontSize: '0.8rem', alignSelf: 'center' }}>
            Mở lúc {formatTime(session.opened_at)}
          </span>
        </div>
      </div>

      {showClose && (
        <div className="modal-overlay" onClick={() => setShowClose(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h2>Đóng ca — nhập kết quả thực tế</h2>
            {err && <div className="error-banner">{err}</div>}
            <form onSubmit={handleClose}>
              <div className="close-usage-grid">
                {usage.map((u, i) => (
                  <div key={i} className="close-usage-row">
                    <div className="row-label">{u.ingredient_name}</div>
                    <div className="close-usage-inputs">
                      <div>
                        <label>Đã bán (rổ)</label>
                        <input
                          type="number" min="0"
                          value={u.used_baskets}
                          onChange={e => updateUsed(i, parseInt(e.target.value) || 0)}
                        />
                        <div className="planned-badge">
                          Chuẩn bị: {u.planned_baskets} rổ
                          {u.used_baskets > u.planned_baskets && (
                            <span style={{ color: '#f59e0b', marginLeft: 6 }}>
                              +{u.used_baskets - u.planned_baskets} ngoài kế hoạch
                            </span>
                          )}
                        </div>
                      </div>
                      <div>
                        <label>Dư / hỏng (rổ)</label>
                        <input
                          type="number" min="0"
                          value={u.wasted_baskets}
                          onChange={e => updateWasted(i, parseInt(e.target.value) || 0)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="form-group">
                <label>Ghi chú ca</label>
                <input type="text" placeholder="VD: Đông khách, bán hết sớm"
                  value={note} onChange={e => setNote(e.target.value)} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowClose(false)}>Hủy</button>
                <button type="submit" className="btn-success" disabled={saving}>
                  {saving ? 'Đang lưu...' : 'Đóng ca'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

// ── Open Session Modal ────────────────────────────────────────────────────────

function OpenSessionModal({
  ingredientTypes,
  onCreated,
  onClose,
}: {
  ingredientTypes: IngredientType[];
  onCreated: () => void;
  onClose: () => void;
}) {
  const [date, setDate] = useState(todayStr());
  const [planned, setPlanned] = useState<Record<string, number>>({});
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  function setVal(id: string, val: number) {
    setPlanned(prev => ({ ...prev, [id]: val }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setErr('');
    const usage = ingredientTypes
      .filter(t => (planned[t.id] ?? 0) > 0)
      .map(t => ({
        ingredient_type_id: t.id,
        ingredient_name: t.name,
        planned_baskets: planned[t.id] ?? 0,
        used_baskets: 0,
        wasted_baskets: 0,
      }));
    if (usage.length === 0) {
      setErr('Cần nhập ít nhất 1 loại với số rổ > 0');
      setSaving(false);
      return;
    }
    const res = await apiOpenSession({ date, usage, note });
    setSaving(false);
    if (res.success) { onCreated(); onClose(); }
    else setErr(res.error ?? 'Lỗi không xác định');
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <h2>🌙 Mở ca bán tối</h2>
        {err && <div className="error-banner">{err}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Ngày</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} required />
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#374151', marginBottom: 10 }}>
              Chuẩn bị bao nhiêu rổ mỗi loại tối nay?
            </div>
            {ingredientTypes.length === 0 && (
              <div style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                Chưa có loại nguyên liệu. Vào Tồn kho → Thêm loại trước.
              </div>
            )}
            {ingredientTypes.map(t => (
              <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                <span style={{ flex: 1, fontWeight: 600, color: '#1e293b', fontSize: '0.9rem' }}>{t.name}</span>
                <input
                  type="number" min="0" placeholder="0"
                  style={{ width: 80, padding: '8px 10px', border: '1px solid #e5e7eb', borderRadius: 8, textAlign: 'center', fontSize: '1rem', fontWeight: 700 }}
                  value={planned[t.id] ?? ''}
                  onChange={e => setVal(t.id, parseInt(e.target.value) || 0)}
                />
                <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>rổ</span>
              </div>
            ))}
          </div>

          <div className="form-group">
            <label>Ghi chú (tùy chọn)</label>
            <input type="text" placeholder="VD: Thứ 7, dự báo đông khách"
              value={note} onChange={e => setNote(e.target.value)} />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Hủy</button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Đang mở ca...' : 'Mở ca'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Session History Table ─────────────────────────────────────────────────────

function SessionHistoryTable({ sessions }: { sessions: EveningSession[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div>
      <div className="section-header">
        <h2>Lịch sử ca bán ({sessions.length})</h2>
      </div>
      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Ngày</th>
              <th>Trạng thái</th>
              <th>Chuẩn bị</th>
              <th>Đã bán</th>
              <th>Mở lúc</th>
              <th>Đóng lúc</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {sessions.length === 0 && (
              <tr><td colSpan={7} className="table-empty">Chưa có ca nào</td></tr>
            )}
            {sessions.map(sess => {
              const totalPlanned = sess.usage.reduce((s, u) => s + u.planned_baskets, 0);
              const totalUsed    = sess.usage.reduce((s, u) => s + u.used_baskets, 0);
              const isExpanded   = expandedId === sess.id;
              return (
                <React.Fragment key={sess.id}>
                  <tr>
                    <td><div className="td-main">{formatDate(sess.opened_at)}</div></td>
                    <td>
                      <span className={`sess-badge ${sess.status}`}>
                        {sess.status === 'open' ? '🟡 Đang mở' : '✓ Đã đóng'}
                      </span>
                    </td>
                    <td>{totalPlanned} rổ</td>
                    <td><strong>{totalUsed} rổ</strong></td>
                    <td>{formatTime(sess.opened_at)}</td>
                    <td>{sess.closed_at ? formatTime(sess.closed_at) : '—'}</td>
                    <td>
                      <button
                        className="btn-secondary"
                        style={{ padding: '5px 10px', fontSize: '0.78rem' }}
                        onClick={() => setExpandedId(isExpanded ? null : sess.id)}
                      >
                        {isExpanded ? 'Thu lại' : 'Chi tiết'}
                      </button>
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr>
                      <td colSpan={7} style={{ background: '#f8fafc', padding: '12px 16px' }}>
                        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                          {sess.usage.map((u, i) => (
                            <div key={i} style={{
                              background: 'white',
                              border: '1px solid #e5e7eb',
                              borderRadius: 8,
                              padding: '10px 14px',
                              minWidth: 130,
                            }}>
                              <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{u.ingredient_name}</div>
                              <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 4 }}>
                                Chuẩn bị: {u.planned_baskets} rổ
                              </div>
                              <div style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 600 }}>
                                Đã bán: {u.used_baskets} rổ
                              </div>
                              {u.wasted_baskets > 0 && (
                                <div style={{ fontSize: '0.8rem', color: '#f59e0b' }}>
                                  Dư/hỏng: {u.wasted_baskets} rổ
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                        {sess.note && (
                          <div style={{ marginTop: 10, fontSize: '0.82rem', color: '#64748b' }}>
                            Ghi chú: {sess.note}
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function SessionsPage() {
  const { sessions, currentSession, ingredientTypes, loading, error, refetch } = useSessions();
  const [showOpen, setShowOpen] = useState(false);

  if (loading) {
    return (
      <div className="inv-loading">
        <div className="spinner" />
        <span>Đang tải ca...</span>
      </div>
    );
  }
  if (error) {
    return <div className="error-banner">Lỗi: {error}</div>;
  }

  return (
    <div>
      <div className="sess-header">
        <div>
          <h1>🌙 Ca bán tối</h1>
          <p>Quản lý rổ chuẩn bị và kết quả bán mỗi ca</p>
        </div>
        {!currentSession && (
          <button className="btn-primary" onClick={() => setShowOpen(true)}>
            + Mở ca tối nay
          </button>
        )}
      </div>

      {currentSession ? (
        <ActiveSessionCard session={currentSession} onClosed={refetch} />
      ) : (
        <div className="no-session-card">
          <div className="icon">🌙</div>
          <h3>Chưa có ca nào đang mở</h3>
          <p>Mở ca để bắt đầu theo dõi rổ bán tối nay</p>
          <button className="btn-primary" style={{ marginTop: 16 }} onClick={() => setShowOpen(true)}>
            + Mở ca tối nay
          </button>
        </div>
      )}

      <SessionHistoryTable sessions={sessions} />

      {showOpen && (
        <OpenSessionModal
          ingredientTypes={ingredientTypes}
          onCreated={refetch}
          onClose={() => setShowOpen(false)}
        />
      )}
    </div>
  );
}
