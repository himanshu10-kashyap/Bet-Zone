import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  Modal, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator 
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { fetchMarketsByDate, fetchLotteryResultsByMarket } from '../services/authService';

const LotteryResultsScreen = () => {
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [markets, setMarkets] = useState([]);
  const [selectedMarket, setSelectedMarket] = useState(null);
  const [results, setResults] = useState([]);
  const [selectedResult, setSelectedResult] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Format date as YYYY-MM-DD
  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  // Organize results by prize category
  const organizeResults = (data) => {
    const prizeOrder = [
      'First Prize', 
      'Second Prize', 
      'Third Prize', 
      'Fourth Prize', 
      'Fifth Prize',
      'Complementary Prize'
    ];
    
    return [...data].sort((a, b) => {
      return prizeOrder.indexOf(a.prizeCategory) - prizeOrder.indexOf(b.prizeCategory);
    });
  };

  // Fetch markets when date changes
  useEffect(() => {
    const fetchMarkets = async () => {
      try {
        setLoading(true);
        const formattedDate = formatDate(date);
        const response = await fetchMarketsByDate(formattedDate);
        setMarkets(response.data);
        
        if (response.data.length > 0) {
          setSelectedMarket(response.data[0]);
        } else {
          setSelectedMarket(null);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    };

    fetchMarkets();
  }, [date]);

  // Fetch results when market changes
  useEffect(() => {
    const fetchResults = async () => {
      if (!selectedMarket) return;
      
      try {
        setLoading(true);
        const response = await fetchLotteryResultsByMarket(selectedMarket.marketId);
        setResults(organizeResults(response.data));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [selectedMarket]);

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    const formattedDate = formatDate(date);
    fetchMarketsByDate(formattedDate)
      .then(response => {
        setMarkets(response.data);
        if (response.data.length > 0) {
          setSelectedMarket(response.data[0]);
        }
      })
      .catch(error => console.error(error))
      .finally(() => setRefreshing(false));
  };

  const getPrizeCategoryColor = (category) => {
    switch(category) {
      case '1st Prize': return '#4CAF50'; // Green
      case 'First Prize': return '#4CAF50'; // Green
      case 'Second Prize': return '#2196F3'; // Blue
      case 'Third Prize': return '#FF9800'; // Orange
      case 'Fourth Prize': return '#9C27B0'; // Purple
      case 'Fifth Prize': return '#607D8B'; // Dark Grey
      case 'Complementary Prize': return '#E91E63'; // Pink
      default: return '#607D8B'; // Default grey
    }
  };

  const renderResultItem = ({ item, index }) => (
    <TouchableOpacity 
      style={[
        styles.itemContainer,
        index % 2 === 0 ? styles.evenItem : styles.oddItem,
        { borderLeftColor: getPrizeCategoryColor(item.prizeCategory) }
      ]}
      onPress={() => {
        setSelectedResult(item);
        setModalVisible(true);
      }}
    >
      <View style={styles.row}>
        <Text style={styles.label}>Prize Category:</Text>
        <Text style={[styles.prizeCategoryValue, { color: getPrizeCategoryColor(item.prizeCategory) }]}>
          {item.prizeCategory}
        </Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Prize Amount:</Text>
        <Text style={styles.prizeAmountValue}>₹{item.prizeAmount.toLocaleString()}</Text>
      </View>
      
      {/* Show Complementary Prize only for First Prize */}
      {item.prizeCategory === 'First Prize' && item.complementaryPrize > 0 && (
        <View style={styles.row}>
          <Text style={styles.label}>Complementary Prize:</Text>
          <Text style={styles.complementaryPrizeValue}>₹{item.complementaryPrize.toLocaleString()}</Text>
        </View>
      )}
      
      <View style={styles.row}>
        <Text style={styles.label}>Tickets:</Text>
        <View style={styles.ticketsContainer}>
          <Text style={styles.ticketCount}>{item.ticketNumber.length} winning tickets (tap to view)</Text>
          {item.ticketNumber.slice(0, 2).map((ticket, idx) => (
            <Text key={idx} style={styles.ticketValue}>{ticket}</Text>
          ))}
          {item.ticketNumber.length > 2 && (
            <Text style={styles.moreTickets}>+{item.ticketNumber.length - 2} more</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.mainContainer}>
      {/* Date Selection */}
      <View style={styles.filterContainer}>
        <Text style={styles.filterTitle}>Filters</Text>
        
        <View style={styles.dateContainer}>
          <Text style={styles.dropdownLabel}>Select Date:</Text>
          <TouchableOpacity 
            style={styles.dateButton} 
            onPress={() => setShowDatePicker(true)}
          >
            <Text>{date.toDateString()}</Text>
          </TouchableOpacity>
          
          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={onDateChange}
              maximumDate={new Date()}
            />
          )}
        </View>

        {/* Market Selection */}
        <View style={styles.dropdownContainer}>
          <Text style={styles.dropdownLabel}>Select Market:</Text>
          {markets.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {markets.map(market => (
                <TouchableOpacity
                  key={market.marketId}
                  style={[
                    styles.marketButton,
                    selectedMarket?.marketId === market.marketId && styles.selectedMarketButton
                  ]}
                  onPress={() => setSelectedMarket(market)}
                >
                  <Text style={[
                    styles.marketButtonText,
                    selectedMarket?.marketId === market.marketId && styles.selectedMarketButtonText
                  ]}>
                    {market.marketName}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <Text style={styles.noDataText}>No markets available for selected date</Text>
          )}
        </View>
      </View>

      {/* Results List */}
      {loading ? (
        <ActivityIndicator size="large" style={styles.loader} />
      ) : results.length > 0 ? (
        <FlatList
          data={results}
          renderItem={renderResultItem}
          keyExtractor={item => item.resultId}
          contentContainerStyle={styles.listContent}
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      ) : (
        <Text style={styles.noData}>No results found for selected market</Text>
      )}

      {/* Ticket Numbers Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: getPrizeCategoryColor(selectedResult?.prizeCategory) }]}>
                {selectedResult?.prizeCategory}
              </Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScroll}>
              <Text style={styles.ticketSectionTitle}>Winning Ticket Numbers:</Text>
              <View style={styles.ticketGrid}>
                {selectedResult?.ticketNumber?.map((ticket, index) => (
                  <View key={index} style={[
                    styles.modalTicketItem,
                    { backgroundColor: index % 2 === 0 ? '#f5f5f5' : '#ffffff' }
                  ]}>
                    <Text style={styles.modalTicketText}>{ticket}</Text>
                  </View>
                ))}
              </View>
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
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    elevation: 2,
  },
  complementaryPrizeValue: {
    color: '#E91E63',
    flex: 2,
    textAlign: 'right',
    fontWeight: 'bold',
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  dropdownContainer: {
    marginBottom: 15,
  },
  dropdownLabel: {
    fontSize: 14,
    marginBottom: 5,
    color: '#666',
  },
  dateContainer: {
    marginBottom: 15,
  },
  dateButton: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  marketButton: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  marketButtonText: {
    color: '#333',
  },
  selectedMarketButton: {
    backgroundColor: '#2196F3',
  },
  selectedMarketButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  listContent: {
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
    borderLeftWidth: 4,
  },
  evenItem: {
    backgroundColor: '#ffffff',
  },
  oddItem: {
    backgroundColor: '#f9f9f9',
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
    // flex: 1,
  },
  prizeCategoryValue: {
    flex: 2,
    textAlign: 'right',
    fontWeight: 'bold',
    fontSize: 16,
  },
  prizeAmountValue: {
    color: '#C62828',
    flex: 2,
    textAlign: 'right',
    fontWeight: 'bold',
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
  noData: {
    textAlign: 'center',
    color: '#95a5a6',
    fontSize: 17,
    fontWeight: '500',
    paddingVertical: 50,
  },
  noDataText: {
    textAlign: 'center',
    padding: 16,
    color: '#666',
  },
  loader: {
    marginTop: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    borderRadius: 10,
    maxHeight: '80%',
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
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  modalInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalLabel: {
    fontSize: 15,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  modalPrizeAmount: {
    fontSize: 15,
    color: '#C62828',
    fontWeight: 'bold',
  },
  modalTicketCount: {
    fontSize: 15,
    color: '#2c3e50',
    fontWeight: '500',
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
  ticketSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
    marginBottom: 15,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  ticketGrid: {
    flexDirection: 'column',
  },
  modalTicketItem: {
    padding: 12,
    marginBottom: 1,
    width: '100%',
  },
  modalTicketText: {
    fontSize: 14,
    color: '#34495e',
  },
});

export default LotteryResultsScreen;