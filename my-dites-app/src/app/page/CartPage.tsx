// // pages/CartPage.tsx
// 'use client';
// import React from 'react';
// import { useRouter } from 'next/navigation';
// import { useCart } from '../context/CartContext';
// import Link from 'next/link';


// const CartPage: React.FC = () => {
//   const router = useRouter();
//   const { cart, updateCartItemQuantity , removeFromCart, clearCart, totalPrice , setTableNumber , tableNumber} = useCart();
//   const handleCheckout = async () => {
//     try {
//       // Tính tổng thủ công để đảm bảo chính xác
//       const manualTotal = cart.reduce(
//         (sum: number, item: any) => sum + item.price * item.quantity,
//         0
//       );
  
//       const orderData = {
//         user_id: "guest_user",       // đúng với backend
//         table_number: tableNumber,   // số bàn
//         total: manualTotal,          // 👈 backend yêu cầu field "total"
//         status: "pending",
//         created_at: new Date().toISOString(),
//         items: cart.map((item: any) => ({
//           id: item.id,               // backend đang parse "id" trong items
//           title: item.name,
//           price: item.price,
//           quantity: item.quantity
//         }))
//       };
  
//       console.log("Order data being sent:", orderData);
  
//       // Verify total calculation
//       const calculatedTotal = cart.reduce(
//         (sum, item) => sum + item.price * item.quantity,
//         0
//       );
//       console.log("Calculated total from cart:", calculatedTotal);
  
//       if (calculatedTotal !== manualTotal) {
//         console.warn("Total mismatch detected!", {
//           calculatedTotal,
//           manualTotal
//         });
//       }
  
//       const response = await fetch("http://localhost:8080/api/orders", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(orderData),
//       });
  
//       const data = await response.json();
//       console.log("Server response:", data);
  
//       if (data.success) {
//         alert("Đặt hàng thành công!");
//         clearCart();
//         const currentTable = tableNumber;
//         setTableNumber(undefined);
//         router.push(`/order?table=${currentTable}`);
//       } else {
//         alert("Lỗi khi đặt hàng: " + (data.error || "Unknown error"));
//       }
//     } catch (error) {
//       console.error("Checkout error:", error);
//       alert("Lỗi khi gửi đơn hàng");
//     }
//   };
  
//   return (
//     <div className="min-h-screen bg-gray-50 pb-16">
//       {/* Header */}
//       <header className="px-4 py-4 flex items-center justify-between sticky top-0 bg-white z-10 shadow-sm">
//         <button onClick={() => router.back()} className="p-2 rounded-full bg-gray-100">
//           ←
//         </button>
//         <div className="text-black font-semibold">Giỏ hàng</div>
//         <button className="p-2 rounded-full bg-gray-100 opacity-0" aria-hidden="true">
//           •
//         </button>
//       </header>

//       {/* Cart items */}
//       <main className="px-4 py-4">
//         {cart.length === 0 ? (
//           <div className="text-center py-10 text-gray-500">
//             Giỏ hàng của bạn đang trống
//           </div>
//         ) : (
//           <div className="space-y-4">
//             {cart.map((item: any) => (
//               <div key={item.id} className="flex items-center gap-4 bg-white p-3 rounded-xl shadow">
//                 <img
//                   src={item.img}
//                   alt={item.name}
//                   className="w-20 h-20 object-cover rounded-lg"
//                 />
//                 <div className="flex-1">
//                   <h3 className="font-medium text-gray-800">{item.name}</h3>
//                   <p className="text-sm text-gray-600">
//                     {/* Hiển thị giá đơn vị */}
//                     {item.price.toLocaleString('vi-VN')}₫ × {item.quantity}
//                   </p>
//                   <p className="text-sm font-semibold text-gray-800">
//                     {/* Hiển thị tổng cho item */}
//                     Tổng: {(item.price * item.quantity).toLocaleString('vi-VN')}₫
//                   </p>
//                   <div className="flex items-center gap-2 mt-2">
//                     <button
//                       onClick={() => updateCartItemQuantity(item.id, item.quantity - 1)}
//                       className="px-2 py-1 bg-sky-950 text-white rounded"
//                     >
//                       -
//                     </button>
//                     <span className='text-black'>{item.quantity}</span>
//                     <button
//                       onClick={() => updateCartItemQuantity(item.id, item.quantity + 1)}
//                       className="px-2 py-1 bg-sky-950 text-white rounded"
//                     >
//                       +
//                     </button>
//                     <button
//                       onClick={() => removeFromCart(item.id)}
//                       className="ml-4 text-rose-500 text-sm"
//                     >
//                       Xóa
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             ))}
//             {/* <div className="mt-6">
//               <div className="flex justify-between text-lg font-semibold text-gray-800">
//                 <span>Tổng cộng:</span>
//                 <span>{totalPrice.toLocaleString('vi-VN')}₫</span>
//               </div>
//               <button
//                 onClick={handleCheckout}
//                 className="w-full mt-4 bg-rose-500 text-white py-3 rounded-full hover:bg-rose-600"
//               >
//                 Đặt hàng
//               </button>
//             </div> */}
//                <div className="mt-6 p-4 bg-white rounded-xl shadow">
//               <label className="block text-sm font-medium text-gray-700 mb-2">Chọn số bàn (bắt buộc)</label>
//               <select
//                 value={tableNumber || ''}
//                 onChange={(e) => setTableNumber(Number(e.target.value))}
//                 className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 required
//               >
//                 <option value="">-- Chọn bàn --</option>
//                 {Array.from({ length: 20 }, (_, i) => i + 1).map(num => (
//                   <option key={num} value={num}>Bàn {num}</option>
//                 ))}
//               </select>
//               {tableNumber && <p className="text-sm text-green-600 mt-1">Đã chọn: Bàn {tableNumber}</p>}
//             </div>

