// 'use client';
// import React, { useState, useEffect } from 'react';
// import { useRouter, useSearchParams } from 'next/navigation';

// const OrdersPage: React.FC = () => {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const [selectedTable, setSelectedTable] = useState<number | null>(null);
//   const [orders, setOrders] = useState<any[]>([]);
//   const [filteredOrders, setFilteredOrders] = useState<any[]>([]);

//   useEffect(() => {
//     fetchOrders();
//   }, []);

//   const fetchOrders = async () => {
//     try {
//       console.log(`Fetching all orders...`);
//       const response = await fetch(`http://localhost:8080/api/orders`);
      
//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }

//       let allOrdersData: any[] = [];

//       const data = await response.json();
//       if (data.success && data.data) {
//         allOrdersData = Array.isArray(data.data) ? data.data : [data.data];
//       } else if (Array.isArray(data)) {
//         allOrdersData = data;
//       } else if (data.orders) {
//         allOrdersData = Array.isArray(data.orders) ? data.orders : [data.orders];
//       }

//       // Debug table numbers before processing
//       console.log('Raw API response structure:', data);
//       console.log('Raw orders data:', allOrdersData.map(order => ({
//         id: order.id,
       
//         tableNumber: order.tableNumber,
//         table_id: order.table_id,
//         allKeys: Object.keys(order),
//         items: order.items ? order.items.map((item: any) => ({
//           title: item.title,
//           table_number: item.table_number,
//           allItemKeys: Object.keys(item)
//         })) : []
//       })));

//       console.log('Processing table numbers...');

//       allOrdersData = allOrdersData.map(order => {
//         // Lấy table_number từ order trước, nếu không có thì lấy từ item đầu tiên
//         let tableNum = order.table_number ?? order.tableNumber ?? order.table_id;
        
//         if (!tableNum && order.items && order.items.length > 0) {
//           tableNum = order.items[0].table_number;
//         }
        
//         // Nếu vẫn undefined, set default value
//         if (tableNum === undefined || tableNum === null) {
//           tableNum = 1; // Default table number
//           console.log(`Order ${order.id}: table_number was undefined, setting to default: ${tableNum}`);
//         } else {
//           console.log(`Order ${order.id}: found table_number = ${tableNum}`);
//         }
        
//         return {
//           ...order,
//           table_number: Number(tableNum) // Ensure it's a number
//         };
//       });

//       console.log('Final processed orders:', allOrdersData.map(order => ({
//         id: order.id,
//         table_number: order.table_number
//       })));

//       // Sắp xếp đơn hàng mới nhất lên đầu (giả sử có trường created_at)
//       allOrdersData.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

//       setOrders(allOrdersData);
//       setFilteredOrders(allOrdersData); // mặc định hiển thị tất cả
//     } catch (error) {
//       console.error('Error fetching orders:', error);
//       setOrders([]);
//       setFilteredOrders([]);
//     }
//   };

//   const handleFilter = (tableNumber: number | null) => {
//     setSelectedTable(tableNumber);
//     if (tableNumber === null) {
//       setFilteredOrders(orders);
//     } else {
//       setFilteredOrders(orders.filter(order => Number(order.table_number) === tableNumber));
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 p-4">
//       <h1 className="text-2xl font-bold mb-4">Quản lý Orders</h1>
      
//       {/* Filter theo bàn */}
//       <div className="mb-4 flex items-center space-x-2">
//         <label className="text-sm font-medium text-gray-700">Lọc theo số bàn</label>
//         <select
//           value={selectedTable ?? ''}
//           onChange={(e) => handleFilter(e.target.value ? Number(e.target.value) : null)}
//           className="p-2 border border-gray-300 rounded-md"
//         >
//           <option value="">Tất cả bàn</option>
//           {Array.from({ length: 20 }, (_, i) => i + 1).map(num => (
//             <option key={num} value={num}>Bàn {num}</option>
//           ))}
//         </select>
//       </div>

//       {/* Debug info */}
//       <div className="mb-4 p-3 bg-blue-50 rounded">
//         <p className="text-sm text-blue-700">Debug: Found {filteredOrders.length} orders</p>
//         <p className="text-sm text-blue-700">Selected table: {selectedTable ?? 'Tất cả'}</p>
//         <button 
//           onClick={fetchOrders}
//           className="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-sm"
//         >
//           Refresh Orders
//         </button>
//       </div>

