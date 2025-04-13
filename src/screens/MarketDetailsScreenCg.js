import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, FlatList, Alert, TouchableOpacity, Modal } from 'react-native';
import { fetchCgBetHistoryProfitLoss } from '../services/authService';
import { useNavigation } from '@react-navigation/native';

const MarketDetailsScreenCg = ({ route }) => {
  const navigation = useNavigation();
  const { marketId, marketName } = route.params;
  const [marketData, setMarketData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMarketData = async () => {
      try {
        setLoading(true);
        const response = await fetchCgBetHistoryProfitLoss(marketId);

        if (response.success) {
          setMarketData(response.data);
        } else {
          Alert.alert('Error', response.message || 'Failed to fetch market details');
        }
      } catch (error) {
        console.error('Error fetching market details:', error);
        Alert.alert('Error', error.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadMarketData();
  }, [marketId]);

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'N/A';
    const date = new Date(dateTimeString);
    return date.toLocaleString();
  };

  const renderItem = ({ item, index }) => (
    <View style={[
      styles.itemContainer,
      index % 2 === 0 ? styles.evenItem : styles.oddItem
    ]}>
      <View style={styles.row}>
        <Text style={styles.label}>Sport Name:</Text>
        <Text style={styles.sportValue}>{item.gameName}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Event Name:</Text>
        <TouchableOpacity onPress={() => {
          if (item.runnerId) {
            navigation.navigate('RunnerDetailsScreen', {
              runnerId: item.runnerId,
              runnerName: item.runnerName
            });
          }
        }}>
          <Text style={[styles.eventValue, styles.clickableText]}>{item.marketName}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Market Name</Text>
        <Text style={styles.marketValue}>Winner</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Result</Text>
        <Text style={styles.runnerValue}>{item.runnerName}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Profit & Loss</Text>
        <Text style={[
          styles.profitLossValue,
          item.profitLoss >= 0 ? styles.positiveValue : styles.negativeValue
        ]}>
          {item.profitLoss}
        </Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Settle Time:</Text>
        <Text style={styles.timeValue}>{formatDateTime(item.settleTime)}</Text>
      </View>
      <View style={styles.separator} />
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6D00" />
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      {/* Enhanced Header */}
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <Text style={styles.marketName}>{marketName}</Text>
          {/* <Text style={styles.marketId}>Market ID: {marketId}</Text> */}
        </View>
        <View style={styles.headerDecoration} />
      </View>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {marketData && marketData.length > 0 ? (
          <FlatList
            data={marketData}
            renderItem={renderItem}
            keyExtractor={(item, index) => index.toString()}
            scrollEnabled={false}
            contentContainerStyle={styles.listContainer}
          />
        ) : (
          <View style={styles.noDataContainer}>
            <Text style={styles.noData}>No data available for this market</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  // Enhanced Header Styles
  headerContainer: {
    backgroundColor: '#ffffff',
    paddingTop: 25,
    paddingBottom: 15,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    overflow: 'hidden',
    marginBottom: 15,
  },
  header: {
    paddingHorizontal: 20,
    zIndex: 2,
  },
  headerDecoration: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 5,
    backgroundColor: '#FF6D00',
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
  },
  marketName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 5,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  marketId: {
    fontSize: 14,
    color: '#BF360C',
    backgroundColor: '#FFCC80',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 15,
    alignSelf: 'flex-start',
    overflow: 'hidden',
    fontWeight: '600',
    borderWidth: 1,
    borderColor: '#FFA000',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  listContainer: {
    paddingHorizontal: 15,
    paddingTop: 15,
  },
  // Item Container Styles
  evenItem: {
    backgroundColor: '#ffffff',
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  oddItem: {
    backgroundColor: '#f9f9f9',
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  itemContainer: {
    padding: 18,
    marginBottom: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    alignItems: 'center',
  },
  label: {
    fontSize: 15,
    color: '#7f8c8d',
    fontWeight: '500',
    width: '30%',
  },
  // Value Styles
  sportValue: {
    color: '#2E7D32',
    flex: 2,
    textAlign: 'right',
    fontWeight: '500',
  },
  eventValue: {
    color: '#1565C0',
    flex: 2,
    textAlign: 'right',
    fontWeight: '500',
  },
  marketValue: {
    color: '#6A1B9A',
    flex: 2,
    textAlign: 'right',
    fontWeight: '500',
  },
  runnerValue: {
    color: '#D84315',
    flex: 2,
    textAlign: 'right',
    fontWeight: '500',
  },
  profitLossValue: {
    flex: 2,
    textAlign: 'right',
    fontWeight: 'bold',
    fontSize: 16,
  },
  positiveValue: {
    color: '#2E7D32',
  },
  negativeValue: {
    color: '#C62828',
  },
  timeValue: {
    color: '#5D4037',
    flex: 2,
    textAlign: 'right',
    fontWeight: '400',
    fontSize: 14,
  },
  separator: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginTop: 15,
    marginBottom: 5,
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  noData: {
    textAlign: 'center',
    color: '#95a5a6',
    fontSize: 17,
    fontWeight: '500',
  },
  clickableText: {
    color: '#3498db',
    textDecorationLine: 'none',
  },
});

export default MarketDetailsScreenCg;