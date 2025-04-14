import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Modal, ScrollView } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Dropdown } from 'react-native-element-dropdown';
import { fetchGameBetHistory, fetchGamesList, fetchLotteryBetHistory } from '../services/authService';

const BetHistoryScreen = () => {
  // State for filters
  const [dataSource, setDataSource] = useState('live');
  const [selectedGame, setSelectedGame] = useState(null);
  const [type, setType] = useState(null);
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [showFromDatePicker, setShowFromDatePicker] = useState(false);
  const [showToDatePicker, setShowToDatePicker] = useState(false);

  // State for data
  const [games, setGames] = useState([]);
  const [betHistory, setBetHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // State for Lottery specific
  const [selectedLotteryTicket, setSelectedLotteryTicket] = useState(null);
  const [showTicketModal, setShowTicketModal] = useState(false);

  // Dropdown data sources
  const dataSourceOptions = [
    { label: 'Live Data', value: 'live' },
    { label: 'Backup Data', value: 'backup' },
    { label: 'Old Data', value: 'olddata' },
  ];

  const typeOptions = [
    { label: 'Select Type', value: null },
    { label: 'Settle', value: 'settle' },
    { label: 'Void', value: 'void' },
    { label: 'Unsettle', value: 'unsettle' },
  ];

  // Static Lottery option
  const staticGames = [
    { label: 'Lottery', value: 'Lottery' }
  ];

  // Fetch games list on component mount
  useEffect(() => {
    const loadGames = async () => {
      try {
        const response = await fetchGamesList();
        const apiGames = response.data.map(game => ({
          label: game.gameName,
          value: game.gameId
        }));
        
        // Combine static and API games
        setGames([...staticGames, ...apiGames]);
        
        // Set default to first game (Lottery)
        if (staticGames.length > 0) {
          setSelectedGame(staticGames[0].value);
        }
      } catch (error) {
        console.error('Error loading games:', error);
      }
    };
    loadGames();
  }, []);

  // Fetch bet history when filters change
  useEffect(() => {
    if (selectedGame) {
      loadBetHistory();
    }
  }, [selectedGame, dataSource, type, fromDate, toDate, page]);

  const loadBetHistory = async () => {
    try {
      setLoading(true);
      
      const params = {
        page,
        dataType: dataSource,
        startDate: fromDate.toISOString().split('T')[0],
        endDate: toDate.toISOString().split('T')[0],
      };
      
      if (type) {
        params.type = type;
      }
      
      let response;
      
      if (selectedGame === 'Lottery') {
        // Use the Lottery-specific API
        response = await fetchLotteryBetHistory({
          ...params,
          limit: 10
        });
      } else {
        // Use the regular game API
        params.gameId = selectedGame;
        response = await fetchGameBetHistory(params);
      }
      
      if (page === 1) {
        setBetHistory(response.data || []);
      } else {
        setBetHistory(prev => [...prev, ...(response.data || [])]);
      }
      
      setTotalPages(response.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Error loading bet history:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setPage(1);
    loadBetHistory();
  };

  const handleLoadMore = () => {
    if (page < totalPages && !loading) {
      setPage(prevPage => prevPage + 1);
    }
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'N/A';
    const date = new Date(dateTimeString);
    return date.toLocaleString();
  };

  const renderItem = ({ item, index }) => {
    if (selectedGame === 'Lottery') {
      return (
        <View style={[
          styles.itemContainer,
          index % 2 === 0 ? styles.evenItem : styles.oddItem
        ]}>
          <View style={styles.row}>
            <Text style={styles.label}>Sport Name:</Text>
            <Text style={styles.sportValue}>{item.sportName || 'Lottery'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Tickets:</Text>
            <TouchableOpacity 
              style={styles.ticketsContainer} 
              onPress={() => {
                setSelectedLotteryTicket(item);
                setShowTicketModal(true);
              }}
            >
              <Text style={styles.ticketCount}>{item.tickets?.length || 0} tickets (tap to view)</Text>
              {item.tickets?.slice(0, 2).map((ticket, idx) => (
                <Text key={idx} style={styles.ticketValue}>{ticket}</Text>
              ))}
              {item.tickets?.length > 2 && (
                <Text style={styles.moreTickets}>+{item.tickets.length - 2} more</Text>
              )}
            </TouchableOpacity>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Sem:</Text>
            <Text style={styles.semValue}>{item.sem}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Amount:</Text>
            <Text style={styles.amountValue}>{item.amount}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Date:</Text>
            <Text style={styles.timeValue}>{formatDateTime(item.date)}</Text>
          </View>
        </View>
      );
    } else {
      return (
        <View style={[
          styles.itemContainer,
          index % 2 === 0 ? styles.evenItem : styles.oddItem
        ]}>
          <View style={styles.row}>
            <Text style={styles.label}>Sport Name:</Text>
            <Text style={styles.sportValue}>{item.gameName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Event:</Text>
            <Text style={styles.eventValue}>{item.marketName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Selection:</Text>
            <Text style={styles.marketValue}>{item.runnerName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Odds Req:</Text>
            <Text style={styles.oddsValue}>{item.rate}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Stack:</Text>
            <Text style={styles.stackValue}>{item.value}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Type:</Text>
            <Text style={[
              styles.typeValue, 
              item.type === 'back' ? styles.back : styles.lay
            ]}>
              {item.type}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Date:</Text>
            <Text style={styles.timeValue}>{formatDateTime(item.date)}</Text>
          </View>
        </View>
      );
    }
  };

  const renderDropdownItem = (item) => {
    return (
      <View style={styles.dropdownItem}>
        <Text style={styles.dropdownItemText}>{item.label}</Text>
      </View>
    );
  };

  return (
    <View style={styles.mainContainer}>
      {/* Filter Section (unchanged) */}
      <View style={styles.filterContainer}>
        <Text style={styles.filterTitle}>Filters</Text>
        
        <View style={styles.dropdownContainer}>
          <Text style={styles.dropdownLabel}>Data Source:</Text>
          <Dropdown
            style={styles.dropdown}
            placeholderStyle={styles.dropdownPlaceholder}
            selectedTextStyle={styles.dropdownSelectedText}
            inputSearchStyle={styles.dropdownInputSearch}
            iconStyle={styles.dropdownIcon}
            data={dataSourceOptions}
            search={false}
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder="Select data source"
            value={dataSource}
            onChange={item => setDataSource(item.value)}
            renderItem={renderDropdownItem}
          />
        </View>

        <View style={styles.dropdownContainer}>
          <Text style={styles.dropdownLabel}>Select Game:</Text>
          <Dropdown
            style={styles.dropdown}
            placeholderStyle={styles.dropdownPlaceholder}
            selectedTextStyle={styles.dropdownSelectedText}
            inputSearchStyle={styles.dropdownInputSearch}
            iconStyle={styles.dropdownIcon}
            data={games}
            search={false}
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder="Select game"
            value={selectedGame}
            onChange={item => {
              setSelectedGame(item.value);
              setPage(1);
            }}
            renderItem={renderDropdownItem}
          />
        </View>

        <View style={styles.dropdownContainer}>
          <Text style={styles.dropdownLabel}>Type:</Text>
          <Dropdown
            style={styles.dropdown}
            placeholderStyle={styles.dropdownPlaceholder}
            selectedTextStyle={styles.dropdownSelectedText}
            inputSearchStyle={styles.dropdownInputSearch}
            iconStyle={styles.dropdownIcon}
            data={typeOptions}
            search={false}
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder="Select type"
            value={type}
            onChange={item => {
              setType(item.value);
              setPage(1);
            }}
            renderItem={renderDropdownItem}
          />
        </View>

        <View style={styles.dateContainer}>
          <Text style={styles.dropdownLabel}>Date Range:</Text>
          <View style={styles.dateRow}>
            <TouchableOpacity 
              style={styles.dateButton} 
              onPress={() => setShowFromDatePicker(true)}>
              <Text>From: {fromDate.toLocaleDateString()}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.dateButton} 
              onPress={() => setShowToDatePicker(true)}>
              <Text>To: {toDate.toLocaleDateString()}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Date Pickers */}
      {showFromDatePicker && (
        <DateTimePicker
          value={fromDate}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowFromDatePicker(false);
            if (selectedDate) {
              setFromDate(selectedDate);
              setPage(1);
            }
          }}
        />
      )}
      {showToDatePicker && (
        <DateTimePicker
          value={toDate}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowToDatePicker(false);
            if (selectedDate) {
              setToDate(selectedDate);
              setPage(1);
            }
          }}
        />
      )}

      {/* Bet History List */}
      {loading && page === 1 ? (
        <ActivityIndicator size="large" style={styles.loader} />
      ) : (
        <FlatList
          data={betHistory}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.noData}>No bet history found</Text>
          }
          refreshing={refreshing}
          onRefresh={handleRefresh}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loading && page > 1 ? (
              <ActivityIndicator size="small" />
            ) : null
          }
        />
      )}

      {/* Lottery Ticket Modal */}
      <Modal
        visible={showTicketModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowTicketModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Tickets Details</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowTicketModal(false)}
              >
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScroll}>
              {selectedLotteryTicket?.tickets?.map((ticket, index) => (
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
  // Filter styles (unchanged from your original)
  filterContainer: {
    backgroundColor: 'white',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    elevation: 2,
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
  dropdown: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    backgroundColor: '#f9f9f9',
  },
  dropdownItem: {
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownItemText: {
    fontSize: 16,
  },
  dropdownPlaceholder: {
    fontSize: 16,
    color: '#999',
  },
  dropdownSelectedText: {
    fontSize: 16,
  },
  dropdownInputSearch: {
    height: 40,
    fontSize: 16,
  },
  dropdownIcon: {
    width: 20,
    height: 20,
  },
  dateContainer: {
    marginBottom: 10,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateButton: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  // List styles matching MarketDetailsScreen
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
  noData: {
    textAlign: 'center',
    color: '#95a5a6',
    fontSize: 17,
    fontWeight: '500',
    paddingVertical: 50,
  },
  loader: {
    marginTop: 20,
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
  // Value styles with colors matching MarketDetailsScreen
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
  semValue: {
    color: '#D84315',
    flex: 2,
    textAlign: 'right',
    fontWeight: '500',
  },
  oddsValue: {
    color: '#FF5722',
    fontWeight: 'bold',
    flex: 2,
    textAlign: 'right',
  },
  stackValue: {
    color: '#607D8B',
    fontWeight: 'bold',
    flex: 2,
    textAlign: 'right',
  },
  typeValue: {
    fontWeight: 'bold',
    flex: 2,
    textTransform: 'uppercase',
    textAlign: 'right',
  },
  amountValue: {
    color: '#C62828',
    flex: 2,
    textAlign: 'right',
    fontWeight: 'bold',
  },
  timeValue: {
    color: '#5D4037',
    flex: 2,
    textAlign: 'right',
    fontWeight: '400',
    fontSize: 14,
  },
  back: {
    color: '#2E7D32',
  },
  lay: {
    color: '#C62828',
  },
  // Modal styles matching MarketDetailsScreen
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
  modalValue: {
    fontSize: 15,
    color: '#2c3e50',
    fontWeight: '500',
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

export default BetHistoryScreen;