import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
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

  // Load data when component mounts or when pagination/search changes
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
      <Text style={[styles.cell, styles.amountCell, isPositive ? styles.positiveValue : styles.negativeValue]}>
        {numericValue.toFixed(2)}
      </Text>
    );
  };

  const renderTotalProfitLoss = () => {
    const total = tableData.reduce((sum, item) => sum + parseFloat(item.profitLoss || 0), 0);
    const isPositive = total >= 0;
    
    return (
      <Text style={[styles.cell, styles.totalCell, isPositive ? styles.positiveValue : styles.negativeValue]}>
        {total.toFixed(2)}
      </Text>
    );
  };

  const handleLimitChange = (newLimit) => {
    setPagination(prev => ({
      ...prev,
      limit: newLimit,
      page: 1 // Reset to first page when changing limit
    }));
  };

  return (
    <View style={styles.mainContainer}>
      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.headerText}>PROFIT & LOSS STATEMENT</Text>
        </View>

        {/* Search Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Search Market Name</Text>
          <TextInput
            style={styles.searchInput}
            value={searchMarketName}
            onChangeText={setSearchMarketName}
            placeholder="Enter market name"
            onSubmitEditing={handleGetStatement}
          />
        </View>

        {/* Entries per page selector */}
        <View style={styles.entriesContainer}>
          <Text style={styles.entriesLabel}>Entries per page:</Text>
          <TouchableOpacity 
            style={[styles.entryButton, pagination.limit === 10 && styles.activeEntryButton]}
            onPress={() => handleLimitChange(10)}
          >
            <Text style={[styles.entryButtonText, pagination.limit === 10 && styles.activeEntryButtonText]}>10</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.entryButton, pagination.limit === 25 && styles.activeEntryButton]}
            onPress={() => handleLimitChange(25)}
          >
            <Text style={[styles.entryButtonText, pagination.limit === 25 && styles.activeEntryButtonText]}>25</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.entryButton, pagination.limit === 50 && styles.activeEntryButton]}
            onPress={() => handleLimitChange(50)}
          >
            <Text style={[styles.entryButtonText, pagination.limit === 50 && styles.activeEntryButtonText]}>50</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.entryButton, pagination.limit === 100 && styles.activeEntryButton]}
            onPress={() => handleLimitChange(100)}
          >
            <Text style={[styles.entryButtonText, pagination.limit === 100 && styles.activeEntryButtonText]}>100</Text>
          </TouchableOpacity>
        </View>

        {/* Get Statement Button */}
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

        {/* Display Profit & Loss Table */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007BFF" />
          </View>
        ) : (
          <View style={styles.tableContainer}>
            <View style={styles.tableHeader}>
              <Text style={[styles.headerCell, styles.sportCell]}>Sport Name</Text>
              <Text style={[styles.headerCell, styles.eventCell]}>Event Name</Text>
              <Text style={[styles.headerCell, styles.amountCell]}>Profit & Loss</Text>
              <Text style={[styles.headerCell, styles.totalCell]}>Total P&L</Text>
            </View>

            {/* Table rows */}
            {tableData.length > 0 ? (
              <>
                {tableData.map((row, index) => (
                  <View 
                    key={index} 
                    style={[
                      styles.tableRow, 
                      index % 2 === 0 ? styles.evenRow : styles.oddRow
                    ]}
                  >
                    <Text style={[styles.cell, styles.sportCell]}>{row.gameName}</Text>
                    <TouchableOpacity 
                      style={[styles.cell, styles.eventCell]} 
                      onPress={() => handleMarketNamePress(row.marketId, row.marketName)}
                    >
                      <Text style={styles.clickableText}>{row.marketName}</Text>
                    </TouchableOpacity>
                    {renderProfitLossValue(row.profitLoss)}
                    {renderProfitLossValue(row.profitLoss)}
                  </View>
                ))}
               
              </>
            ) : (
              <View style={styles.noDataContainer}>
                <Text style={styles.noDataText}>No data available</Text>
              </View>
            )}
          </View>
        )}

        {/* Pagination controls */}
        {tableData.length > 0 && (
          <View style={styles.paginationContainer}>
            <TouchableOpacity
              style={[styles.paginationButton, pagination.page === 1 && styles.disabledButton]}
              onPress={() => {
                if (pagination.page > 1) {
                  setPagination(prev => ({ ...prev, page: prev.page - 1 }));
                }
              }}
              disabled={pagination.page === 1}
            >
              <Text style={styles.paginationButtonText}>Previous</Text>
            </TouchableOpacity>
            
            <Text style={styles.paginationText}>
              Page {pagination.page} of {pagination.totalPages}
            </Text>
            
            <TouchableOpacity
              style={[styles.paginationButton, pagination.page >= pagination.totalPages && styles.disabledButton]}
              onPress={() => {
                if (pagination.page < pagination.totalPages) {
                  setPagination(prev => ({ ...prev, page: prev.page + 1 }));
                }
              }}
              disabled={pagination.page >= pagination.totalPages}
            >
              <Text style={styles.paginationButtonText}>Next</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 30,
  },
  header: {
    marginBottom: 20,
    alignItems: 'center',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007BFF',
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 13,
    marginBottom: 5,
    fontWeight: '600',
    color: '#555',
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 12,
    alignItems: 'center',
    borderRadius: 6,
    marginVertical: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  tableContainer: {
    marginTop: 15,
    borderRadius: 6,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: 'white',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#007BFF',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  headerCell: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 13,
  },
  sportCell: {
    flex: 1.5,
    justifyContent: 'center',
  },
  eventCell: {
    flex: 2,
    justifyContent: 'center',
  },
  amountCell: {
    flex: 1,
    textAlign: 'center',
    justifyContent: 'center',
  },
  totalCell: {
    flex: 1,
    textAlign: 'right',
    justifyContent: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 12,
    minHeight: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    alignItems: 'center',
  },
  evenRow: {
    backgroundColor: '#f9f9f9',
  },
  oddRow: {
    backgroundColor: 'white',
  },
  totalRow: {
    backgroundColor: '#e6f2ff',
    borderTopWidth: 2,
    borderTopColor: '#007BFF',
  },
  cell: {
    fontSize: 13,
    color: '#333',
  },
  clickableText: {
    color: '#007BFF',
    textDecorationLine: 'underline',
  },
  positiveValue: {
    color: '#28a745',
    fontWeight: 'bold',
  },
  negativeValue: {
    color: '#dc3545',
    fontWeight: 'bold',
  },
  totalText: {
    fontWeight: 'bold',
    color: '#007BFF',
  },
  loadingContainer: {
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
    height: 100,
  },
  noDataContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noDataText: {
    fontSize: 14,
    color: '#666',
  },
  searchInput: {
    height: 45,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    backgroundColor: 'white',
    fontSize: 13,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15,
    paddingHorizontal: 10,
  },
  paginationButton: {
    padding: 10,
    backgroundColor: '#007BFF',
    borderRadius: 5,
    minWidth: 80,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  paginationButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  paginationText: {
    fontSize: 14,
    color: '#333',
  },
  entriesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  entriesLabel: {
    fontSize: 13,
    marginRight: 10,
    color: '#555',
  },
  entryButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#007BFF',
  },
  activeEntryButton: {
    backgroundColor: '#007BFF',
  },
  entryButtonText: {
    fontSize: 13,
    color: '#007BFF',
  },
  activeEntryButtonText: {
    color: 'white',
  },
});

export default LotteryProfitAndLossScreen;