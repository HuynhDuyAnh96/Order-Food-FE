// context/CartContext.tsx
'use client';
import React, { createContext, useContext, useReducer, useEffect } from 'react';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  img: string;
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
  | { type: 'CALCULATE_TOTAL' }
  | { type: 'SET_TABLE'; payload: number }
  | { type: 'LOAD_CART'; payload: CartItem[] };

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_TO_CART': {
      const existingItem = state.cart.find(item => item.id === action.payload.id);
      
      let updatedCart;
      if (existingItem) {
        // Nếu item đã tồn tại, tăng quantity
        updatedCart = state.cart.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: item.quantity + action.payload.quantity }
            : item
        );
      } else {
        // Nếu item mới, thêm vào cart
        updatedCart = [...state.cart, action.payload];
      }

      const newState = { ...state, cart: updatedCart };
      return {
        ...newState,
        totalPrice: calculateTotalPrice(updatedCart)
      };
    }

    case 'UPDATE_QUANTITY': {
      const updatedCart = state.cart.map(item =>
        item.id === action.payload.id
          ? { ...item, quantity: Math.max(0, action.payload.quantity) }
          : item
      ).filter(item => item.quantity > 0); // Loại bỏ items có quantity = 0

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

    case 'CALCULATE_TOTAL':
      return {
        ...state,
        totalPrice: calculateTotalPrice(state.cart)
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

// Hàm tính tổng giá
const calculateTotalPrice = (cart: CartItem[]): number => {
  return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
};

const CartContext = createContext<any>(null);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, { cart: [], totalPrice: 0, tableNumber: undefined });

  // Load cart từ localStorage khi khởi động
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      const parsedCart = JSON.parse(savedCart);
      // Directly set the cart instead of adding items one by one to avoid quantity duplication
      dispatch({ type: 'LOAD_CART', payload: parsedCart });
    }
  }, []);

  // Lưu cart vào localStorage khi có thay đổi
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(state.cart));
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

  const setTableNumber = (table: number) => {
    dispatch({ type: 'SET_TABLE', payload: table });
  };

  return (
    <CartContext.Provider value={{
      cart: state.cart,
      totalPrice: state.totalPrice,
      tableNumber: state.tableNumber,
      addToCart,
      updateCartItemQuantity,
      removeFromCart,
      clearCart,
      setTableNumber
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};