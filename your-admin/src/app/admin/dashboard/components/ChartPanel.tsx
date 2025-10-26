// app/components/dashboard/ChartPanel.tsx
import React from 'react';
// Bạn có thể dùng Chart.js, Recharts hoặc ApexCharts
export default function ChartPanel() {
  return (
    <div className="card">
      <div className="card-title">Biểu đồ hoạt động</div>
      <div className="chart-placeholder">Biểu đồ ở đây</div>
    </div>
  );
}