import { ScrollView } from 'react-native';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '@/components/Header';
import Dishes from '@/components/Dishes/page';
import FoodCategories from '@/components/FoodCategories/page';
import PopularItems from '@/components/PopularItems/page';

export default function HomeScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
      >
        <Header />
        <FoodCategories />
        <PopularItems />
        <Dishes />
      </ScrollView>
    </SafeAreaView>
  );
}
