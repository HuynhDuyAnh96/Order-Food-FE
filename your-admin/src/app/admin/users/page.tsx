// app/admin/users/page.tsx
import React from 'react';
import Link from 'next/link';

const users = [
  { id: 1, name: 'Nguyễn A', email: 'a@example.com', role: 'Admin' },
  { id: 2, name: 'Trần B', email: 'b@example.com', role: 'Editor' },
];

export default function UsersPage() {
  return (
    <div>
      <div className="flex-between">
        <h2>Người dùng</h2>
        <Link href="/admin/users/new" className="btn">Thêm người dùng</Link>
      </div>
      <table className="table">
        <thead>
          <tr><th>ID</th><th>Tên</th><th>Email</th><th>Vai trò</th><th>Hành động</th></tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id}>
              <td>{u.id}</td>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>
              <td><Link href={`/admin/users/${u.id}`}>Xem</Link></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}