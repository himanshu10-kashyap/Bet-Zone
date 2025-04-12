import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, Image, FlatList, ActivityIndicator, SafeAreaView } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { fetchSliderImages } from '../services/authService'; // Adjust path as needed

const Tab = createMaterialTopTabNavigator();
const { width } = Dimensions.get('window');

function ImageSlider() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadImages = async () => {
      try {
        const imgs = await fetchSliderImages();
        setImages(imgs);
      } catch (error) {
        console.error('Error loading slider images:', error);
      } finally {
        setLoading(false);
      }
    };

    loadImages();
  }, []);

  const renderItem = ({ item }) => (
    <Image source={{ uri: item }} style={styles.sliderImage} />
  );

  if (loading) return <ActivityIndicator style={{ marginTop: 20 }} />;

  return (
    <FlatList
      data={images}
      renderItem={renderItem}
      keyExtractor={(item, index) => index.toString()}
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
    />
  );
}

function HomeTab() {
  return (
    <View style={styles.tabContent}>
      <Text>Welcome to Home Tab</Text>
    </View>
  );
}

function LotteryTab() {
  return (
    <View style={styles.tabContent}>
      <Text>Lottery Tab Content</Text>
    </View>
  );
}

function ColorGameTab() {
  return (
    <View style={styles.tabContent}>
      <Text>Color Game Tab Content</Text>
    </View>
  );
}

export default function HomeScreen() {
  return (
    <View style={{ flex: 1, padding: 0, margin: 0 }}>
      <ImageSlider />
      <Tab.Navigator
        screenOptions={{
          tabBarLabelStyle: { fontSize: 14, fontWeight: 'bold' },
          tabBarIndicatorStyle: { backgroundColor: '#3F51B5' },
          tabBarStyle: { margin: 0, padding: 0 },  // <-- Add this
        }}
      >
        <Tab.Screen name="Home" component={HomeTab} />
        <Tab.Screen name="Lottery" component={LotteryTab} />
        <Tab.Screen name="Colorgame" component={ColorGameTab} />
      </Tab.Navigator>
    </View>
  );
}

const styles = StyleSheet.create({
  tabContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sliderImage: {
    width: width,
    height: 200,
    resizeMode: 'cover',
  },
});