//       {/* Hiển thị orders */}
//       <div className="space-y-4">
//         {filteredOrders.map((order: any, orderIndex: number) => (
//           <div key={order.id || orderIndex} className="bg-white p-4 rounded-lg shadow">
// <h3 className="font-semibold text-black">
//   Order ID: {order.id || 'N/A'} - Bàn {order.table_number || order.tableNumber || order.table_id || 'N/A'}
// </h3>
// <p className="text-black">
//   Trạng thái: {order.status || 'pending'}
// </p>
// <p className="text-black">
//   Số bàn: {order.table_number || order.tableNumber || order.table_id || 'Chưa xác định'}
// </p>
//             <p className="text-black">Tổng: {order.total_price ? order.total_price.toLocaleString('vi-VN') : '0'}₫</p>
//             <p className="text-black">Thời gian: {order.created_at ? new Date(order.created_at).toLocaleString() : 'N/A'}</p>

//             {/* Hiển thị chi tiết */}
//             <div className="mt-2">
//               <h4 className="font-medium text-gray-700 mb-1">
//                 Chi tiết đơn hàng: ({order.items ? order.items.length : 0} items)
//               </h4>
//               <ul className="space-y-1">
//                 {(order.items || []).map((item: any, idx: number) => {
//                   const unitPrice = Number(item.price) || 0;
//                   const quantity = Number(item.quantity) || 0;
//                   const itemTotal = unitPrice * quantity;
//                   return (
//                     <li key={idx} className="text-sm text-gray-600 flex justify-between">
//                       <span>{item.title} x{quantity}</span>
//                       <span>
//                         {unitPrice.toLocaleString('vi-VN')}₫ x {quantity} = {itemTotal.toLocaleString('vi-VN')}₫
//                       </span>
//                     </li>
//                   );
//                 })}
//               </ul>
//               <div className="mt-2 pt-2 border-t border-gray-200">
//                 <div className="flex justify-between text-sm">
//                   <span className="text-black">Tổng tính toán:</span>
//                   <span>{order.items.reduce((sum: number, item: any) => 
//                     sum + (Number(item.price) * Number(item.quantity)), 0
//                   ).toLocaleString('vi-VN')}₫</span>
//                 </div>
//                 <div className="flex justify-between text-sm font-medium">
//                   <span className='text-black'>Tổng lưu trữ:</span>
//                   <span className='text-black'>{order.total_price.toLocaleString('vi-VN')}₫</span>
//                 </div>
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>

//       {filteredOrders.length === 0 && <p>Không có order {selectedTable ? `cho bàn ${selectedTable}` : ''}</p>}
//     </div>
//   );
// };

// export default OrdersPage;

