// Format price theo định dạng tiền Việt
export const formatPrice = (price: number | undefined | null): string => {
  if (price === undefined || price === null) return '0₫';
  return price.toLocaleString('vi-VN') + '₫';
};

// Status labels và colors cho orders
export const ORDER_STATUS = {
  pending: { label: 'Đang chờ', color: '#f59e0b' },
  ready: { label: 'Sẵn sàng', color: '#3b82f6' },
  completed: { label: 'Hoàn thành', color: '#10b981' },
  cancelled: { label: 'Đã hủy', color: '#ef4444' },
} as const;

export type OrderStatus = keyof typeof ORDER_STATUS;

export const getStatusLabel = (status: string): string => {
  return ORDER_STATUS[status as OrderStatus]?.label || status;
};

export const getStatusColor = (status: string): string => {
  return ORDER_STATUS[status as OrderStatus]?.color || '#6b7280';
};

// Cooking method labels
export const COOKING_METHODS = {
  'grilled': 'Món nướng',
  'stir-fried': 'Món xào',
  'steamed': 'Món hấp',
  'fried': 'Món chiên',
  'boiled': 'Món luộc',
} as const;

export const getCookingMethodLabel = (method: string): string => {
  return COOKING_METHODS[method as keyof typeof COOKING_METHODS] || method;
};

// Truncate text với ellipsis
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

// Format date tiếng Việt
export const formatDate = (dateString: string | undefined | null): string => {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleString('vi-VN');
  } catch {
    return 'N/A';
  }
};

// Tính tổng đơn hàng từ items
export const calculateOrderTotal = (items: Array<{ price?: number; quantity?: number }>): number => {
  if (!items || items.length === 0) return 0;
  return items.reduce(
    (sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 0),
    0
  );
};

// Validate email
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Delay utility cho debounce
export const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};
