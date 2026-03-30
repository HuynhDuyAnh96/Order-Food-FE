'use client';
// app/components/LayoutAdmin.tsx
import React, { useState } from 'react';
import Sidebar from './SidebarAdmin';
import Header from './HeaderAdmin';
import '../style/layout.css';

type Props = {
  children: React.ReactNode;
};

export default function LayoutAdmin({ children }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="admin-layout">
      {/* Overlay khi sidebar mở trên mobile */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`admin-sidebar ${sidebarOpen ? 'sidebar-open' : ''}`} aria-label="Sidebar">
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </aside>

      <div className="admin-main">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
}
