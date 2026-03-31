import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Alert, RefreshControl, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getOrders, payOrder, Order } from '@/services/orderService';
import { formatPrice } from '@/utils/helpers';
import { API_BASE_URL } from '@/constants/api';

const WS_URL = API_BASE_URL.startsWith('https://')
  ? `wss://${API_BASE_URL.replace('https://', '')}/api/ws`
  : `ws://${API_BASE_URL.replace('http://', '')}/api/ws`;

const DINE_IN_TABLES = Array.from({ length: 20 }, (_, i) => i + 1);

// ── Loại trạng thái bàn ───────────────────────────────────────────────────────
type TableStatus = 'need_pay' | 'in_progress' | 'free';

function getTableStatus(tableOrders: Order[]): TableStatus {
  const active = tableOrders.filter(o => o.status !== 'paid' && o.status !== 'cancelled');
  if (active.length === 0) return 'free';
  const hasInProgress = active.some(o =>
    ['pending', 'preparing', 'ready'].includes(o.status)
  );
  return hasInProgress ? 'in_progress' : 'need_pay';
}

const STATUS_CFG = {
  need_pay:    { label: 'Đợi thanh toán', color: '#dc2626', bg: '#fef2f2', light: '#fee2e2' },
  in_progress: { label: 'Đang làm',       color: '#d97706', bg: '#fffbeb', light: '#fef3c7' },
  free:        { label: 'Trống',          color: '#059669', bg: '#f0fdf4', light: '#d1fae5' },
};

const ORDER_STATUS_LABEL: Record<string, string> = {
  pending:   'Đang chờ',
  preparing: 'Đang nấu',
  ready:     'Xong – mang ra',
  completed: 'Bếp hoàn thành',
  paid:      'Đã thanh toán',
  cancelled: 'Đã hủy',
};

