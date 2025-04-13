import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Dropdown } from 'react-native-element-dropdown';
import { fetchGameBetHistory, fetchGamesList } from '../services/authService';

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
      
      params.gameId = selectedGame === 'Lottery' ? 'Lottery' : selectedGame;
      
      const response = await fetchGameBetHistory(params);
      
      setBetHistory(response.data);
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
    setPage(1); // Reset to first page
    loadBetHistory();
  };

  const handleLoadMore = () => {
    if (page < totalPages && !loading) {
      setPage(prevPage => prevPage + 1);
    }
  };

 const renderItem = ({ item, index }) => (
  <View style={[
    styles.itemContainer,
    index % 2 === 0 ? styles.evenItem : styles.oddItem
  ]}>
    <View style={styles.row}>
      <Text style={styles.label}>Sport Name:</Text>
      <Text style={styles.value}>{item.gameName}</Text>
    </View>
    <View style={styles.row}>
      <Text style={styles.label}>Event:</Text>
      <Text style={styles.value}>{item.marketName}</Text>
    </View>
    <View style={styles.row}>
      <Text style={styles.label}>Selection:</Text>
      <Text style={styles.value}>{item.runnerName}</Text>
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
        {item.type.toUpperCase()}
      </Text>
    </View>
    <View style={styles.row}>
      <Text style={styles.label}>Date:</Text>
      <Text style={styles.dateValue}>{new Date(item.date).toLocaleString()}</Text>
    </View>
  </View>
);

  const renderDropdownItem = (item) => {
    return (
      <View style={styles.dropdownItem}>
        <Text style={styles.dropdownItemText}>{item.label}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Filter Section */}
      <View style={styles.filterContainer}>
        <Text style={styles.filterTitle}>Filters</Text>
        
        {/* Data Source Dropdown */}
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

        {/* Game Dropdown */}
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
            onChange={item => setSelectedGame(item.value)}
            renderItem={renderDropdownItem}
          />
        </View>

        {/* Type Dropdown */}
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
            onChange={item => setType(item.value)}
            renderItem={renderDropdownItem}
          />
        </View>

        {/* Date Range */}
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
            <Text style={styles.emptyText}>No bet history found</Text>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 10,
  },
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
  itemContainer: {
    backgroundColor: 'white',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    elevation: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  label: {
    fontWeight: 'bold',
    color: '#555',
  },
  value: {
    color: '#333',
  },
  back: {
    color: 'green',
    fontWeight: 'bold',
  },
  lay: {
    color: 'red',
    fontWeight: 'bold',
  },
  listContent: {
    paddingBottom: 20,
  },
  loader: {
    marginTop: 20,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
  },
  evenItem: {
    backgroundColor: '#ffffff',
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50', // Green accent
  },
  oddItem: {
    backgroundColor: '#f9f9f9',
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3', // Blue accent
  },
  itemContainer: {
    padding: 15,
    marginBottom: 10,
    borderRadius: 6,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  label: {
    fontWeight: '600',
    color: '#555',
    width: '30%',
  },
  value: {
    color: '#333',
    flex: 1,
    fontWeight: '500',
  },
  oddsValue: {
    color: '#FF5722', // Deep orange
    fontWeight: 'bold',
    flex: 1,
  },
  stackValue: {
    color: '#607D8B', // Blue grey
    fontWeight: 'bold',
    flex: 1,
  },
  typeValue: {
    fontWeight: 'bold',
    flex: 1,
    textTransform: 'uppercase',
  },
  dateValue: {
    color: '#795548', // Brown
    flex: 1,
    fontSize: 12,
  },
  back: {
    color: '#2E7D32', // Darker green
  },
  lay: {
    color: '#C62828', // Darker red
  },
});

export default BetHistoryScreen;