'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const OrdersPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<any[]>([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      console.log(`Fetching all orders...`);
      const response = await fetch(`http://localhost:8080/api/orders`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      let allOrdersData: any[] = [];
      if (data.success && data.data) {
        allOrdersData = Array.isArray(data.data) ? data.data : [data.data];
      } else if (Array.isArray(data)) {
        allOrdersData = data;
      } else if (data.orders) {
        allOrdersData = Array.isArray(data.orders) ? data.orders : [data.orders];
      }

      console.log('Raw API response structure:', data);
      console.log('Raw orders data:', allOrdersData.map(order => ({
        id: order.id,
        tableNumber: order.table_number,
        table_id: order.table_id,
        allKeys: Object.keys(order),
        items: order.items ? order.items.map((item: any) => ({
          title: item.title,
          table_number: item.table_number,
          allItemKeys: Object.keys(item)
        })) : []
      })));

      allOrdersData = allOrdersData.map(order => {
        let tableNum = order.table_number ?? order.tableNumber ?? order.table_id;
        if (!tableNum && order.items && order.items.length > 0) {
          tableNum = order.items[0].table_number;
        }
        if (tableNum === undefined || tableNum === null) {
          tableNum = 1;
          console.log(`Order ${order.id}: table_number was undefined, setting to default: ${tableNum}`);
        } else {
          console.log(`Order ${order.id}: found table_number = ${tableNum}`);
        }
        return { ...order, table_number: Number(tableNum) };
      });

      allOrdersData.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setOrders(allOrdersData);
      setFilteredOrders(allOrdersData);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
      setFilteredOrders([]);
    }
  };

  const handleFilter = (tableNumber: number | null) => {
    setSelectedTable(tableNumber);
    if (tableNumber === null) {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(orders.filter(order => Number(order.table_number) === tableNumber));
    }
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    const response = await fetch(`http://localhost:8080/api/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    if (response.ok) {
      alert(`Cập nhật trạng thái thành ${newStatus}!`);
      fetchOrders(); // Refresh list
    } else {
      alert('Lỗi khi cập nhật trạng thái!');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <h1 className="text-2xl font-bold mb-4">Quản lý Orders</h1>

      <div className="mb-4 flex items-center space-x-2">
        <label className="text-sm font-medium text-gray-700">Lọc theo số bàn</label>
        <select
          value={selectedTable ?? ''}
          onChange={(e) => handleFilter(e.target.value ? Number(e.target.value) : null)}
          className="p-2 border border-gray-300 rounded-md"
        >
          <option value="">Tất cả bàn</option>
          {Array.from({ length: 20 }, (_, i) => i + 1).map(num => (
            <option key={num} value={num}>Bàn {num}</option>
          ))}
        </select>
      </div>

      <div className="mb-4 p-3 bg-blue-50 rounded">
        <p className="text-sm text-blue-700">Debug: Found {filteredOrders.length} orders</p>
        <p className="text-sm text-blue-700">Selected table: {selectedTable ?? 'Tất cả'}</p>
        <button onClick={fetchOrders} className="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-sm">
          Refresh Orders
        </button>
      </div>

      <div className="space-y-4">
        {filteredOrders.map((order, orderIndex) => (
          <div key={order.id || orderIndex} className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold text-black">
              Order ID: {order.id || 'N/A'} - Bàn {order.table_number || order.tableNumber || order.table_id || 'N/A'}
            </h3>
            <p className="text-black">Trạng thái: {order.status || 'pending'}</p>
            <p className="text-black">Số bàn: {order.table_number || order.tableNumber || order.table_id || 'Chưa xác định'}</p>
            <p className="text-black">Tổng: {order.total_price ? order.total_price.toLocaleString('vi-VN') : '0'}₫</p>
            <p className="text-black">Thời gian: {order.created_at ? new Date(order.created_at).toLocaleString() : 'N/A'}</p>

            <div className="mt-2">
              <h4 className="font-medium text-gray-700 mb-1">Chi tiết đơn hàng: ({order.items ? order.items.length : 0} items)</h4>
              <ul className="space-y-1">
                {(order.items || []).map((item: any, idx: number) => {
                  const unitPrice = Number(item.price) || 0;
                  const quantity = Number(item.quantity) || 0;
                  const itemTotal = unitPrice * quantity;
                  return (
                    <li key={idx} className="text-sm text-gray-600 flex justify-between">
                      <span>{item.title} x{quantity}</span>
                      <span>{unitPrice.toLocaleString('vi-VN')}₫ x {quantity} = {itemTotal.toLocaleString('vi-VN')}₫</span>
                    </li>
                  );
                })}
              </ul>
              <div className="mt-2 pt-2 border-t border-gray-200">
                <div className="flex justify-between text-sm">
                  <span className="text-black">Tổng tính toán:</span>
                  <span>{order.items.reduce((sum: number, item: any) => sum + (Number(item.price) * Number(item.quantity)), 0).toLocaleString('vi-VN')}₫</span>
                </div>
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-black">Tổng lưu trữ:</span>
                  <span className="text-black">{order.total_price.toLocaleString('vi-VN')}₫</span>
                </div>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              {order.status === "ready" && (
                <button
                  onClick={() => handleUpdateStatus(order.id, "completed")}
                  className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Hoàn thành (Completed)
                </button>
              )}
              {order.status !== "completed" && order.status !== "cancelled" && (
                <button
                  onClick={() => handleUpdateStatus(order.id, "cancelled")}
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Hủy (Cancelled)
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredOrders.length === 0 && <p>Không có order {selectedTable ? `cho bàn ${selectedTable}` : ''}</p>}
    </div>
  );
};

export default OrdersPage;