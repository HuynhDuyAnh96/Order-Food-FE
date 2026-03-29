'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { useOrders } from '../../../hooks/useOrders';
import './OrdersList.css';

export default function OrdersList() {
  const { orders, loading, error } = useOrders();
  const router = useRouter();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#f59e0b'; // orange
      case 'preparing':
        return '#3b82f6'; // blue
      case 'ready':
        return '#10b981'; // green
      case 'completed':
        return '#6b7280'; // gray
      case 'cancelled':
        return '#ef4444'; // red
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
    });
  };

  const handleViewDetail = (orderId: string) => {
    router.push(`/admin/dashboard/orders/${orderId}`);
  };

  if (loading) {
    return (
      <div className="orders-list-section">
        <div className="section-header">
          <h2 className="section-title">Danh sách đơn hàng</h2>
        </div>
        <div className="loading-container">
          <div className="loading-spinner-large"></div>
          <p>Đang tải danh sách đơn hàng...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="orders-list-section">
        <div className="section-header">
          <h2 className="section-title">Danh sách đơn hàng</h2>
        </div>
        <div className="error-container">
          <p>Không thể tải danh sách đơn hàng: {error}</p>
        </div>
      </div>
    );
  }

  // Sắp xếp orders: pending trước, sau đó theo thời gian mới nhất
  const sortedOrders = [...orders].sort((a, b) => {
    if (a.status === 'pending' && b.status !== 'pending') return -1;
    if (a.status !== 'pending' && b.status === 'pending') return 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <div className="orders-list-section">
      <div className="section-header">
        <h2 className="section-title">Danh sách đơn hàng</h2>
        <div className="section-stats">
          <span className="stat-item">
            <strong>{orders.length}</strong> đơn hàng
          </span>
          <span className="stat-item">
            <strong>{orders.filter(o => o.status === 'pending').length}</strong> chờ xử lý
          </span>
        </div>
      </div>

      {sortedOrders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15M9 5C9 6.10457 9.89543 7 11 7H13C14.1046 7 15 6.10457 15 5M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5M12 12H15M12 16H15M9 12H9.01M9 16H9.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h3>Chưa có đơn hàng</h3>
          <p>Danh sách sẽ hiển thị khi có đơn mới</p>
        </div>
      ) : (
        <div className="orders-grid">
          {sortedOrders.map((order) => (
            <div key={order.id} className="order-card" onClick={() => handleViewDetail(order.id)}>
              <div className="order-card-header">
                <div className="order-id">
                  <span className="order-id-label">Đơn hàng</span>
                  <span className="order-id-value">#{order.id.slice(-8)}</span>
                </div>
                <div
                  className="order-status-badge"
                  style={{ backgroundColor: getStatusColor(order.status) }}
                >
                  {getStatusLabel(order.status)}
                </div>
              </div>

              <div className="order-info">
                <div className="order-info-row">
                  <span className="order-info-label">Bàn số:</span>
                  <span className="order-info-value">Bàn {order.table_number}</span>
                </div>
                <div className="order-info-row">
                  <span className="order-info-label">Thời gian:</span>
                  <span className="order-info-value">{formatDate(order.created_at)}</span>
                </div>
                <div className="order-info-row">
                  <span className="order-info-label">Số món:</span>
                  <span className="order-info-value">{order.items?.length || 0} món</span>
                </div>
              </div>

              <div className="order-items-preview">
                {order.items?.slice(0, 3).map((item, idx) => (
                  <div key={idx} className="order-item-preview">
                    <span className="item-name">{item.title}</span>
                    <span className="item-quantity">x{item.quantity}</span>
                  </div>
                ))}
                {order.items && order.items.length > 3 && (
                  <div className="order-item-preview">
                    <span className="item-more">+{order.items.length - 3} món khác</span>
                  </div>
                )}
              </div>

              <div className="order-footer">
                <div className="order-total">
                  <span className="order-total-label">Tổng cộng:</span>
                  <span className="order-total-value">{formatPrice(order.total_price)}</span>
                </div>
                <button className="view-detail-btn">
                  Xem chi tiết →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
