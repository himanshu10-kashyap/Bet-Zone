import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  ActivityIndicator, 
  Alert, 
  TextInput,
  ScrollView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { fetchLotteryProfitLoss } from '../services/authService.js';

const LotteryProfitAndLossScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1,
    totalItems: 0,
  });
  const [searchMarketName, setSearchMarketName] = useState('');

  const handleGetStatement = async () => {
    try {
      setLoading(true);
      
      const response = await fetchLotteryProfitLoss({
        page: pagination.page,
        limit: pagination.limit,
        searchMarketName
      });

      if (response.success) {
        setTableData(response.data);
        setPagination(response.pagination);
      } else {
        Alert.alert('Error', response.message || 'Failed to fetch profit/loss data');
        setTableData([]);
      }
    } catch (error) {
      console.error('Error fetching profit/loss:', error);
      Alert.alert('Error', error.message || 'Failed to fetch profit/loss data');
      setTableData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleGetStatement();
  }, [pagination.page, pagination.limit, searchMarketName]);

  const handleMarketNamePress = (marketId, marketName) => {
    navigation.navigate('MarketDetailsScreen', { 
      marketId,
      marketName 
    });
  };

  const renderProfitLossValue = (value) => {
    const numericValue = parseFloat(value || 0);
    const isPositive = numericValue >= 0;
    
    return (
      <Text style={[styles.value, isPositive ? styles.positiveValue : styles.negativeValue]}>
        {numericValue.toFixed(2)}
      </Text>
    );
  };

  const handleLimitChange = (newLimit) => {
    setPagination(prev => ({
      ...prev,
      limit: newLimit,
      page: 1
    }));
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
        <TouchableOpacity onPress={() => handleMarketNamePress(item.marketId, item.marketName)}>
          <Text style={[styles.eventValue, styles.clickableText]}>{item.marketName}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Profit & Loss:</Text>
        {renderProfitLossValue(item.profitLoss)}
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Total P&L:</Text>
        {renderProfitLossValue(item.profitLoss)}
      </View>
      <View style={styles.separator} />
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6a11cb" />
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          value={searchMarketName}
          onChangeText={setSearchMarketName}
          placeholder="Search market name..."
          placeholderTextColor="#999"
          onSubmitEditing={handleGetStatement}
        />
      </View>

      <View style={styles.entriesContainer}>
        <Text style={styles.entriesLabel}>Show:</Text>
        {[10, 25, 50, 100].map((limit) => (
          <TouchableOpacity 
            key={limit}
            style={[
              styles.entryButton, 
              pagination.limit === limit && styles.activeEntryButton
            ]}
            onPress={() => handleLimitChange(limit)}
          >
            <Text style={[
              styles.entryButtonText,
              pagination.limit === limit && styles.activeEntryButtonText
            ]}>
              {limit}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity 
        style={styles.button} 
        onPress={handleGetStatement}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>GENERATE STATEMENT</Text>
        )}
      </TouchableOpacity>

      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {tableData.length > 0 ? (
          <FlatList
            data={tableData}
            renderItem={renderItem}
            keyExtractor={(item, index) => index.toString()}
            scrollEnabled={false}
            contentContainerStyle={styles.listContainer}
          />
        ) : (
          <View style={styles.noDataContainer}>
            <Text style={styles.noData}>No data available</Text>
          </View>
        )}
      </ScrollView>

      {tableData.length > 0 && (
        <View style={styles.paginationContainer}>
          <TouchableOpacity
            style={[
              styles.paginationButton,
              pagination.page === 1 && styles.disabledButton
            ]}
            onPress={() => {
              if (pagination.page > 1) {
                setPagination(prev => ({ ...prev, page: prev.page - 1 }));
              }
            }}
            disabled={pagination.page === 1}
          >
            <Icon name="chevron-left" size={20} color={pagination.page === 1 ? "#999" : "#6a11cb"} />
            <Text style={[
              styles.paginationButtonText,
              pagination.page === 1 && styles.disabledText
            ]}>
              Previous
            </Text>
          </TouchableOpacity>
          
          <Text style={styles.paginationText}>
            Page {pagination.page} of {pagination.totalPages}
          </Text>
          
          <TouchableOpacity
            style={[
              styles.paginationButton,
              pagination.page >= pagination.totalPages && styles.disabledButton
            ]}
            onPress={() => {
              if (pagination.page < pagination.totalPages) {
                setPagination(prev => ({ ...prev, page: prev.page + 1 }));
              }
            }}
            disabled={pagination.page >= pagination.totalPages}
          >
            <Text style={[
              styles.paginationButtonText,
              pagination.page >= pagination.totalPages && styles.disabledText
            ]}>
              Next
            </Text>
            <Icon name="chevron-right" size={20} color={pagination.page >= pagination.totalPages ? "#999" : "#6a11cb"} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingTop: 15,
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
    flex: 1,
  },
  value: {
    fontSize: 15,
    color: '#2c3e50',
    flex: 2,
    textAlign: 'right',
    fontWeight: '500',
  },
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
  clickableText: {
    color: '#6a11cb',
    fontWeight: 'bold',
  },
  positiveValue: {
    color: '#28a745',
  },
  negativeValue: {
    color: '#dc3545',
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginHorizontal: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 45,
    fontSize: 14,
    color: '#333',
  },
  entriesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 15,
  },
  entriesLabel: {
    fontSize: 14,
    marginRight: 10,
    color: '#555',
  },
  entryButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  activeEntryButton: {
    backgroundColor: '#6a11cb',
    borderColor: '#6a11cb',
  },
  entryButtonText: {
    fontSize: 14,
    color: '#555',
  },
  activeEntryButtonText: {
    color: '#fff',
  },
  button: {
    backgroundColor: '#6a11cb',
    padding: 12,
    alignItems: 'center',
    borderRadius: 6,
    marginHorizontal: 15,
    marginBottom: 15,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginHorizontal: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  paginationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  disabledButton: {
    opacity: 0.6,
  },
  paginationButtonText: {
    fontSize: 14,
    color: '#6a11cb',
    fontWeight: '500',
    marginHorizontal: 5,
  },
  disabledText: {
    color: '#999',
  },
  paginationText: {
    fontSize: 14,
    color: '#555',
    fontWeight: '500',
  },
});

export default LotteryProfitAndLossScreen;