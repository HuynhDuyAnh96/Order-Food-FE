import { View, Text, StyleSheet, TouchableOpacity, Pressable } from 'react-native'
import React from 'react'
import { Image } from 'expo-image'
import { Ionicons } from '@expo/vector-icons'

const Header = () => {
  return (
    <View style={styles.container}>
      {/* Banner Image */}
      <Image source={require('@/assets/public/img/baner.jpg')} style={styles.bannerImage} />
      
      {/* Navigation Bar */}
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="menu" size={24} color="#000" />
        </TouchableOpacity>
        
        <Text style={styles.title}>Dishes</Text>
        
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="notifications-outline" size={24} color="#000" />
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
    bannerImage: {
        width: '100%',
        height: 200,
        resizeMode: 'cover',
    },
    navBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    iconButton: {
        padding: 8,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
    },
})

export default Header