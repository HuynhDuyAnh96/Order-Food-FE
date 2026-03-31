import { View, Text, ScrollView } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import Header from '@/components/Header'
import Dishes from '@/components/Dishes/page'
import FoodCategories from '@/components/FoodCategories/page'
import PopularItems from '@/components/PopularItems/page'

const Home = () => {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f9fafb' }}>
        <ScrollView 
          showsVerticalScrollIndicator={false}
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1 }}
        >
            <Header />
            <View style={{ backgroundColor: '#fff', minHeight: 100 }}>
              <Text style={{ padding: 20, backgroundColor: '#ff9800', color: '#000' }}>
                TEST BEFORE DISHES - Should see this
              </Text>
            </View>
            <Dishes />
            <FoodCategories />
            <PopularItems />
            <View style={{ backgroundColor: '#4caf50', padding: 20, margin: 16 }}>
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>
                TEST AFTER ALL COMPONENTS - Should see this at bottom
              </Text>
            </View>
        </ScrollView>
    </SafeAreaView>
  )
}

export default Home