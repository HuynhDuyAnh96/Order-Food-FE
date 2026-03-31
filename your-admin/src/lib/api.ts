/**
 * Base URL backend (không có / cuối).
 * Production: đặt NEXT_PUBLIC_API_BASE_URL=https://order-food-1.onrender.com
 */
const raw = process.env.NEXT_PUBLIC_API_BASE_URL?.trim().replace(/\/$/, '');

// Fallback: do backend bạn đã deploy lên (không chạy ở localhost nữa)
// nên mặc định trỏ về onrender để chạy local frontend vẫn OK.
// Vercel/local có thể override bằng NEXT_PUBLIC_API_BASE_URL.
export const publicApiOrigin = raw ?? 'https://order-food-1.onrender.com';

/** Ví dụ: https://x.onrender.com/api */
export function getApiBaseOrThrow(): string {
  if (!publicApiOrigin) throw new Error('publicApiOrigin rỗng - cấu hình sai.');
  return `${publicApiOrigin}/api`;
}

/** WebSocket /api/ws — tự dùng wss khi API là https */
export function getWebSocketUrl(): string {
  if (!publicApiOrigin) {
    throw new Error(
      'Chưa cấu hình NEXT_PUBLIC_API_BASE_URL (không thể tạo WebSocket).',
    );
  }
  const u = new URL(publicApiOrigin);
  const proto = u.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${proto}//${u.host}/api/ws`;
}
