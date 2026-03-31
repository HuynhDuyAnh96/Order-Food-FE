import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  img: string;
  is_custom?: boolean;
  note?: string;
}

interface CartState {
  cart: CartItem[];
  totalPrice: number;
  tableNumber?: number;
}

type CartAction =
  | { type: 'ADD_TO_CART'; payload: CartItem }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'REMOVE_FROM_CART'; payload: string }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_TABLE'; payload: number | undefined }
  | { type: 'LOAD_CART'; payload: CartItem[] };

const calculateTotalPrice = (cart: CartItem[]): number => {
  return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
};

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_TO_CART': {
      // Món lậu (is_custom) không merge, luôn thêm mới
      const existingItem = action.payload.is_custom
        ? null
        : state.cart.find(item => item.id === action.payload.id && !item.is_custom);

      let updatedCart;
      if (existingItem) {
        updatedCart = state.cart.map(item =>
          item.id === action.payload.id && !item.is_custom
            ? { ...item, quantity: item.quantity + action.payload.quantity }
            : item
        );
      } else {
        updatedCart = [...state.cart, action.payload];
      }

      return {
        ...state,
        cart: updatedCart,
        totalPrice: calculateTotalPrice(updatedCart)
      };
    }

    case 'UPDATE_QUANTITY': {
      const updatedCart = state.cart.map(item =>
        item.id === action.payload.id
          ? { ...item, quantity: Math.max(0, action.payload.quantity) }
          : item
      ).filter(item => item.quantity > 0);

      return {
        ...state,
        cart: updatedCart,
        totalPrice: calculateTotalPrice(updatedCart)
      };
    }

    case 'REMOVE_FROM_CART': {
      const updatedCart = state.cart.filter(item => item.id !== action.payload);
      return {
        ...state,
        cart: updatedCart,
        totalPrice: calculateTotalPrice(updatedCart)
      };
    }

    case 'CLEAR_CART':
      return {
        ...state,
        cart: [],
        totalPrice: 0
      };

    case 'SET_TABLE': {
      return {
        ...state,
        tableNumber: action.payload
      };
    }

    case 'LOAD_CART': {
      return {
        cart: action.payload,
        totalPrice: calculateTotalPrice(action.payload),
        tableNumber: state.tableNumber
      };
    }

    default:
      return state;
  }
};

interface CartContextType {
  cart: CartItem[];
  totalPrice: number;
  tableNumber?: number;
  addToCart: (item: CartItem) => void;
  updateCartItemQuantity: (id: string, quantity: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  setTableNumber: (table: number | undefined) => void;
  cartCount: number;
}

const CartContext = createContext<CartContextType | null>(null);

const CART_STORAGE_KEY = '@food_order_cart';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, { cart: [], totalPrice: 0, tableNumber: undefined });

  // Load cart từ AsyncStorage khi khởi động
  useEffect(() => {
    const loadCart = async () => {
      try {
        const savedCart = await AsyncStorage.getItem(CART_STORAGE_KEY);
        if (savedCart) {
          const parsedCart = JSON.parse(savedCart);
          dispatch({ type: 'LOAD_CART', payload: parsedCart });
        }
      } catch (error) {
        console.error('Error loading cart:', error);
      }
    };
    loadCart();
  }, []);

  // Lưu cart vào AsyncStorage khi có thay đổi
  useEffect(() => {
    const saveCart = async () => {
      try {
        await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state.cart));
      } catch (error) {
        console.error('Error saving cart:', error);
      }
    };
    saveCart();
  }, [state.cart]);

  const addToCart = (item: CartItem) => {
    dispatch({ type: 'ADD_TO_CART', payload: item });
  };

  const updateCartItemQuantity = (id: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
  };

  const removeFromCart = (id: string) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: id });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const setTableNumber = (table: number | undefined) => {
    dispatch({ type: 'SET_TABLE', payload: table });
  };

  const cartCount = state.cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      cart: state.cart,
      totalPrice: state.totalPrice,
      tableNumber: state.tableNumber,
      addToCart,
      updateCartItemQuantity,
      removeFromCart,
      clearCart,
      setTableNumber,
      cartCount
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
