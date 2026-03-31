'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { getApiBaseOrThrow, getWebSocketUrl } from '@/lib/api';

export interface DuplicateInfo {
  table_number: number;
  order_id: string;
  quantity: number;
}

export interface KDSOrderItem {
  item_id: string;
  dish_id: string;
  title: string;
  quantity: number;
  price: number;
  status: 'pending' | 'cooking' | 'ready' | 'served';
  is_duplicate: boolean;
  duplicate_info?: DuplicateInfo[];
}

export interface KDSOrder {
  priority: number;
  order_id: string;
  order_type: 'dine_in' | 'takeaway';
  table_number: number;
  created_at: string;
  wait_minutes: number;
  status: string;
  items: KDSOrderItem[];
}

export interface DishSummary {
  dish_id: string;
  title: string;
  total_qty: number;
  tables: DuplicateInfo[];
}

export interface KDSBoard {
  orders: KDSOrder[];
  dish_summary: DishSummary[];
}

export function useKDSBoard() {
  const [board, setBoard]   = useState<KDSBoard>({ orders: [], dish_summary: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const fatalWsConfigErrorRef = useRef(false);

  const fetchBoard = useCallback(async () => {
    try {
      const apiBase = getApiBaseOrThrow();
      const res = await fetch(`${apiBase}/kitchen/board`);
      if (!res.ok) throw new Error('Không thể tải bếp board');
      const json = await res.json();
      setBoard(json.data ?? { orders: [], dish_summary: [] });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi không xác định');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBoard();

    const connect = () => {
      if (fatalWsConfigErrorRef.current) return;

      const ws = new WebSocket(getWebSocketUrl());
      wsRef.current = ws;
      ws.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data);
          const refreshOn = ['new_order', 'order_completed', 'order_confirmed', 'order_updated'];
          if (refreshOn.includes(msg.event)) fetchBoard();
        } catch {}
      };
      ws.onclose = () => {
        if (fatalWsConfigErrorRef.current) return;
        setTimeout(connect, 3000);
      };
    };

    try {
      connect();
    } catch (err) {
      fatalWsConfigErrorRef.current = true;
      setError(err instanceof Error ? err.message : 'Lỗi WebSocket không xác định');
      setLoading(false);
    }

    return () => wsRef.current?.close();
  }, [fetchBoard]);

  const completeOrder = useCallback(async (orderId: string) => {
    const apiBase = getApiBaseOrThrow();
    await fetch(`${apiBase}/kitchen/orders/${orderId}/complete`, { method: 'POST' });
  }, []);

  return { board, loading, error, completeOrder, refetch: fetchBoard };
}
