



'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useOrders } from '../../../hooks/useOrders';
import './OrderItemsList.css';

interface ProductSummary {
  dish_id: string;
  title: string;
  totalQuantity: number;
  totalRevenue: number;
  price: number;
  orderCount: number;
  tableNumber: number;
  orderId: string; // Thêm orderId
  status: string;  // Thêm status
}

export default function OrderItemsList() {
  const { orders, loading, error } = useOrders();
  const [soundEnabled, setSoundEnabled] = useState(true);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      return;
    }

    wsRef.current = new WebSocket('ws://localhost:8080/api/ws');

    wsRef.current.onopen = () => {
      console.log('WebSocket connected');
    };

    wsRef.current.onmessage = (event) => {
      console.log('New order received:', event.data);
      const newOrder = JSON.parse(event.data);
      if (soundEnabled && newOrder.status === "pending") {
        playNotificationSound();
      }
    };

    wsRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    wsRef.current.onclose = (event) => {
      console.log('WebSocket disconnected:', event.code, event.reason);
      if (event.code !== 1000) {
        setTimeout(() => {
          if (!wsRef.current || wsRef.current.readyState === WebSocket.CLOSED) {
            console.log('Reconnecting...');
            wsRef.current = null;
          }
        }, 3000);
      }
    };

    return () => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }
    };
  }, [soundEnabled]);

  const playNotificationSound = () => {
    const audio = new Audio('/thongbao2.mp3');
    audio.volume = 0.5;
    audio.play().catch((error) => console.log('Error playing sound:', error));
  };

  const getProductSummary = (): ProductSummary[] => {
    const productMap = new Map<string, ProductSummary>();
    orders.forEach((order) => {
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach((item) => {
          const key = item.title || item.dish_id || 'Sản phẩm không xác định';
          const existing = productMap.get(key);

          let tableNum = parseInt(order.table_number as any, 10);
          if (isNaN(tableNum) || tableNum < 1 || tableNum > 20) tableNum = 0;

          if (existing) {
            existing.totalQuantity += item.quantity;
            existing.totalRevenue += item.price * item.quantity;
            existing.orderCount += 1;
            if (item.price !== existing.price) existing.price = item.price;
          } else {
            productMap.set(key, {
              dish_id: item.dish_id || '',
              title: item.title || 'Sản phẩm không xác định',
              totalQuantity: item.quantity,
              totalRevenue: item.price * item.quantity,
              price: item.price,
              orderCount: 1,
              tableNumber: tableNum > 0 ? tableNum : 0,
              orderId: order.id, // Gắn orderId
              status: order.status || 'pending', // Gắn status
            });
          }
        });
      }
    });

    return Array.from(productMap.values()).sort((a, b) => b.totalRevenue - a.totalRevenue);
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      let response;
      
      if (newStatus === "preparing") {
        // Sử dụng endpoint confirm cho việc xác nhận đơn hàng
        response = await fetch(`http://localhost:8080/api/orders/${orderId}/confirm`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
      } else {
        // Sử dụng endpoint PATCH cho các trạng thái khác
        response = await fetch(`http://localhost:8080/api/orders/${orderId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus }),
        });
      }

      if (response.ok) {
        alert(`Cập nhật trạng thái thành ${newStatus}!`);
        // Reload lại trang để cập nhật dữ liệu
        window.location.reload();
      } else {
        const errorData = await response.text();
        console.error('Error response:', errorData);
        alert(`Lỗi khi cập nhật trạng thái: ${response.status} - ${errorData}`);
      }
    } catch (error) {
      console.error('Network error:', error);
      alert('Lỗi kết nối mạng!');
    }
  };

  if (loading) {
    return (
      <div className="order-items-section">
        <div className="section-header">
          <h2 className="section-title">Danh sách món cần làm</h2>
        </div>
        <div className="loading-container">
          <div className="loading-spinner-large"></div>
          <p>Đang tải danh sách món...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="order-items-section">
        <div className="section-header">
          <h2 className="section-title">Danh sách món cần làm</h2>
        </div>
        <div className="error-container">
          <p>Không thể tải danh sách món: {error}</p>
        </div>
      </div>
    );
  }

  const productSummary = getProductSummary();

  return (
    <div className="order-items-section">
      <div className="section-header">
        <h2 className="section-title">Danh sách món cần làm</h2>
        <div className="section-stats">
          <span className="stat-item">
            <strong>{productSummary.length}</strong> món
          </span>
          <span className="stat-item">
            <strong>{productSummary.reduce((sum, p) => sum + p.totalQuantity, 0)}</strong> tổng số lượng
          </span>
        </div>
        <button onClick={() => setSoundEnabled(!soundEnabled)} className="ml-4 px-2 py-1 bg-gray-300 rounded text-sm">
          {soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
        </button>
      </div>

      {productSummary.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.7 15.3C4.3 15.7 4.6 16.5 5.1 16.5H17M17 13V17C17 18.1 17.9 19 19 19S21 18.1 21 17V13M9 19.5C9.8 19.5 10.5 20.2 10.5 21S9.8 22.5 9 22.5 7.5 21.8 7.5 21 8.2 19.5 9 19.5ZM20 19.5C20.8 19.5 21.5 20.2 21.5 21S20.8 22.5 20 22.5 18.5 21.8 18.5 21 19.2 19.5 20 19.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h3>Chưa có đơn hàng</h3>
          <p>Danh sách sẽ hiển thị khi có đơn mới</p>
        </div>
      ) : (
        <div className="products-grid">
          {productSummary.map((product, index) => (
            <div key={`${product.title}-${index}`} className="product-card">
              <div className="product-rank">#{index + 1}</div>
              <div className="product-info">
                <h3 className="product-title">{product.title || `Sản phẩm ${product.dish_id}`}</h3>
                <div className="product-meta">
                  {product.dish_id && <span className="product-id">ID: {product.dish_id}</span>}
                  <span className="product-price">{product.price.toLocaleString('vi-VN')}₫</span>
                </div>
              </div>
              <div className="product-stats">
                <div className="stat-row">
                  <span className="stat-label">Số lượng:</span>
                  <span className="stat-value quantity">{product.totalQuantity}</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">Bàn số:</span>
                  <span className="stat-value tables">{product.tableNumber || 'N/A'}</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">Trạng thái:</span>
                  <span className="stat-value">{product.status}</span>
                </div>
              </div>
              <div className="product-progress">
                <div className="progress-bar" style={{ width: `${(product.totalRevenue / Math.max(...productSummary.map((p) => p.totalRevenue))) * 100}%` }}></div>
              </div>
              <div className="mt-2 flex gap-2">
                {product.status === "pending" && (
                  <button
                    onClick={() => handleUpdateStatus(product.orderId, "preparing")}
                    className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Xác nhận (Preparing)
                  </button>
                )}
                {product.status === "preparing" && (
                  <button
                    onClick={() => handleUpdateStatus(product.orderId, "ready")}
                    className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    Hoàn thành (Ready)
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


