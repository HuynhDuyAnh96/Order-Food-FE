// app/admin/dashboard/page.tsx
'use client';
import React from 'react';
import dynamic from 'next/dynamic';
import { useOrders } from '../../hooks/useOrders';
import OrderCard from './components/OrderItemsList';

const StatsCard = dynamic(() => import('./components/StatsCard'), { ssr: false });
const ChartPanel = dynamic(() => import('./components/ChartPanel'), { ssr: false });
const OrderItemsList = dynamic(() => import('./components/OrderItemsList'), { ssr: false });

// Icons for different stats
const OrdersIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 11H15M9 15H15M17 21H7C5.89543 21 5 20.1046 5 19V5C5 3.89543 5.89543 3 7 3H12.5858C12.851 3 13.1054 3.10536 13.2929 3.29289L19.7071 9.70711C19.8946 9.89464 20 10.149 20 10.4142V19C20 20.1046 19.1046 21 18 21H17Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const RevenueIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 1V23M17 5H9.5C8.57174 5 7.6815 5.36875 7.02513 6.02513C6.36875 6.6815 6 7.57174 6 8.5C6 9.42826 6.36875 10.3185 7.02513 10.9749C7.6815 11.6312 8.57174 12 9.5 12H14.5C15.4283 12 16.3185 12.3687 16.9749 13.0251C17.6312 13.6815 18 14.5717 18 15.5C18 16.4283 17.6312 17.3185 16.9749 17.9749C16.3185 18.6312 15.4283 19 14.5 19H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const PendingIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
    <polyline points="12,6 12,12 16,14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const AverageIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 20V10M12 20V4M6 20V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function DashboardPage() {
  const { orders, loading, error, stats } = useOrders();

  if (error) {
    return (
      <div className="error-message" style={{ 
        padding: '20px', 
        background: '#fee2e2', 
        border: '1px solid #fecaca', 
        borderRadius: '8px', 
        color: '#dc2626' 
      }}>
        <h3>Lỗi khi tải dữ liệu</h3>
        <p>{error}</p>
        <p>Vui lòng kiểm tra API server tại http://localhost:8080/api/orders</p>
      </div>
    );
  }

  return (
    <div className="dashboard-grid" style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
      gap: '24px',
      marginBottom: '32px'
    }}>
      <StatsCard 
        title="Tổng đơn hàng" 
        value={stats.totalOrders} 
        icon={<OrdersIcon />}
        color="blue"
        loading={loading}
      />
      <StatsCard 
        title="Tổng doanh thu" 
        value={stats.totalRevenue} 
        suffix="₫"
        icon={<RevenueIcon />}
        color="green"
        loading={loading}
      />
      <StatsCard 
        title="Đơn chờ xử lý" 
        value={stats.pendingOrders} 
        icon={<PendingIcon />}
        color="orange"
        loading={loading}
      />
      <StatsCard 
        title="Giá trị TB/đơn" 
        value={Math.round(stats.averageOrderValue)} 
        suffix="₫"
        icon={<AverageIcon />}
        color="purple"
        loading={loading}
      />
      
      {/* <div style={{ gridColumn: '1 / -1' }}>
        <ChartPanel />
      </div> */}
      
      <div style={{ gridColumn: '1 / -1' }}>
        <OrderItemsList />
      </div>
    </div>
  );
}