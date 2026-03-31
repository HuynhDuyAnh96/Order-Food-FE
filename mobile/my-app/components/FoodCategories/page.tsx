import React from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

interface Category {
  id: string
  name: string
  icon: keyof typeof Ionicons.glyphMap
  count: number
  cookingMethod: string
}

const FoodCategories = () => {
  const categories: Category[] = [
    { id: '1', name: 'Món Xào', icon: 'restaurant', count: 15, cookingMethod: 'stir-fried' },
    { id: '2', name: 'Món Hấp', icon: 'restaurant', count: 6, cookingMethod: 'steamed' },
    { id: '3', name: 'Món Nướng', icon: 'restaurant', count: 8, cookingMethod: 'grilled' },
    { id: '4', name: 'Món Chiên', icon: 'restaurant', count: 12, cookingMethod: 'fried' },
  ]

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Food Categories</Text>
      <View style={styles.scrollContainer}>
        <FlatList
          data={categories}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          nestedScrollEnabled={true}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.categoryButton}>
              <View style={styles.iconContainer}>
                <Ionicons name={item.icon} size={24} color="#10b981" />
              </View>
              <Text style={styles.categoryName}>{item.name}</Text>
              <Text style={styles.categoryCount}>{item.count} items</Text>
            </TouchableOpacity>
          )}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  scrollContainer: {
    height: 120,
  },
  listContent: {
    paddingHorizontal: 16,
  },
  categoryButton: {
    alignItems: 'center',
    marginRight: 16,
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    minWidth: 100,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0fdf4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
    textAlign: 'center',
  },
  categoryCount: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
})

export default FoodCategories
