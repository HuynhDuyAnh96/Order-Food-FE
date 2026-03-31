import React, { useEffect, useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native'
import { useRouter } from 'expo-router'
import { DishType } from '@/type/dishes.type'
import { getDishes } from '@/services/dishesServices'
import { useCart } from '@/context/CartContext'
import DishCard from '../DishCard'

const Dishes = () => {
  const router = useRouter()
  const { addToCart } = useCart()
  const [dishes, setDishes] = useState<DishType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDishes = async () => {
      try {
        setLoading(true)
        setError(null)
        const dishesData = await getDishes()
        if (Array.isArray(dishesData)) {
          // Only show first 5 dishes on home
          setDishes(dishesData.slice(0, 5))
        } else {
          setError('Dishes is not an array')
          setDishes([])
        }
      } catch (err) {
        console.error('Error fetching dishes:', err)
        setError('Failed to fetch dishes')
        setDishes([])
      } finally {
        setLoading(false)
      }
    }
    fetchDishes()
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
        <Text style={styles.title}>Dishes</Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)/dishes')}>
          <Text style={styles.viewAll}>View All</Text>
        </TouchableOpacity>
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#e74c3c" />
        </View>
      )}

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {!loading && !error && dishes.length > 0 && (
        <View>
          {dishes.map((item) => (
            <DishCard key={item.id} dish={item} onAddToCart={handleAddToCart} />
          ))}
        </View>
      )}

      {!loading && !error && dishes.length === 0 && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No dishes available</Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    backgroundColor: '#f9fafb',
    minHeight: 200,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  viewAll: {
    fontSize: 14,
    color: '#e74c3c',
    fontWeight: '600',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 14,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#6b7280',
    fontSize: 14,
  },
})

export default Dishes