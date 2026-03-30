// app/components/HeaderAdmin.tsx
import React from 'react';

type Props = {
  onMenuClick: () => void;
};

export default function Header({ onMenuClick }: Props) {
  return (
    <header className="header">
      <div className="left">
        <button className="menu-btn" onClick={onMenuClick} aria-label="Mở menu">
          ☰
        </button>
        <span>Xin chào, Admin</span>
      </div>
      <div className="right">
        <input placeholder="Tìm kiếm..." className="search" />
        <div className="avatar">A</div>
      </div>
    </header>
  );
}
