// app/components/SidebarAdmin.tsx
import Link from 'next/link';
import React from 'react';

const links = [
  { href: '/admin/dashboard', label: 'Dashboard' },
  { href: '/admin/kitchen',   label: '🍳 Bếp Board' },
  { href: '/admin/users',     label: 'Người dùng' },
];

type Props = {
  onClose: () => void;
};

export default function Sidebar({ onClose }: Props) {
  return (
    <nav className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-brand">Admin</div>
        <button className="sidebar-close" onClick={onClose} aria-label="Đóng menu">✕</button>
      </div>
      <ul>
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} onClick={onClose}>{l.label}</Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
