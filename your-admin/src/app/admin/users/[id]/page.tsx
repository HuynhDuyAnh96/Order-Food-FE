// app/admin/users/[id]/page.tsx
import React from 'react';
import { useRouter } from 'next/navigation';

export default function UserDetail() {
  const router = useRouter();
  // Lấy param từ route nếu cần (ví dụ từ id)
  // const id = router.query.id;

  return (
    <div>
      <h3>Thông tin người dùng</h3>
      {/* Form chỉnh sửa ngắn hạn */}
      <button onClick={() => router.back()}>Quay lại</button>
    </div>
  );
}