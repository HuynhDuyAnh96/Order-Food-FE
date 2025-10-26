// app/components/LayoutAdmin.tsx
import React from 'react';
import Sidebar from './SidebarAdmin';
import Header from './HeaderAdmin';
import '../style/layout.css';

type Props = {
  children: React.ReactNode;
};

export default function LayoutAdmin({ children }: Props) {
  return (
    <div className="admin-layout">
      <aside className="admin-sidebar" aria-label="Sidebar">
        <Sidebar />
      </aside>
      <div className="admin-main">
        <Header />
        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
}