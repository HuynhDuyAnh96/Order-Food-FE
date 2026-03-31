'use client';

// hooks/useOrders.ts
import { useState, useEffect, useCallback } from 'react';
import { getApiBaseOrThrow } from '@/lib/api';

export interface OrderItem {
  dish_id: string;
  quantity: number;
  price: number;
  title: string;
}

export interface Order {
  id: string;
  user_id: string;
  table_number: number;
  total_price: number;
  status: string;
  created_at: string;
  items: OrderItem[];
}

export interface OrderStats {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  averageOrderValue: number;
}

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const apiBase = getApiBaseOrThrow();
      const response = await fetch(`${apiBase}/orders`);
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      const result = await response.json();
      // API trả về { data: [...], success: true }
      const ordersData = result.data || [];
      setOrders(ordersData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();

    // Fallback polling 60s - WS xử lý real-time chính
    const interval = setInterval(fetchOrders, 60000);

    return () => clearInterval(interval);
  }, [fetchOrders]);

  const stats: OrderStats = {
    totalOrders: orders.length,
    totalRevenue: orders.reduce((sum, order) => sum + order.total_price, 0),
    pendingOrders: orders.filter(order => order.status === 'pending').length,
    averageOrderValue: orders.length > 0 
      ? orders.reduce((sum, order) => sum + order.total_price, 0) / orders.length 
      : 0
  };

  return { orders, loading, error, stats, refetch: fetchOrders };
}
