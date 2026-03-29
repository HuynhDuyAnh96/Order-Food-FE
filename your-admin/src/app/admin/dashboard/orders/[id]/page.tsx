'use client';
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { apiBase } from '@/lib/api';
import './order-detail.css';

interface OrderItem {
  dish_id: string;
  quantity: number;
  price: number;
  title: string;
}

interface Order {
  id: string;
  user_id: string;
  table_number: number;
  total_price: number;
  status: string;
  created_at: string;
  updated_at?: string;
  items: OrderItem[];
}

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${apiBase}/orders`);
        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }
        const result = await response.json();
        const orders: Order[] = result.data || [];
        const foundOrder = orders.find((o) => o.id === orderId);
        
        if (!foundOrder) {
          setError('Không tìm thấy đơn hàng');
        } else {
          setOrder(foundOrder);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
        console.error('Error fetching order:', err);
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const handleUpdateStatus = async (newStatus: string) => {
    if (!order) return;

    try {
      setUpdating(true);
      let response;

      if (newStatus === 'preparing') {
        response = await fetch(`${apiBase}/orders/${orderId}/confirm`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
      } else {
        response = await fetch(`${apiBase}/orders/${orderId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus }),
        });
      }

      if (response.ok) {
        const result = await response.json();
        if (result.data) {
          setOrder(result.data);
        } else {
          // Refetch order
          const ordersResponse = await fetch(`${apiBase}/orders`);
          const ordersResult = await ordersResponse.json();
          const orders: Order[] = ordersResult.data || [];
          const updatedOrder = orders.find((o) => o.id === orderId);
          if (updatedOrder) {
            setOrder(updatedOrder);
          }
        }
        alert(`Đã cập nhật trạng thái thành ${getStatusLabel(newStatus)}!`);
      } else {
        const errorData = await response.text();
        alert(`Lỗi: ${errorData}`);
      }
    } catch (error) {
      console.error('Network error:', error);
      alert('Lỗi kết nối mạng!');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#f59e0b';
      case 'preparing':
        return '#3b82f6';
      case 'ready':
        return '#10b981';
      case 'completed':
        return '#6b7280';
      case 'cancelled':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'Chờ xử lý',
      preparing: 'Đang chuẩn bị',
      ready: 'Sẵn sàng',
      completed: 'Hoàn thành',
      cancelled: 'Đã hủy',
    };
    return labels[status] || status;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price) + '₫';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="order-detail-container">
        <div className="loading-container">
          <div className="loading-spinner-large"></div>
          <p>Đang tải thông tin đơn hàng...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="order-detail-container">
        <div className="error-container">
          <h2>Lỗi</h2>
          <p>{error || 'Không tìm thấy đơn hàng'}</p>
          <Link href="/admin/dashboard" className="back-button">
            ← Quay lại Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="order-detail-container">
      <div className="order-detail-header">
        <Link href="/admin/dashboard" className="back-link">
          ← Quay lại Dashboard
        </Link>
        <h1 className="order-detail-title">Chi tiết đơn hàng</h1>
      </div>

      <div className="order-detail-content">
        {/* Order Info Card */}
        <div className="order-info-card">
          <div className="card-header">
            <div className="order-id-section">
              <span className="order-id-label">Mã đơn hàng</span>
              <span className="order-id-value">#{order.id}</span>
            </div>
            <div
              className="status-badge-large"
              style={{ backgroundColor: getStatusColor(order.status) }}
            >
              {getStatusLabel(order.status)}
            </div>
          </div>

          <div className="order-info-grid">
            <div className="info-item">
              <span className="info-label">Bàn số</span>
              <span className="info-value">Bàn {order.table_number}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Người đặt</span>
              <span className="info-value">{order.user_id || 'Khách'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Thời gian tạo</span>
              <span className="info-value">{formatDate(order.created_at)}</span>
            </div>
            {order.updated_at && (
              <div className="info-item">
                <span className="info-label">Cập nhật lần cuối</span>
                <span className="info-value">{formatDate(order.updated_at)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Order Items Card */}
        <div className="order-items-card">
          <h2 className="card-title">Danh sách món ăn</h2>
          <div className="items-table">
            <div className="items-table-header">
              <div className="table-col-name">Tên món</div>
              <div className="table-col-quantity">Số lượng</div>
              <div className="table-col-price">Đơn giá</div>
              <div className="table-col-total">Thành tiền</div>
            </div>
            {order.items.map((item, index) => (
              <div key={index} className="items-table-row">
                <div className="table-col-name">
                  <span className="item-name">{item.title}</span>
                  {item.dish_id && (
                    <span className="item-id">ID: {item.dish_id}</span>
                  )}
                </div>
                <div className="table-col-quantity">{item.quantity}</div>
                <div className="table-col-price">{formatPrice(item.price)}</div>
                <div className="table-col-total">
                  {formatPrice(item.price * item.quantity)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary Card */}
        <div className="order-summary-card">
          <div className="summary-row">
            <span className="summary-label">Tổng số món:</span>
            <span className="summary-value">{order.items.length} món</span>
          </div>
          <div className="summary-row">
            <span className="summary-label">Tổng số lượng:</span>
            <span className="summary-value">
              {order.items.reduce((sum, item) => sum + item.quantity, 0)} phần
            </span>
          </div>
          <div className="summary-row total-row">
            <span className="summary-label">Tổng cộng:</span>
            <span className="summary-value total-amount">
              {formatPrice(order.total_price)}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="order-actions">
          {order.status === 'pending' && (
            <button
              className="action-btn action-btn-primary"
              onClick={() => handleUpdateStatus('preparing')}
              disabled={updating}
            >
              {updating ? 'Đang xử lý...' : 'Xác nhận đơn hàng (Preparing)'}
            </button>
          )}
          {order.status === 'preparing' && (
            <button
              className="action-btn action-btn-success"
              onClick={() => handleUpdateStatus('ready')}
              disabled={updating}
            >
              {updating ? 'Đang xử lý...' : 'Hoàn thành (Ready)'}
            </button>
          )}
          {order.status === 'ready' && (
            <button
              className="action-btn action-btn-success"
              onClick={() => handleUpdateStatus('completed')}
              disabled={updating}
            >
              {updating ? 'Đang xử lý...' : 'Đánh dấu hoàn thành'}
            </button>
          )}
          {order.status !== 'completed' && order.status !== 'cancelled' && (
            <button
              className="action-btn action-btn-danger"
              onClick={() => {
                if (confirm('Bạn có chắc muốn hủy đơn hàng này?')) {
                  handleUpdateStatus('cancelled');
                }
              }}
              disabled={updating}
            >
              {updating ? 'Đang xử lý...' : 'Hủy đơn hàng'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