// ── Component chính ───────────────────────────────────────────────────────────
export default function OrdersScreen() {
  const [orders, setOrders]           = useState<Order[]>([]);
  const [loading, setLoading]         = useState(true);
  const [refreshing, setRefreshing]   = useState(false);
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [paying, setPaying]           = useState<number | null>(null);
  const [payingTakeaway, setPayingTakeaway] = useState<string | null>(null);
  const [expandedTakeaway, setExpandedTakeaway] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const isMounted = useRef(true);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchOrders = useCallback(async () => {
    try {
      const data = await getOrders();
      if (!isMounted.current) return;
      setOrders(data);
    } catch (e) {
      console.error(e);
    } finally {
      if (isMounted.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  // ── WebSocket ─────────────────────────────────────────────────────────────
  useEffect(() => {
    isMounted.current = true;
    fetchOrders();

    const connect = () => {
      try {
        const ws = new WebSocket(WS_URL);
        wsRef.current = ws;
        ws.onmessage = (e) => {
          try {
            const msg = JSON.parse(e.data);
            if (['new_order','order_completed','order_paid','order_updated','order_confirmed'].includes(msg.event)) {
              fetchOrders();
            }
          } catch {}
        };
        ws.onerror = () => {};
        ws.onclose = () => { if (isMounted.current) setTimeout(connect, 3000); };
      } catch {}
    };
    connect();

    return () => {
      isMounted.current = false;
      wsRef.current?.close();
    };
  }, [fetchOrders]);

  // ── Thanh toán đơn mang về ────────────────────────────────────────────────
  const handlePayTakeaway = (order: Order) => {
    Alert.alert(
      'Xác nhận thanh toán',
      `Đơn mang về #${order.id.slice(-6).toUpperCase()} – ${formatPrice(order.total_price)}`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đã thu tiền ✓',
          onPress: async () => {
            setPayingTakeaway(order.id);
            await payOrder(order.id);
            setPayingTakeaway(null);
            setExpandedTakeaway(null);
            fetchOrders();
          },
        },
      ]
    );
  };

  // ── Thanh toán cả bàn ─────────────────────────────────────────────────────
  const handlePayTable = (tableNum: number) => {
    const completedOrders = orders.filter(
      o => o.table_number === tableNum && o.status === 'completed'
    );
    const tableTotal = completedOrders.reduce((sum, o) => sum + o.total_price, 0);
    Alert.alert(
      'Xác nhận thanh toán',
      `Bàn ${tableNum} – ${formatPrice(tableTotal)}`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đã thu tiền ✓',
          onPress: async () => {
            setPaying(tableNum);
            for (const order of completedOrders) {
              await payOrder(order.id);
            }
            setPaying(null);
            setSelectedTable(null);
            fetchOrders();
          },
        },
      ]
    );
  };

  const onRefresh = () => { setRefreshing(true); fetchOrders(); };
  const toggleTable = (t: number) =>
    setSelectedTable(prev => prev === t ? null : t);

  // ── Đơn mang về (table_number = 0 hoặc order_type = takeaway) ────────────
  const takeawayOrders = orders.filter(
    o => o.order_type === 'takeaway' || o.table_number === 0
  ).filter(o => o.status !== 'paid' && o.status !== 'cancelled');

  // ── Tính trạng thái từng bàn (chỉ dine_in) ───────────────────────────────
  const tableStatusMap = new Map<number, TableStatus>();
  DINE_IN_TABLES.forEach(t => {
    tableStatusMap.set(t, getTableStatus(orders.filter(o => o.table_number === t && o.order_type !== 'takeaway')));
  });

  const needPayTables    = DINE_IN_TABLES.filter(t => tableStatusMap.get(t) === 'need_pay');
  const inProgressTables = DINE_IN_TABLES.filter(t => tableStatusMap.get(t) === 'in_progress');
  const freeTables       = DINE_IN_TABLES.filter(t => tableStatusMap.get(t) === 'free');

  // Orders của bàn đang chọn (bỏ qua đã paid/cancelled)
  const selectedOrders = selectedTable
    ? orders
        .filter(o => o.table_number === selectedTable && o.status !== 'paid' && o.status !== 'cancelled')
        .sort((a, b) => (a.status === 'completed' ? -1 : b.status === 'completed' ? 1 : 0))
    : [];

  // ── Render ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" color="#e74c3c" />
      </View>
    );
  }

  return (
    <SafeAreaView style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.headerTitle}>Quản lý bàn</Text>
        <View style={s.headerBadges}>
          <View style={[s.hBadge, { backgroundColor: '#fef2f2' }]}>
            <View style={[s.dot, { backgroundColor: '#dc2626' }]} />
            <Text style={[s.hBadgeNum, { color: '#dc2626' }]}>{needPayTables.length}</Text>
          </View>
          <View style={[s.hBadge, { backgroundColor: '#fffbeb' }]}>
            <View style={[s.dot, { backgroundColor: '#f59e0b' }]} />
            <Text style={[s.hBadgeNum, { color: '#d97706' }]}>{inProgressTables.length}</Text>
          </View>
          <View style={[s.hBadge, { backgroundColor: '#f0fdf4' }]}>
            <View style={[s.dot, { backgroundColor: '#10b981' }]} />
            <Text style={[s.hBadgeNum, { color: '#059669' }]}>{freeTables.length}</Text>
          </View>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* ── Đơn mang về ──────────────────────────────────────────── */}
        {takeawayOrders.length > 0 && (
          <View style={[s.detail, { marginTop: 12, borderColor: '#6366f140' }]}>
            <Text style={[s.detailTitle, { color: '#6366f1' }]}>🥡 Mang về ({takeawayOrders.length} đơn)</Text>
            {takeawayOrders.map(order => {
              const isExpanded = expandedTakeaway === order.id;
              const isPaying = payingTakeaway === order.id;
              return (
                <View key={order.id}>
                  <TouchableOpacity
                    style={[s.card, isExpanded && { borderColor: '#6366f1', borderWidth: 1.5 }]}
                    onPress={() => setExpandedTakeaway(isExpanded ? null : order.id)}
                    activeOpacity={0.8}
                  >
                    <View style={s.cardMeta}>
                      <Text style={s.cardId}>#{order.id?.slice(-6).toUpperCase()}</Text>
                      <Text style={s.cardStatus}>{ORDER_STATUS_LABEL[order.status] ?? order.status}</Text>
                    </View>
                    <Text style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>
                      {order.items?.length} món · {formatPrice(order.total_price)}
                    </Text>
                  </TouchableOpacity>

                  {isExpanded && (
                    <View style={[s.card, { marginTop: -8, borderTopLeftRadius: 0, borderTopRightRadius: 0, borderColor: '#6366f1', borderWidth: 1.5, borderTopWidth: 0 }]}>
                      <View style={s.items}>
                        {order.items?.map((item, i) => (
                          <View key={i} style={s.itemRow}>
                            <Text style={s.itemName}>
                              {item.quantity}× {item.title}{item.is_custom ? ' 🔸' : ''}
                            </Text>
                            <Text style={s.itemPrice}>{formatPrice(item.price * item.quantity)}</Text>
                          </View>
                        ))}
                      </View>
                      <View style={s.tableFooter}>
                        <View>
                          <Text style={s.tableTotalLabel}>Tổng đơn</Text>
                          <Text style={s.tableTotal}>{formatPrice(order.total_price)}</Text>
                        </View>
                        {(order.status === 'ready' || order.status === 'completed') ? (
                          <TouchableOpacity
                            style={[s.payBtn, { backgroundColor: '#6366f1' }, isPaying && s.payBtnDisabled]}
                            onPress={() => handlePayTakeaway(order)}
                            disabled={isPaying}
                          >
                            {isPaying
                              ? <ActivityIndicator size="small" color="#fff" />
                              : <Text style={s.payBtnText}>Đã thu tiền</Text>
                            }
                          </TouchableOpacity>
                        ) : (
                          <View style={[s.payBtn, { backgroundColor: '#d1d5db' }]}>
                            <Text style={[s.payBtnText, { color: '#6b7280' }]}>Chờ bếp</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {/* ── Nhóm bàn ─────────────────────────────────────────────── */}
        <TableGroup
          title="💳 Đợi thanh toán"
          tables={needPayTables}
          statusKey="need_pay"
          selected={selectedTable}
          onSelect={toggleTable}
        />
        <TableGroup
          title="🔥 Đang làm"
          tables={inProgressTables}
          statusKey="in_progress"
          selected={selectedTable}
          onSelect={toggleTable}
        />
        <TableGroup
          title="✅ Trống"
          tables={freeTables}
          statusKey="free"
          selected={selectedTable}
          onSelect={toggleTable}
        />

        {/* ── Chi tiết bàn đang chọn ────────────────────────────────── */}
        {selectedTable !== null && (() => {
          const tableTotal = selectedOrders.reduce((sum, o) => sum + o.total_price, 0);
          const hasCompleted = selectedOrders.some(o => o.status === 'completed');
          return (
            <View style={s.detail}>
              <Text style={s.detailTitle}>Chi tiết Bàn {selectedTable}</Text>

              {selectedOrders.length === 0 ? (
                <Text style={s.detailEmpty}>Không có đơn đang hoạt động</Text>
              ) : (
                <>
                  {selectedOrders.map(order => (
                    <View key={order.id} style={s.card}>
                      <View style={s.cardMeta}>
                        <Text style={s.cardId}>#{order.id?.slice(-6).toUpperCase()}</Text>
                        <Text style={s.cardStatus}>{ORDER_STATUS_LABEL[order.status] ?? order.status}</Text>
                      </View>
                      <View style={s.items}>
                        {order.items?.map((item, i) => (
                          <View key={i} style={s.itemRow}>
                            <Text style={s.itemName}>
                              {item.quantity}× {item.title}
                              {item.is_custom ? ' 🔸' : ''}
                            </Text>
                            <Text style={s.itemPrice}>{formatPrice(item.price * item.quantity)}</Text>
                          </View>
                        ))}
                      </View>
                      <Text style={s.orderSubtotal}>{formatPrice(order.total_price)}</Text>
                    </View>
                  ))}

                  <View style={s.tableFooter}>
                    <View>
                      <Text style={s.tableTotalLabel}>Tổng bàn</Text>
                      <Text style={s.tableTotal}>{formatPrice(tableTotal)}</Text>
                    </View>
                    {hasCompleted && (
                      <TouchableOpacity
                        style={[s.payBtn, paying === selectedTable && s.payBtnDisabled]}
                        onPress={() => handlePayTable(selectedTable)}
                        disabled={paying === selectedTable}
                      >
                        {paying === selectedTable
                          ? <ActivityIndicator size="small" color="#fff" />
                          : <Text style={s.payBtnText}>Đã thanh toán</Text>
                        }
                      </TouchableOpacity>
                    )}
                  </View>
                </>
              )}
            </View>
          );
        })()}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ── TableGroup ────────────────────────────────────────────────────────────────
function TableGroup({
  title, tables, statusKey, selected, onSelect,
}: {
  title: string;
  tables: number[];
  statusKey: TableStatus;
  selected: number | null;
  onSelect: (t: number) => void;
}) {
  const cfg = STATUS_CFG[statusKey];
  return (
    <View style={[g.section, { borderColor: cfg.color + '40' }]}>
      <View style={g.header}>
        <Text style={g.title}>{title}</Text>
        <Text style={[g.count, { color: cfg.color }]}>{tables.length} bàn</Text>
      </View>
      {tables.length === 0 ? (
        <Text style={g.empty}>—</Text>
      ) : (
        <View style={g.grid}>
          {tables.map(t => {
            const isSelected = selected === t;
            return (
              <TouchableOpacity
                key={t}
                style={[
                  g.btn,
                  { borderColor: cfg.color },
                  isSelected
                    ? { backgroundColor: cfg.color }
                    : { backgroundColor: cfg.bg },
                ]}
                onPress={() => onSelect(t)}
              >
                <Text style={[g.btnText, { color: isSelected ? '#fff' : cfg.color }]}>
                  {t}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  center:    { flex: 1, justifyContent: 'center', alignItems: 'center' },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb',
  },
  headerTitle:  { fontSize: 20, fontWeight: 'bold', color: '#1f2937' },
  headerBadges: { flexDirection: 'row', gap: 6 },
  hBadge:       { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 16 },
  dot:          { width: 7, height: 7, borderRadius: 4 },
  hBadgeNum:    { fontSize: 13, fontWeight: '700' },

  detail: {
    marginHorizontal: 16, marginTop: 4, marginBottom: 8,
    backgroundColor: '#fff', borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: '#e5e7eb',
  },
  detailTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 12 },
  detailEmpty: { fontSize: 14, color: '#9ca3af', textAlign: 'center', paddingVertical: 12 },

  card: {
    backgroundColor: '#f9fafb', borderRadius: 10, padding: 12,
    marginBottom: 10, borderWidth: 1, borderColor: '#e5e7eb',
  },
  cardPay:     { borderColor: '#8b5cf6', borderWidth: 1.5, backgroundColor: '#faf5ff' },
  payFlag:     { backgroundColor: '#ede9fe', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start', marginBottom: 8 },
  payFlagText: { fontSize: 11, fontWeight: '700', color: '#6d28d9' },
  cardMeta:    { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  cardId:      { fontSize: 13, fontWeight: '700', color: '#111827' },
  cardStatus:  { fontSize: 12, color: '#6b7280' },

  items:    { marginBottom: 8 },
  itemRow:  { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 2 },
  itemName: { fontSize: 13, color: '#374151', flex: 1 },
  itemPrice:{ fontSize: 13, color: '#6b7280' },

  cardFooter: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderTopWidth: 1, borderTopColor: '#e5e7eb', paddingTop: 8,
  },
  total:          { fontSize: 16, fontWeight: '800', color: '#e11d48' },
  orderSubtotal:  { fontSize: 13, fontWeight: '700', color: '#6b7280', textAlign: 'right', marginTop: 4 },
  tableFooter:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1.5, borderTopColor: '#e5e7eb', paddingTop: 12, marginTop: 4 },
  tableTotalLabel:{ fontSize: 12, color: '#6b7280', marginBottom: 2 },
  tableTotal:     { fontSize: 18, fontWeight: '800', color: '#e11d48' },
  payBtn:         { backgroundColor: '#7c3aed', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 9, minWidth: 110, alignItems: 'center' },
  payBtnDisabled: { backgroundColor: '#c4b5fd' },
  payBtnText:     { color: '#fff', fontSize: 13, fontWeight: '700' },
});

const g = StyleSheet.create({
  section: {
    marginHorizontal: 16, marginTop: 12,
    backgroundColor: '#fff', borderRadius: 14, padding: 14,
    borderWidth: 1,
  },
  header:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  title:   { fontSize: 14, fontWeight: '700', color: '#111827' },
  count:   { fontSize: 12, fontWeight: '600' },
  empty:   { fontSize: 14, color: '#d1d5db' },
  grid:    { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  btn:     { width: 48, height: 48, borderRadius: 10, borderWidth: 1.5, justifyContent: 'center', alignItems: 'center' },
  btnText: { fontSize: 15, fontWeight: '800' },
});
