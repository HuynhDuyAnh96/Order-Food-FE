import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import DishCard from '@/components/DishCard';
import { getDishes } from '@/services/dishesServices';
import { DishType } from '@/type/dishes.type';
import { useCart } from '@/context/CartContext';

interface CookingMethod {
  id: string;
  name: string;
  icon: string;
}

export default function DishesScreen() {
  const router = useRouter();
  const { addToCart } = useCart();
  const [selectedMethod, setSelectedMethod] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dishes, setDishes] = useState<DishType[]>([]);
  const [filteredDishes, setFilteredDishes] = useState<DishType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const cookingMethods: CookingMethod[] = [
    { id: 'all', name: 'Tất cả', icon: '🍽️' },
    { id: 'stir-fried', name: 'Món Xào', icon: '🍳' },
    { id: 'grilled', name: 'Món Nướng', icon: '🔥' },
    { id: 'steamed', name: 'Món Hấp', icon: '♨️' },
  ];

  const fetchDishes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const dishesData = await getDishes();
      // Sort by rating
      dishesData.sort((a: DishType, b: DishType) => (b.rating || 0) - (a.rating || 0));
      setDishes(dishesData);
      applyFilter(dishesData, selectedMethod, searchQuery);
    } catch (err) {
      console.error('Error fetching dishes:', err);
      setError('Lỗi khi tải dữ liệu món ăn');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDishes();
  }, [fetchDishes]);

  const applyFilter = (dishesData: DishType[], method: string, query: string) => {
    let result = method === 'all' ? dishesData : dishesData.filter((d) => d.cooking_method === method);
    if (query.trim()) {
      result = result.filter((d) => d.name.toLowerCase().includes(query.toLowerCase()));
    }
    setFilteredDishes(result);
  };

  const handleMethodChange = (method: string) => {
    setSelectedMethod(method);
    applyFilter(dishes, method, searchQuery);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    applyFilter(dishes, selectedMethod, query);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDishes();
    setRefreshing(false);
  };

  const handleAddToCart = (dish: DishType) => {
    addToCart({
      id: dish.id,
      name: dish.name,
      price: dish.price,
      quantity: 1,
      img: dish.image_url,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tất cả món ăn</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Search bar */}
      <View style={styles.searchSection}>
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm món ăn..."
          placeholderTextColor="#9ca3af"
          value={searchQuery}
          onChangeText={handleSearch}
          clearButtonMode="while-editing"
        />
      </View>

      {/* Filter by cooking method */}
      <View style={styles.filterSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContent}
        >
          {cookingMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.filterButton,
                selectedMethod === method.id && styles.filterButtonActive,
              ]}
              onPress={() => handleMethodChange(method.id)}
            >
              <Text style={styles.filterIcon}>{method.icon}</Text>
              <Text
                style={[
                  styles.filterText,
                  selectedMethod === method.id && styles.filterTextActive,
                ]}
              >
                {method.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Dish list */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading && !refreshing ? (
          <View style={styles.centerContainer}>
            <Text style={styles.loadingText}>Đang tải...</Text>
          </View>
        ) : error ? (
          <View style={styles.centerContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchDishes}>
              <Text style={styles.retryButtonText}>Thử lại</Text>
            </TouchableOpacity>
          </View>
        ) : filteredDishes.length === 0 ? (
          <View style={styles.centerContainer}>
            <Text style={styles.emptyText}>
              Không có món ăn nào trong danh mục này
            </Text>
          </View>
        ) : (
          filteredDishes.map((dish) => (
            <DishCard
              key={dish.id}
              dish={dish}
              onAddToCart={handleAddToCart}
            />
          ))
        )}

        <View style={{ height: 100 }} />
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
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 20,
    color: '#1f2937',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  placeholder: {
    width: 40,
  },
  filterSection: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  filterContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: '#e74c3c',
  },
  filterIcon: {
    fontSize: 18,
    marginRight: 6,
  },
  filterText: {
    fontSize: 14,
    color: '#374151',
  },
  filterTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingTop: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#e74c3c',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 16,
    color: '#9ca3af',
  },
  searchSection: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  searchInput: {
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: '#1f2937',
  },
});
