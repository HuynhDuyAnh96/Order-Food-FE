/**
 * Base URL backend (không có / cuối).
 * Production: đặt NEXT_PUBLIC_API_BASE_URL=https://order-food-1.onrender.com
 */
const raw = process.env.NEXT_PUBLIC_API_BASE_URL?.trim().replace(/\/$/, '');

export const publicApiOrigin = raw || 'http://localhost:8080';

/** Ví dụ: https://x.onrender.com/api */
export const apiBase = `${publicApiOrigin}/api`;

/** WebSocket /api/ws — tự dùng wss khi API là https */
export function getWebSocketUrl(): string {
  try {
    const u = new URL(publicApiOrigin);
    const proto = u.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${proto}//${u.host}/api/ws`;
  } catch {
    return 'ws://localhost:8080/api/ws';
  }
}