//             <div className="mt-6">
//               <div className="flex justify-between text-lg font-semibold text-gray-800">
//                 <span>Tổng cộng:</span>
//                 <span>{totalPrice.toLocaleString('vi-VN')}₫</span>
//               </div>
//               <button
//                 onClick={handleCheckout}
//                 className="w-full mt-4 bg-rose-500 text-white py-3 rounded-full hover:bg-rose-600 disabled:opacity-50"
//                 disabled={!tableNumber}
//               >
//                 Đặt hàng (Bàn {tableNumber || 'Chưa chọn'})
//               </button>
//             </div>
//           </div>
//         )}
//       </main>

//       <nav className="fixed bottom-0 left-0 right-0 bg-white border-t rounded-t-xl shadow-top z-20 mx-2 mb-2">
//           <div className="flex justify-around text-gray-600">
//             {[
//               { label: "Home", icon: "🏠" },
//               { label: "Search", icon: "🔎" },
//               { label: "Cart", icon: "🧺" },
//               { label: "Profile", icon: "👤" },
//             ].map((item) => (
//               <Link
//                 key={item.label}
//                 href={item.label === "Cart" ? "/cart" : "/"}
//                 className="flex-1 py-2 text-center hover:text-gray-800"
//               >
//                 <div className="text-xl">{item.icon}</div>
//                 <div className="text-xs">{item.label}</div>
//               </Link>
//             ))}
//           </div>
//       </nav>
      
//     </div>
//   );
// };

// export default CartPage;
'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '../context/CartContext';
import Link from 'next/link';

