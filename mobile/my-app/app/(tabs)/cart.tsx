import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  SafeAreaView,
  Modal,
  FlatList,
  Platform,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCart } from '@/context/CartContext';
import {
  createOrder,
  updateOrder,
  getPendingOrdersByTable,
  cartItemsToOrderItems,
  Order,
} from '@/services/orderService';

export default function CartScreen() {
  const router = useRouter();
  const {
    cart,
    totalPrice,
    tableNumber,
    addToCart,
    updateCartItemQuantity,
    removeFromCart,
    clearCart,
    setTableNumber,
  } = useCart();

  const [orderType, setOrderType] = useState<'dine_in' | 'takeaway'>('dine_in');
  const [existingOrders, setExistingOrders] = useState<Order[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showTableModal, setShowTableModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showCustomItemModal, setShowCustomItemModal] = useState(false);
  const [customItemName, setCustomItemName] = useState('');
  const [customItemPrice, setCustomItemPrice] = useState('');
  const [customItemNote, setCustomItemNote] = useState('');

  const tableOptions = Array.from({ length: 20 }, (_, i) => i + 1);

  // Fetch pending orders của bàn khi chọn bàn
  useEffect(() => {
    if (tableNumber) {
      fetchPendingOrders();
    } else {
      setExistingOrders([]);
      setSelectedOrderId(null);
    }
  }, [tableNumber]);

  const fetchPendingOrders = async () => {
    if (!tableNumber) return;
    try {
      const orders = await getPendingOrdersByTable(tableNumber);
      setExistingOrders(orders);
    } catch (error) {
      console.error('Error fetching pending orders:', error);
    }
  };

  const handleAddCustomItem = () => {
    const name = customItemName.trim();
    const price = parseInt(customItemPrice.replace(/\D/g, ''), 10);
    if (!name) { Alert.alert('Lỗi', 'Vui lòng nhập tên món'); return; }
    if (!price || price <= 0) { Alert.alert('Lỗi', 'Vui lòng nhập giá hợp lệ'); return; }
    addToCart({
      id: `custom_${Date.now()}`,
      name,
      price,
      quantity: 1,
      img: '',
      is_custom: true,
      note: customItemNote.trim() || undefined,
    });
    setCustomItemName('');
    setCustomItemPrice('');
    setCustomItemNote('');
    setShowCustomItemModal(false);
  };

  const handleCheckout = async () => {
    if (orderType === 'dine_in' && !tableNumber) {
      Alert.alert('Thông báo', 'Vui lòng chọn số bàn trước khi đặt hàng');
      return;
    }

    setIsLoading(true);

    try {
      const orderData = {
        order_type: orderType,
        ...(orderType === 'dine_in' && tableNumber ? { table_number: tableNumber } : {}),
        total: totalPrice,
        items: cartItemsToOrderItems(cart),
      };

      console.log('Order data being sent:', orderData);

      const response = await createOrder(orderData);

      if (response.success) {
        Alert.alert('Thành công', 'Đặt hàng thành công!', [
          {
            text: 'OK',
            onPress: () => {
              clearCart();
              setTableNumber(undefined);
              router.push('/(tabs)/orders');
            },
          },
        ]);
      } else {
        Alert.alert('Lỗi', response.error || 'Không thể đặt hàng');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi đặt hàng');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateOrder = async () => {
    if (!selectedOrderId) {
      Alert.alert('Thông báo', 'Vui lòng chọn đơn hàng để cập nhật');
      return;
    }

    setIsLoading(true);

    try {
      const updateData = {
        items: cartItemsToOrderItems(cart),
      };

      const response = await updateOrder(selectedOrderId, updateData);

      if (response.success) {
        Alert.alert('Thành công', 'Cập nhật đơn hàng thành công!', [
          {
            text: 'OK',
            onPress: () => {
              clearCart();
              setSelectedOrderId(null);
              router.push('/(tabs)/orders');
            },
          },
        ]);
      } else {
        Alert.alert('Lỗi', response.error || 'Không thể cập nhật đơn hàng');
      }
    } catch (error) {
      console.error('Update order error:', error);
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi cập nhật đơn hàng');
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('vi-VN') + '₫';
  };

  if (cart.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Giỏ hàng</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="cart-outline" size={80} color="#ccc" />
          <Text style={styles.emptyText}>Giỏ hàng của bạn đang trống</Text>
          <TouchableOpacity
            style={styles.shopButton}
            onPress={() => router.push('/(tabs)/dishes')}
          >
            <Text style={styles.shopButtonText}>Xem món ăn</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Giỏ hàng</Text>
        <TouchableOpacity onPress={clearCart}>
          <Text style={styles.clearText}>Xóa tất cả</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Cart Items */}
        {cart.map((item) => (
          <View key={item.id} style={styles.cartItem}>
            {item.img ? (
              <Image source={{ uri: item.img }} style={styles.itemImage} />
            ) : (
              <View style={[styles.itemImage, { backgroundColor: '#e5e7eb', justifyContent: 'center', alignItems: 'center' }]}>
                <Ionicons name="image-outline" size={32} color="#9ca3af" />
              </View>
            )}
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemPrice}>
                {formatPrice(item.price)} × {item.quantity}
              </Text>
              <Text style={styles.itemTotal}>
                Tổng: {formatPrice(item.price * item.quantity)}
              </Text>

              <View style={styles.quantityContainer}>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => updateCartItemQuantity(item.id, item.quantity - 1)}
                >
                  <Text style={styles.quantityButtonText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.quantityText}>{item.quantity}</Text>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => updateCartItemQuantity(item.id, item.quantity + 1)}
                >
                  <Text style={styles.quantityButtonText}>+</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeFromCart(item.id)}
                >
                  <Text style={styles.removeText}>Xóa</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}

        {/* Order Type Toggle */}
        <View style={styles.tableSection}>
          <Text style={styles.sectionLabel}>Loại đơn</Text>
          <View style={styles.toggleRow}>
            <TouchableOpacity
              style={[styles.toggleBtn, orderType === 'dine_in' && styles.toggleBtnActive]}
              onPress={() => setOrderType('dine_in')}
            >
              <Text style={[styles.toggleText, orderType === 'dine_in' && styles.toggleTextActive]}>🍽️ Ăn tại quán</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleBtn, orderType === 'takeaway' && styles.toggleBtnActive]}
              onPress={() => { setOrderType('takeaway'); setTableNumber(undefined); }}
            >
              <Text style={[styles.toggleText, orderType === 'takeaway' && styles.toggleTextActive]}>🥡 Mang về</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Add Custom Item */}
        <TouchableOpacity style={styles.customItemBtn} onPress={() => setShowCustomItemModal(true)}>
          <Text style={styles.customItemBtnText}>+ Thêm món không có trong menu</Text>
        </TouchableOpacity>

        {/* Table Selection */}
        <View style={styles.tableSection}>
          <Text style={styles.sectionLabel}>{orderType === 'dine_in' ? 'Chọn số bàn (bắt buộc)' : 'Chọn số bàn (không cần cho mang về)'}</Text>
          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => setShowTableModal(true)}
          >
            <Text style={[styles.selectButtonText, !tableNumber && styles.placeholderText]}>
              {tableNumber ? `Bàn ${tableNumber}` : '-- Chọn bàn --'}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#6b7280" />
          </TouchableOpacity>
          {tableNumber && (
            <Text style={styles.selectedTable}>Đã chọn: Bàn {tableNumber}</Text>
          )}
        </View>

        {/* Select existing order to update */}
        {existingOrders.length > 0 && (
          <View style={styles.tableSection}>
            <Text style={styles.sectionLabel}>Chọn đơn để cập nhật (tùy chọn)</Text>
            <TouchableOpacity
              style={styles.selectButton}
              onPress={() => setShowOrderModal(true)}
            >
              <Text style={[styles.selectButtonText, !selectedOrderId && styles.placeholderText]}>
                {selectedOrderId
                  ? `Đơn #${selectedOrderId.slice(-6)}`
                  : '-- Tạo đơn mới --'}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>
        )}

        {/* Table Selection Modal */}
        <Modal
          visible={showTableModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowTableModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Chọn số bàn</Text>
                <TouchableOpacity onPress={() => setShowTableModal(false)}>
                  <Ionicons name="close" size={24} color="#1f2937" />
                </TouchableOpacity>
              </View>
              <FlatList
                data={tableOptions}
                keyExtractor={(item) => item.toString()}
                numColumns={4}
                contentContainerStyle={styles.tableGrid}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.tableOption,
                      tableNumber === item && styles.tableOptionSelected,
                    ]}
                    onPress={() => {
                      setTableNumber(item);
                      setShowTableModal(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.tableOptionText,
                        tableNumber === item && styles.tableOptionTextSelected,
                      ]}
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </Modal>

        {/* Order Selection Modal */}
        <Modal
          visible={showOrderModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowOrderModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Chọn đơn hàng</Text>
                <TouchableOpacity onPress={() => setShowOrderModal(false)}>
                  <Ionicons name="close" size={24} color="#1f2937" />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.orderList}>
                <TouchableOpacity
                  style={[
                    styles.orderOption,
                    !selectedOrderId && styles.orderOptionSelected,
                  ]}
                  onPress={() => {
                    setSelectedOrderId(null);
                    setShowOrderModal(false);
                  }}
                >
                  <Text style={styles.orderOptionText}>Tạo đơn mới</Text>
                </TouchableOpacity>
                {existingOrders.map((order) => (
                  <TouchableOpacity
                    key={order.id}
                    style={[
                      styles.orderOption,
                      selectedOrderId === order.id && styles.orderOptionSelected,
                    ]}
                    onPress={() => {
                      setSelectedOrderId(order.id);
                      setShowOrderModal(false);
                    }}
                  >
                    <Text style={styles.orderOptionText}>
                      Đơn #{order.id.slice(-6)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Custom Item Modal */}
        <Modal
          visible={showCustomItemModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowCustomItemModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Thêm món không có menu</Text>
                <TouchableOpacity onPress={() => setShowCustomItemModal(false)}>
                  <Ionicons name="close" size={24} color="#1f2937" />
                </TouchableOpacity>
              </View>
              <View style={{ padding: 16 }}>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Tên món *"
                  value={customItemName}
                  onChangeText={setCustomItemName}
                />
                <TextInput
                  style={styles.modalInput}
                  placeholder="Giá (VD: 50000) *"
                  value={customItemPrice}
                  onChangeText={setCustomItemPrice}
                  keyboardType="numeric"
                />
                <TextInput
                  style={styles.modalInput}
                  placeholder="Ghi chú (tùy chọn)"
                  value={customItemNote}
                  onChangeText={setCustomItemNote}
                />
                <TouchableOpacity
                  style={styles.checkoutButton}
                  onPress={handleAddCustomItem}
                >
                  <Text style={styles.checkoutButtonText}>Thêm vào giỏ</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Total & Checkout */}
        <View style={styles.totalSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tổng cộng:</Text>
            <Text style={styles.totalPrice}>{formatPrice(totalPrice)}</Text>
          </View>

          <TouchableOpacity
            style={[
              styles.checkoutButton,
              ((orderType === 'dine_in' && !tableNumber) || isLoading) && styles.checkoutButtonDisabled,
            ]}
            onPress={selectedOrderId ? handleUpdateOrder : handleCheckout}
            disabled={(orderType === 'dine_in' && !tableNumber) || isLoading}
          >
            <Text style={styles.checkoutButtonText}>
              {isLoading
                ? 'Đang xử lý...'
                : selectedOrderId
                ? 'Cập nhật đơn'
                : orderType === 'takeaway'
                ? 'Đặt hàng (Mang về)'
                : `Đặt hàng (Bàn ${tableNumber || 'Chưa chọn'})`}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  clearText: {
    fontSize: 14,
    color: '#ef4444',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#9ca3af',
    marginTop: 16,
    marginBottom: 24,
  },
  shopButton: {
    backgroundColor: '#e74c3c',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  shopButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
    color: '#6b7280',
  },
  itemTotal: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 2,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  quantityButton: {
    backgroundColor: '#0c4a6e',
    width: 28,
    height: 28,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  quantityText: {
    marginHorizontal: 12,
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  removeButton: {
    marginLeft: 16,
  },
  removeText: {
    color: '#ef4444',
    fontSize: 14,
  },
  tableSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  selectButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#fff',
  },
  selectButtonText: {
    fontSize: 16,
    color: '#1f2937',
  },
  placeholderText: {
    color: '#9ca3af',
  },
  selectedTable: {
    marginTop: 8,
    fontSize: 14,
    color: '#10b981',
  },
  totalSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#e74c3c',
  },
  checkoutButton: {
    backgroundColor: '#e74c3c',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
  },
  checkoutButtonDisabled: {
    backgroundColor: '#fca5a5',
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    paddingBottom: 30,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  tableGrid: {
    padding: 16,
  },
  tableOption: {
    flex: 1,
    aspectRatio: 1,
    margin: 6,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 60,
    maxWidth: 80,
  },
  tableOptionSelected: {
    backgroundColor: '#e74c3c',
  },
  tableOptionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  tableOptionTextSelected: {
    color: '#fff',
  },
  orderList: {
    padding: 16,
  },
  orderOption: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  orderOptionSelected: {
    backgroundColor: '#fef2f2',
  },
  orderOptionText: {
    fontSize: 16,
    color: '#1f2937',
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 8,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#d1d5db',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  toggleBtnActive: {
    borderColor: '#e74c3c',
    backgroundColor: '#fef2f2',
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  toggleTextActive: {
    color: '#e74c3c',
    fontWeight: '700',
  },
  customItemBtn: {
    marginBottom: 12,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#6366f1',
    borderStyle: 'dashed',
    alignItems: 'center',
    backgroundColor: '#f5f3ff',
  },
  customItemBtnText: {
    color: '#6366f1',
    fontSize: 14,
    fontWeight: '600',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#1f2937',
    marginBottom: 10,
  },
});
