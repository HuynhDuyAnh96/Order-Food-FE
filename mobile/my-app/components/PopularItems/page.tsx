import React, { useEffect, useState } from 'react'
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { DishType } from '@/type/dishes.type'
import { getFeaturedDishes } from '@/services/dishesServices'
import { useCart } from '@/context/CartContext'

const PopularItems = () => {
  const router = useRouter()
  const { addToCart } = useCart()
  const [dishes, setDishes] = useState<DishType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchFeaturedDishes = async () => {
      try {
        setLoading(true)
        setError(null)
        const featuredDishes = await getFeaturedDishes()
        if (Array.isArray(featuredDishes)) {
          setDishes(featuredDishes)
        } else {
          setError('Featured dishes is not an array')
          setDishes([])
        }
      } catch (err) {
        console.error('Error fetching featured dishes:', err)
        setError('Failed to fetch featured dishes')
        setDishes([])
      } finally {
        setLoading(false)
      }
    }
    fetchFeaturedDishes()
  }, [])

  const handleAddToCart = (dish: DishType) => {
    addToCart({
      id: dish.id,
      name: dish.name,
      price: dish.price,
      quantity: 1,
      img: dish.image_url,
    })
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Popular Food Item</Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)/dishes')}>
          <Text style={styles.viewAll}>View All</Text>
        </TouchableOpacity>
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <Text>Loading...</Text>
        </View>
      )}
      {error && <Text style={styles.error}>{error}</Text>}
      {!loading && !error && (
        <View style={styles.scrollContainer}>
          <FlatList
            data={dishes}
            keyExtractor={(item, index) => item.id || `featured-${index}`}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            nestedScrollEnabled={true}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <View style={styles.cardOverlay}>
                  <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
                  <View style={styles.cardFooter}>
                    <Text style={styles.cardPrice}>
                      {item.price?.toLocaleString('vi-VN')}₫
                    </Text>
                    <TouchableOpacity
                      style={styles.addButton}
                      onPress={() => handleAddToCart(item)}
                    >
                      <Ionicons name="add" size={18} color="#fff" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
          />
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  viewAll: {
    fontSize: 14,
    color: '#e74c3c',
    fontWeight: '600',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  error: {
    color: 'red',
    paddingHorizontal: 16,
  },
  scrollContainer: {
    height: 180,
  },
  listContent: {
    paddingHorizontal: 16,
  },
  card: {
    width: 140,
    height: 160,
    marginRight: 12,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    backgroundColor: '#fff',
  },
  image: {
    width: '100%',
    height: 100,
    resizeMode: 'cover',
  },
  placeholderImage: {
    width: '100%',
    height: 100,
    backgroundColor: '#e0e0e0',
  },
  cardOverlay: {
    padding: 8,
  },
  cardName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardPrice: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#e74c3c',
  },
  addButton: {
    backgroundColor: '#e74c3c',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
})

export default PopularItems