const CartPage: React.FC = () => {
  const router = useRouter();
  const { cart, updateCartItemQuantity, removeFromCart, clearCart, totalPrice, setTableNumber, tableNumber } = useCart();
  const [existingOrders, setExistingOrders] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  // Fetch orders của bàn để chọn cập nhật
  useEffect(() => {
    if (tableNumber) {
      fetch(`http://localhost:8080/api/orders?table_number=${tableNumber}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) setExistingOrders(data.data.filter((o) => o.status === "pending"));
        })
        .catch((error) => console.error("Error fetching orders:", error));
    }
  }, [tableNumber]);

  const handleCheckout = async () => {
    try {
      const manualTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

      const orderData = {
        user_id: "guest_user",
        table_number: tableNumber,
        total: manualTotal,
        items: cart.map((item) => ({
          id: item.id,
          title: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
      };

      console.log("Order data being sent:", orderData);

      const response = await fetch("http://localhost:8080/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();
      console.log("Server response:", data);

      if (data.success) {
        alert("Đặt hàng thành công!");
        clearCart();
        const currentTable = tableNumber;
        setTableNumber(undefined);
        router.push(`/order?table=${currentTable}`);
      } else {
        alert("Lỗi khi đặt hàng: " + (data.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Lỗi khi gửi đơn hàng");
    }
  };

  const handleUpdateOrder = async () => {
    if (!selectedOrderId) {
      alert("Vui lòng chọn đơn hàng để cập nhật!");
      return;
    }

    const orderData = {
      items: cart.map((item) => ({
        id: item.id,
        title: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
    };

    const response = await fetch(`http://localhost:8080/api/orders/${selectedOrderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderData),
    });

    const data = await response.json();
    if (data.success) {
      alert("Cập nhật đơn hàng thành công!");
      clearCart();
      setSelectedOrderId(null);
    } else {
      alert("Lỗi khi cập nhật: " + data.error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <header className="px-4 py-4 flex items-center justify-between sticky top-0 bg-white z-10 shadow-sm">
        <button onClick={() => router.back()} className="p-2 rounded-full bg-gray-100">
          ←
        </button>
        <div className="text-black font-semibold">Giỏ hàng</div>
        <button className="p-2 rounded-full bg-gray-100 opacity-0" aria-hidden="true">
          •
        </button>
      </header>

      <main className="px-4 py-4">
        {cart.length === 0 ? (
          <div className="text-center py-10 text-gray-500">Giỏ hàng của bạn đang trống</div>
        ) : (
          <div className="space-y-4">
            {cart.map((item) => (
              <div key={item.id} className="flex items-center gap-4 bg-white p-3 rounded-xl shadow">
                <img src={item.img} alt={item.name} className="w-20 h-20 object-cover rounded-lg" />
                <div className="flex-1">
                  <h3 className="font-medium text-gray-800">{item.name}</h3>
                  <p className="text-sm text-gray-600">{item.price.toLocaleString('vi-VN')}₫ × {item.quantity}</p>
                  <p className="text-sm font-semibold text-gray-800">
                    Tổng: {(item.price * item.quantity).toLocaleString('vi-VN')}₫
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => updateCartItemQuantity(item.id, item.quantity - 1)}
                      className="px-2 py-1 bg-sky-950 text-white rounded"
                    >
                      -
                    </button>
                    <span className="text-black">{item.quantity}</span>
                    <button
                      onClick={() => updateCartItemQuantity(item.id, item.quantity + 1)}
                      className="px-2 py-1 bg-sky-950 text-white rounded"
                    >
                      +
                    </button>
                    <button onClick={() => removeFromCart(item.id)} className="ml-4 text-rose-500 text-sm">
                      Xóa
                    </button>
                  </div>
                </div>
              </div>
            ))}
            <div className="mt-6 p-4 bg-white rounded-xl shadow">
              <label className="block text-sm font-medium text-gray-700 mb-2">Chọn số bàn (bắt buộc)</label>
              <select
                value={tableNumber || ""}
                onChange={(e) => setTableNumber(Number(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">-- Chọn bàn --</option>
                {Array.from({ length: 20 }, (_, i) => i + 1).map((num) => (
                  <option key={num} value={num}>
                    Bàn {num}
                  </option>
                ))}
              </select>
              {tableNumber && <p className="text-sm text-green-600 mt-1">Đã chọn: Bàn {tableNumber}</p>}
            </div>

            <div className="mt-6">
              <div className="flex justify-between text-lg font-semibold text-gray-800">
                <span>Tổng cộng:</span>
                <span>{totalPrice.toLocaleString('vi-VN')}₫</span>
              </div>
              <select
                value={selectedOrderId || ""}
                onChange={(e) => setSelectedOrderId(e.target.value)}
                className="w-full mt-2 p-2 border border-gray-300 rounded-md"
              >
                <option value="">Chọn đơn để cập nhật</option>
                {existingOrders.map((order) => (
                  <option key={order.id} value={order.id}>
                    Đơn #{order.id}
                  </option>
                ))}
              </select>
              <button
                onClick={selectedOrderId ? handleUpdateOrder : handleCheckout}
                className="w-full mt-4 bg-rose-500 text-white py-3 rounded-full hover:bg-rose-600 disabled:opacity-50"
                disabled={!tableNumber}
              >
                {selectedOrderId ? "Cập nhật đơn" : `Đặt hàng (Bàn ${tableNumber || "Chưa chọn"})`}
              </button>
            </div>
          </div>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t rounded-t-xl shadow-top z-20 mx-2 mb-2">
        <div className="flex justify-around text-gray-600">
          {[
            { label: "Home", icon: "🏠" },
            { label: "Search", icon: "🔎" },
            { label: "Cart", icon: "🧺" },
            { label: "Profile", icon: "👤" },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.label === "Cart" ? "/cart" : "/"}
              className="flex-1 py-2 text-center hover:text-gray-800"
            >
              <div className="text-xl">{item.icon}</div>
              <div className="text-xs">{item.label}</div>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default CartPage;