// app/components/SidebarAdmin.tsx
import Link from 'next/link';
import React from 'react';

const links = [
  { href: '/admin/dashboard', label: 'Dashboard' },
  { href: '/admin/users', label: 'Người dùng' },
  // thêm routes khác nếu cần
];

export default function Sidebar() {
  return (
    <nav className="sidebar">
      <div className="sidebar-brand">Admin</div>
      <ul>
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href}>{l.label}</Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}