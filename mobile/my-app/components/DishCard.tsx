import React, { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { DishType } from '@/type/dishes.type'
import { Ionicons } from '@expo/vector-icons'

interface DishCardProps {
  dish: DishType
  onAddToCart?: (dish: DishType) => void
}

const DishCard: React.FC<DishCardProps> = ({ dish, onAddToCart }) => {
  const [showSuccess, setShowSuccess] = useState(false)

  const handleAdd = () => {
    if (onAddToCart) {
      onAddToCart(dish)
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 2000)
    }
  }

  const getCategoryLabel = (cookingMethod: string) => {
    const methodMap: { [key: string]: string } = {
      'grilled': 'Món nướng',
      'stir-fried': 'Món xào',
      'steamed': 'Món hấp',
      'fried': 'Món chiên',
      'boiled': 'Món luộc',
    }
    return methodMap[cookingMethod] || cookingMethod
  }

  return (
    <View style={styles.card}>
      {showSuccess && (
        <View style={styles.successBadge}>
          <Text style={styles.successText}>✓ Đã thêm</Text>
        </View>
      )}

      <View style={styles.content}>
        <Text style={styles.name}>{dish.name}</Text>
        {dish.description && (
          <Text style={styles.description} numberOfLines={2}>
            {dish.description}
          </Text>
        )}
        
        {dish.cooking_method && (
          <View style={styles.categoryTag}>
            <Text style={styles.categoryText}>
              {getCategoryLabel(dish.cooking_method)}
            </Text>
          </View>
        )}
        
        <View style={styles.footer}>
          {dish.rating ? (
            <View style={styles.rating}>
              <Ionicons name="star" size={16} color="#FFD700" />
              <Text style={styles.ratingText}>{dish.rating}</Text>
            </View>
          ) : null}
          
          <View style={styles.priceContainer}>
            {dish.price ? (
              <Text style={styles.price}>
                {dish.price.toLocaleString('vi-VN')}₫
              </Text>
            ) : null}
            <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
              <Text style={styles.addButtonText}>Thêm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
    position: 'relative',
  },
  successBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#10b981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    zIndex: 10,
  },
  successText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  image: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
  },
  placeholderImage: {
    width: '100%',
    height: 180,
    backgroundColor: '#e0e0e0',
  },
  content: {
    padding: 16,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
    lineHeight: 20,
  },
  categoryTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 12,
  },
  categoryText: {
    fontSize: 12,
    color: '#4b5563',
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    color: '#f59e0b',
    fontWeight: '600',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e74c3c',
  },
  addButton: {
    backgroundColor: '#e74c3c',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
})

export default DishCard
