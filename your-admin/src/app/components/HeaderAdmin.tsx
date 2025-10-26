// app/components/HeaderAdmin.tsx
import React from 'react';

export default function Header() {
  return (
    <header className="header">
      <div className="left">Xin chào, Admin</div>
      <div className="right">
        <input placeholder="Tìm kiếm..." className="search" />
        <div className="avatar">A</div>
      </div>
    </header>
  );
}