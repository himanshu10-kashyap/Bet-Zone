import React, { useEffect, useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Dimensions, 
  Image, 
  FlatList, 
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView
} from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useNavigation } from '@react-navigation/native';
import { fetchSliderImages, fetchAllMarkets, fetchAllGameData } from '../services/authService';

const Tab = createMaterialTopTabNavigator();
const { width } = Dimensions.get('window');

function ImageSlider() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);

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

  useEffect(() => {
    if (images.length > 0) {
      const interval = setInterval(() => {
        const nextIndex = (currentIndex + 1) % images.length;
        setCurrentIndex(nextIndex);
        flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [currentIndex, images.length]);

  const renderItem = ({ item }) => (
    <Image source={{ uri: item }} style={styles.sliderImage} />
  );

  if (loading) return <ActivityIndicator style={{ marginTop: 20 }} color="#6a11cb" />;

  return (
    <View style={styles.sliderContainer}>
      <FlatList
        ref={flatListRef}
        data={images}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScrollToIndexFailed={() => {}}
      />
      {images.length > 0 && (
        <View style={styles.pagination}>
          {images.map((_, index) => (
            <View 
              key={index}
              style={[
                styles.paginationDot,
                index === currentIndex ? styles.activeDot : styles.inactiveDot
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
}

function HomeTab() {
  const navigation = useNavigation();
  const [gameData, setGameData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetchAllGameData();
        setGameData(response.data);
      } catch (error) {
        console.error('Error loading game data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const renderItem = ({ item }) => (
    <View style={styles.gameCard}>
      <Text style={styles.gameTitle}>{item.gameName}</Text>
      {item.markets?.map(market => (
        <TouchableOpacity 
          key={market.marketId} 
          style={styles.marketItem}
          onPress={() => navigation.navigate('GameDetailsScreen', { marketId: market.marketId })}
        >
          <Text style={styles.marketName}>{market.marketName}</Text>
          <Text style={styles.marketTime}>Start: {formatDate(market.startTime || market.start_time)}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  if (loading) {
    return <ActivityIndicator size="large" style={styles.loadingIndicator} color="#6a11cb" />;
  }

  return (
    <SafeAreaView style={styles.tabContent}>
      <FlatList
        data={gameData}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
}

function LotteryTab() {
  const navigation = useNavigation();
  const [markets, setMarkets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMarkets = async () => {
      try {
        const data = await fetchAllMarkets();
        setMarkets(data);
      } catch (error) {
        console.error('Error loading markets:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMarkets();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const renderMarketItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.marketCard}
      onPress={() => navigation.navigate('LotteryPlayScreen', { marketId: item.marketId })}
    >
      <View style={styles.marketHeader}>
        <Text style={styles.marketName}>{item.marketName}</Text>
        <View style={[styles.statusBadge, item.isActive ? styles.activeBadge : styles.inactiveBadge]}>
          <Text style={styles.statusText}>{item.isActive ? 'ACTIVE' : 'INACTIVE'}</Text>
        </View>
      </View>
      
      <View style={styles.detailsContainer}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Start Time:</Text>
          <Text style={styles.detailValue}>{formatDate(item.start_time)}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Series Range:</Text>
          <Text style={styles.detailValue}>{item.series_start} to {item.series_end}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Number Range:</Text>
          <Text style={styles.detailValue}>{item.number_start} to {item.number_end}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6a11cb" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.tabContent}>
      <FlatList
        data={markets}
        renderItem={renderMarketItem}
        keyExtractor={(item) => item.marketId}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No lottery markets available</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

function ColorGameTab() {
  const navigation = useNavigation();
  const [colorGames, setColorGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadColorGames = async () => {
      try {
        const response = await fetchAllGameData();
        const colorGameData = response.data.find(game => game.gameName === 'COLORGAME');
        setColorGames(colorGameData?.markets || []);
      } catch (error) {
        console.error('Error loading color games:', error);
      } finally {
        setLoading(false);
      }
    };

    loadColorGames();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const renderMarketItem = ({ item }) => {
    const firstRunner = item.runners?.[0];
    const backValue = firstRunner?.rate?.[0]?.back || 'N/A';
    const layValue = firstRunner?.rate?.[0]?.lay || 'N/A';

    return (
      <TouchableOpacity 
        style={[
          styles.marketCard,
          item.isActive ? styles.activeMarket : styles.inactiveMarket
        ]}
        onPress={() => navigation.navigate('ColorGamePlayScreen', { marketId: item.marketId })}
      >
        <View style={styles.marketHeader}>
          <Text style={styles.marketName}>{item.marketName}</Text>
          <View style={[styles.statusBadge, item.isActive ? styles.activeBadge : styles.inactiveBadge]}>
            <Text style={styles.statusText}>{item.isActive ? 'ACTIVE' : 'INACTIVE'}</Text>
          </View>
        </View>
        
        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Start Time:</Text>
            <Text style={styles.detailValue}>{formatDate(item.startTime)}</Text>
          </View>
          
          <View style={styles.oddsContainer}>
            <View style={styles.backBox}>
              <Text style={styles.oddLabel}>Back</Text>
              <Text style={styles.oddValue}>{backValue}</Text>
            </View>
            <View style={styles.layBox}>
              <Text style={styles.oddLabel}>Lay</Text>
              <Text style={styles.oddValue}>{layValue}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6a11cb" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.tabContent}>
      <FlatList
        data={colorGames}
        renderItem={renderMarketItem}
        keyExtractor={(item) => item.marketId}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No color games available</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <ImageSlider />
      <Tab.Navigator
        screenOptions={{
          tabBarLabelStyle: { 
            fontSize: 14, 
            fontWeight: 'bold',
            textTransform: 'none', 
          },
          tabBarIndicatorStyle: { 
            backgroundColor: '#3F51B5',
            height: 3,
          },
          tabBarStyle: { 
            backgroundColor: 'white',
            elevation: 0,
            shadowOpacity: 0,
          },
          tabBarActiveTintColor: '#3F51B5',
          tabBarInactiveTintColor: 'gray',
        }}
        initialRouteName="Home"
      >
        <Tab.Screen name="Home" component={HomeTab} />
        <Tab.Screen name="Lottery" component={LotteryTab} />
        <Tab.Screen name="Color Game" component={ColorGameTab} />
      </Tab.Navigator>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  sliderContainer: {
    height: 200,
    position: 'relative',
  },
  sliderImage: {
    width: width,
    height: '100%',
    resizeMode: 'cover',
  },
  pagination: {
    position: 'absolute',
    bottom: 10,
    flexDirection: 'row',
    alignSelf: 'center',
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#6a11cb',
  },
  inactiveDot: {
    backgroundColor: 'rgba(106,17,203,0.4)',
  },
  tabContent: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingIndicator: {
    marginTop: 20,
  },
  gameCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  gameTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#3F51B5',
  },
  marketItem: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  marketName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  marketTime: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  marketCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  marketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  activeBadge: {
    backgroundColor: '#4CAF50',
  },
  inactiveBadge: {
    backgroundColor: '#F44336',
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  detailsContainer: {
    marginTop: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  oddsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
  },
  backBox: {
    backgroundColor: '#87CEEB',
    padding: 10,
    borderRadius: 6,
    width: '45%',
    alignItems: 'center',
  },
  layBox: {
    backgroundColor: '#FFC0CB',
    padding: 10,
    borderRadius: 6,
    width: '45%',
    alignItems: 'center',
  },
  oddLabel: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
    fontWeight: '500',
  },
  oddValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  listContent: {
    paddingVertical: 16,
  },
  activeMarket: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  inactiveMarket: {
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
  },
});