import { API_BASE_URL, fetchWithTimeout } from '@/constants/api';
import { CartItem } from '@/context/CartContext';

export interface OrderItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
  is_custom?: boolean;
  note?: string;
}

export interface Order {
  id: string;
  user_id: string;
  order_type?: 'dine_in' | 'takeaway';
  table_number: number;
  total_price: number;
  status: 'pending' | 'preparing' | 'ready' | 'completed' | 'paid' | 'cancelled';
  items: OrderItem[];
  created_at: string;
  updated_at?: string;
}

export interface CreateOrderData {
  order_type: 'dine_in' | 'takeaway';
  table_number?: number;
  total: number;
  items: OrderItem[];
}

export interface UpdateOrderData {
  items?: OrderItem[];
  status?: string;
}

// API Response type
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Helper để parse response an toàn
const parseOrdersResponse = (data: unknown): Order[] => {
  if (!data) return [];

  // Kiểm tra các format response khác nhau
  if (typeof data === 'object' && data !== null) {
    const obj = data as Record<string, unknown>;

    if (obj.success && obj.data) {
      return Array.isArray(obj.data) ? obj.data as Order[] : [obj.data as Order];
    }
    if (Array.isArray(data)) {
      return data as Order[];
    }
    if (obj.orders) {
      return Array.isArray(obj.orders) ? obj.orders as Order[] : [obj.orders as Order];
    }
  }

  return [];
};

// Fetch tất cả orders
export const getOrders = async (): Promise<Order[]> => {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/api/orders`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return parseOrdersResponse(data);
  } catch (error) {
    console.error('Error fetching orders:', error);
    // Return empty array thay vì throw để UI không bị crash
    return [];
  }
};

// Fetch orders theo table number
export const getOrdersByTable = async (tableNumber: number): Promise<Order[]> => {
  try {
    const response = await fetchWithTimeout(
      `${API_BASE_URL}/api/orders?table_number=${tableNumber}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return parseOrdersResponse(data);
  } catch (error) {
    console.error('Error fetching orders by table:', error);
    return [];
  }
};

// Tạo order mới
export const createOrder = async (
  orderData: CreateOrderData
): Promise<ApiResponse<Order>> => {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || `Server error: ${response.status}`,
      };
    }

    return data;
  } catch (error) {
    console.error('Error creating order:', error);
    const errorMessage = error instanceof Error ? error.message : 'Không thể tạo đơn hàng';
    return { success: false, error: errorMessage };
  }
};

// Cập nhật order (items hoặc status)
export const updateOrder = async (
  orderId: string,
  updateData: UpdateOrderData
): Promise<ApiResponse<Order>> => {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/api/orders/${orderId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || `Server error: ${response.status}`,
      };
    }

    return data;
  } catch (error) {
    console.error('Error updating order:', error);
    const errorMessage = error instanceof Error ? error.message : 'Không thể cập nhật đơn hàng';
    return { success: false, error: errorMessage };
  }
};

// Cập nhật status của order
export const updateOrderStatus = async (
  orderId: string,
  status: string
): Promise<{ success: boolean; error?: string }> => {
  return updateOrder(orderId, { status });
};

// Convert CartItem[] sang OrderItem[]
export const cartItemsToOrderItems = (cartItems: CartItem[]): OrderItem[] => {
  return cartItems.map(item => ({
    id: item.is_custom ? '' : item.id,
    title: item.name,
    price: item.price,
    quantity: item.quantity,
    is_custom: item.is_custom ?? false,
    ...(item.note ? { note: item.note } : {}),
  }));
};

// Nhân viên xác nhận đã thu tiền → bàn trống
export const payOrder = async (
  orderId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/api/orders/${orderId}/pay`, {
      method: 'POST',
    });
    const data = await response.json();
    if (!response.ok) {
      return { success: false, error: data.error || `Server error: ${response.status}` };
    }
    return { success: true };
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Không thể thanh toán';
    return { success: false, error: msg };
  }
};

// Fetch pending orders theo table (để update)
export const getPendingOrdersByTable = async (tableNumber: number): Promise<Order[]> => {
  try {
    const orders = await getOrdersByTable(tableNumber);
    return orders.filter(order => order.status === 'pending');
  } catch (error) {
    console.error('Error fetching pending orders:', error);
    return [];
  }
};
