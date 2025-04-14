import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import { fetchAllGameData } from '../services/authService.js';
import { useNavigation } from '@react-navigation/native';

const LotteryScreen = () => {
  const navigation = useNavigation();
  const [lotteryData, setLotteryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await fetchAllGameData();
      
      if (response.success) {
        const lotteryGame = response.data.find(game => game.gameName === "Lottery");
        if (lotteryGame) {
          setLotteryData(lotteryGame);
        } else {
          setError("No lottery data available");
        }
      } else {
        setError(response.message || "Failed to load lottery data");
      }
    } catch (err) {
      console.error("Error fetching lottery data:", err);
      setError(err.message || "An error occurred while fetching data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const handleMarketPress = (market) => {
    navigation.navigate('LotteryMarketDetailScreen', { 
      marketId: market.marketId, 
      marketName: market.marketName 
    });
  };

  const renderMarketItem = ({ item }) => {
    const statusColor = item.isActive ? '#4CAF50' : '#F44336';
    const statusText = item.isActive ? 'ACTIVE' : 'INACTIVE';
    
    return (
      <TouchableOpacity 
        style={[
          styles.marketCard,
          styles.itemContainer,
          item.isActive ? styles.activeMarket : styles.inactiveMarket
        ]}
        onPress={() => handleMarketPress(item)}
      >
        <View style={styles.marketHeader}>
          <Text style={styles.marketName}>{item.marketName || 'Unnamed Market'}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>{statusText}</Text>
          </View>
        </View>
        
        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Group Start:</Text>
            <Text style={styles.detailValue}>{item.group_start || 'N/A'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Group End:</Text>
            <Text style={styles.detailValue}>{item.group_end || 'N/A'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Series Start:</Text>
            <Text style={styles.detailValue}>{item.series_start || 'N/A'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Series End:</Text>
            <Text style={styles.detailValue}>{item.series_end || 'N/A'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Number Start:</Text>
            <Text style={styles.detailValue}>{item.number_start || 'N/A'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Number End:</Text>
            <Text style={styles.detailValue}>{item.number_end || 'N/A'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Start Time:</Text>
            <Text style={styles.detailValue}>{formatDate(item.start_time || item.startTime)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>End Time:</Text>
            <Text style={styles.detailValue}>{formatDate(item.end_time || item.endTime)}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6a11cb" />
        <Text style={styles.loadingText}>Loading lottery data...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!lotteryData || !lotteryData.markets || lotteryData.markets.length === 0) {
    return (
      <View style={styles.noDataContainer}>
        <Text style={styles.noDataText}>No lottery markets available</Text>
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <FlatList
        data={lotteryData.markets}
        renderItem={renderMarketItem}
        keyExtractor={item => item.marketId}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#6a11cb']}
            tintColor="#6a11cb"
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingTop: 15,
  },
  listContainer: {
    paddingHorizontal: 15,
    paddingBottom: 30,
  },
  itemContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 18,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  activeMarket: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  inactiveMarket: {
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
  },
  marketCard: {
    overflow: 'hidden',
  },
  marketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  marketName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
    textTransform: 'uppercase',
  },
  detailsContainer: {
    marginTop: 10,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 10,
    color: '#7f8c8d',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  errorText: {
    color: '#C62828',
    fontSize: 16,
    textAlign: 'center',
    padding: 20,
    fontWeight: '500',
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  noDataText: {
    textAlign: 'center',
    color: '#95a5a6',
    fontSize: 17,
    fontWeight: '500',
  },
});

export default LotteryScreen;