import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity,
  FlatList, StyleSheet, ScrollView, KeyboardAvoidingView,
  Platform, Modal, ActivityIndicator, TextInput, RefreshControl
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { fetchAllMarketsByDate, fetchPurchaseHistory } from '../services/authService';

const LotteryPurchaseScreen = () => {
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [searchSem, setSearchSem] = useState('');
  const [selectedMarket, setSelectedMarket] = useState(null);
  const [markets, setMarkets] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTickets, setSelectedTickets] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadMarkets = async () => {
    try {
      setLoading(true);
      const formattedDate = date.toISOString().split('T')[0];
      const marketData = await fetchAllMarketsByDate(formattedDate);
      setMarkets(marketData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadPurchaseHistory = async () => {
    if (selectedMarket) {
      try {
        setLoading(true);
        const purchaseData = await fetchPurchaseHistory(selectedMarket, { sem: searchSem });
        setPurchases(purchaseData);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    }
  };

  useEffect(() => {
    loadMarkets();
  }, [date]); // Add date as dependency to reload when date changes

  useEffect(() => {
    loadPurchaseHistory();
  }, [selectedMarket, searchSem]);

  const handleDateChange = (event, selectedDate) => {
    setShowPicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const handleTicketsPress = (tickets) => {
    setSelectedTickets(tickets);
    setModalVisible(true);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadPurchaseHistory();
  };

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
        <Text style={styles.label}>Market Name:</Text>
        <Text style={styles.marketValue}>{item.marketName}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Price:</Text>
        <Text style={styles.priceValue}>₹{item.price}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>SEM:</Text>
        <Text style={styles.semValue}>{item.sem}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>User Name:</Text>
        <Text style={styles.userValue}>{item.userName}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Tickets:</Text>
        <TouchableOpacity 
          style={styles.ticketsContainer} 
          onPress={() => handleTicketsPress(item.tickets)}
        >
          <Text style={styles.ticketCount}>{item.tickets.length} tickets (tap to view)</Text>
          {item.tickets.slice(0, 2).map((ticket, index) => (
            <Text key={index} style={styles.ticketValue}>{ticket}</Text>
          ))}
          {item.tickets.length > 2 && (
            <Text style={styles.moreTickets}>+{item.tickets.length - 2} more</Text>
          )}
        </TouchableOpacity>
      </View>
      <View style={styles.separator} />
    </View>
  );

  return (
    <View style={styles.mainContainer}>
      {/* Fixed Filter Container */}
      <View style={styles.filterContainer}>
        {/* Date Picker */}
        <TouchableOpacity 
          style={styles.dateButton} 
          onPress={() => setShowPicker(true)}
        >
          <Text style={styles.dateButtonText}>Date: {date.toLocaleDateString()}</Text>
        </TouchableOpacity>
        
        {showPicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        )}

        {/* Market Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Market</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.marketScroll}
          >
            {markets.map(market => (
              <TouchableOpacity
                key={market.marketId}
                style={[
                  styles.marketTab,
                  selectedMarket === market.marketId && styles.selectedMarketTab
                ]}
                onPress={() => setSelectedMarket(market.marketId)}
              >
                <Text style={[
                  styles.marketTabText,
                  selectedMarket === market.marketId && styles.selectedMarketTabText
                ]}>
                  {market.marketName}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* SEM Search */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Search by SEM</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Enter SEM number..."
            placeholderTextColor="#999"
            value={searchSem}
            onChangeText={setSearchSem}
            keyboardType="numeric"
          />
        </View>
      </View>

      {/* Scrollable Purchase List with Pull-to-Refresh */}
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007BFF" />
        </View>
      ) : (
        <FlatList
          data={purchases}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={styles.listContainer}
          style={styles.dataList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#007BFF']}
              tintColor="#007BFF"
            />
          }
          ListEmptyComponent={
            <View style={styles.noDataContainer}>
              <Text style={styles.noData}>
                {selectedMarket ? 'No purchases found' : 'Select a market to view purchases'}
              </Text>
            </View>
          }
        />
      )}

      {/* Tickets Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Tickets Details</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScroll}>
              {selectedTickets.map((ticket, index) => (
                <View key={index} style={styles.modalTicketItem}>
                  <Text style={styles.modalTicketText}>{ticket}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  filterContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 18,
    margin: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  dataList: {
    flex: 1,
    marginHorizontal: 15,
  },
  dateButton: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  dateButtonText: {
    color: '#333',
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 8,
  },
  marketScroll: {
    maxHeight: 50,
  },
  marketTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 20,
  },
  selectedMarketTab: {
    backgroundColor: '#6a11cb',
  },
  marketTabText: {
    color: '#333',
    fontSize: 14,
  },
  selectedMarketTabText: {
    color: '#fff',
  },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
    color: '#333',
  },
  listContainer: {
    paddingBottom: 20,
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
  marketValue: {
    color: '#1565C0',
    flex: 2,
    textAlign: 'right',
    fontWeight: '500',
  },
  priceValue: {
    color: '#00838F',
    flex: 2,
    textAlign: 'right',
    fontWeight: '500',
  },
  semValue: {
    color: '#D84315',
    flex: 2,
    textAlign: 'right',
    fontWeight: '500',
  },
  userValue: {
    color: '#6A1B9A',
    flex: 2,
    textAlign: 'right',
    fontWeight: '500',
  },
  ticketsContainer: {
    flex: 2,
  },
  ticketCount: {
    fontSize: 14,
    color: '#3498db',
    marginBottom: 4,
    textAlign: 'right',
    fontWeight: '500',
  },
  ticketValue: {
    fontSize: 15,
    color: '#2c3e50',
    marginBottom: 4,
    textAlign: 'right',
    fontWeight: '500',
    backgroundColor: '#ECEFF1',
    padding: 4,
    borderRadius: 4,
  },
  moreTickets: {
    fontSize: 14,
    color: '#95a5a6',
    textAlign: 'right',
    fontStyle: 'italic',
  },
  separator: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginTop: 15,
    marginBottom: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
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
  // Modal styles
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    borderRadius: 10,
    maxHeight: '70%',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    fontSize: 24,
    color: '#7f8c8d',
  },
  modalScroll: {
    paddingHorizontal: 15,
  },
  modalTicketItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#FAFAFA',
  },
  modalTicketText: {
    fontSize: 15,
    color: '#34495e',
  },
});

export default LotteryPurchaseScreen;