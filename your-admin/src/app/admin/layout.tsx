// app/admin/layout.tsx
import React from 'react';
import LayoutAdmin from '../components/LayoutAdmin';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <LayoutAdmin>{children}</LayoutAdmin>;
}