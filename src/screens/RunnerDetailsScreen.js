import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { fetchRunnerDetails } from '../services/authService';

const RunnerDetailsScreen = ({ route }) => {
  const { runnerId, runnerName } = route.params;
  const [runnerData, setRunnerData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1,
    totalItems: 0,
  });

  useEffect(() => {
    const loadRunnerData = async () => {
      try {
        setLoading(true);
        const response = await fetchRunnerDetails({
          runnerId: runnerId,
          page: pagination.page,
          limit: pagination.limit
        });

        if (response.success) {
          setRunnerData(response.data);
          setPagination({
            page: response.pagination.page,
            limit: response.pagination.limit,
            totalPages: response.pagination.totalPages,
            totalItems: response.pagination.totalItems,
          });
        } else {
          Alert.alert('Error', response.message || 'Failed to fetch runner details');
        }
      } catch (error) {
        console.error('Error fetching runner details:', error);
        Alert.alert('Error', error.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadRunnerData();
  }, [runnerId, pagination.page, pagination.limit]);

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
        <Text style={styles.sportValue}>{item.gameName || 'N/A'}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Event Name:</Text>
        <Text style={styles.eventValue}>{item.marketName || 'N/A'}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Market Name:</Text>
        <Text style={styles.marketValue}>Winner</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Selection Name:</Text>
        <Text style={styles.runnerValue}>{item.runnerName || 'N/A'}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Bet Type:</Text>
        <Text style={styles.betTypeValue}>{item.type || 'N/A'}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>User Price:</Text>
        <Text style={styles.priceValue}>{item.rate || 'N/A'}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Amount:</Text>
        <Text style={styles.amountValue}>{item.value || 'N/A'}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Profit & Loss:</Text>
        <Text style={[
          styles.profitLossValue,
          item.profitLoss >= 0 ? styles.positiveValue : styles.negativeValue
        ]}>
          {item.profitLoss || 0}
        </Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Place Date:</Text>
        <Text style={styles.timeValue}>{formatDateTime(item.placeDate)}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Match Date:</Text>
        <Text style={styles.timeValue}>{formatDateTime(item.matchDate)}</Text>
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
          <Text style={styles.runnerName}>{runnerName}</Text>
          {/* <Text style={styles.runnerId}>Runner ID: {runnerId}</Text> */}
        </View>
        <View style={styles.headerDecoration} />
        {/* <View style={styles.cornerAccent} /> */}
      </View>

      {runnerData.length > 0 ? (
        <FlatList
          data={runnerData}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={styles.listContainer}
          style={styles.scrollContainer}
        />
      ) : (
        <View style={styles.noDataContainer}>
          <Text style={styles.noData}>No data available for this runner</Text>
        </View>
      )}
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
  cornerAccent: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 0,
    height: 0,
    borderStyle: 'solid',
    borderLeftWidth: 60,
    borderRightWidth: 0,
    borderBottomWidth: 60,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#FFA726',
    transform: [{ rotate: '180deg' }],
    opacity: 0.7,
  },
  runnerName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 5,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  runnerId: {
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    flex: 1,
  },
  listContainer: {
    paddingHorizontal: 15,
    paddingTop: 15,
    paddingBottom: 30,
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
  betTypeValue: {
    color: '#00838F',
    flex: 2,
    textAlign: 'right',
    fontWeight: '500',
  },
  priceValue: {
    color: '#5D4037',
    flex: 2,
    textAlign: 'right',
    fontWeight: '500',
  },
  amountValue: {
    color: '#6A1B9A',
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
});

export default RunnerDetailsScreen;