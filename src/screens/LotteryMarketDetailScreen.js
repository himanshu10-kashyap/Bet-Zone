import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Dimensions,
  Modal,
  FlatList
} from 'react-native';
import { fetchLotteryRanges, searchTicket } from '../services/authService';
import { useNavigation, useRoute } from '@react-navigation/native';
import { generateLotteryOptions } from '../utilities/genrateLottery';

const { width, height } = Dimensions.get('window');

const LotteryMarketDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { marketId, marketName } = route.params;

  const [marketData, setMarketData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);

  // Selected values state
  const [selectedSem, setSelectedSem] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedSeries, setSelectedSeries] = useState(null);
  const [selectedNumber, setSelectedNumber] = useState(null);

  // Options state
  const [groupOptions, setGroupOptions] = useState([]);
  const [seriesOptions, setSeriesOptions] = useState([]);
  const [numberOptions, setNumberOptions] = useState([]);

  // Dropdown states
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [currentDropdown, setCurrentDropdown] = useState(null);
  const [dropdownData, setDropdownData] = useState([]);

  // Static SEM options
  const semOptions = [
    { label: '5', value: '5' },
    { label: '10', value: '10' },
    { label: '25', value: '25' },
    { label: '50', value: '50' },
    { label: '100', value: '100' },
    { label: '200', value: '200' },
  ];

  const timerRef = useRef(null);

  const clearSelections = () => {
    setSelectedSem(null);
    setSelectedGroup(null);
    setSelectedSeries(null);
    setSelectedNumber(null);
  };

  const loadMarketData = async () => {
    try {
      setLoading(true);
      const response = await fetchLotteryRanges();

      if (response.success) {
        const market = response.data.find(item => item.marketId === marketId);

        if (market) {
          setMarketData(market);
          calculateTimeRemaining(market);

          if (market.isActive) {
            const options = generateLotteryOptions(
              market.group_start,
              market.group_end,
              market.series_start,
              market.series_end,
              parseInt(market.number_start),
              parseInt(market.number_end)
            );

            setGroupOptions(options.groupOptions.map(g => ({ label: g.toString(), value: g })));
            setSeriesOptions(options.seriesOptions.map(s => ({ label: s.toString(), value: s })));
            setNumberOptions(options.numberOptions.map(n => ({ label: n.toString(), value: n })));
          } else {
            clearSelections();
            setGroupOptions([]);
            setSeriesOptions([]);
            setNumberOptions([]);
          }
        } else {
          setError('Market data not found');
        }
      } else {
        setError(response.message || 'Failed to load market data');
      }
    } catch (err) {
      console.error('Error loading market data:', err);
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const calculateTimeRemaining = (data) => {
    if (!data || !data.start_time || !data.end_time) return;

    const now = new Date();
    const start = new Date(data.start_time);
    const end = new Date(data.end_time);

    if (!data.isActive) {
      setTimeRemaining(0);
    } else if (now < start) {
      setTimeRemaining(Math.floor((start - now) / 1000));
    } else if (now < end) {
      setTimeRemaining(Math.floor((end - now) / 1000));
    } else {
      setTimeRemaining(0);
    }
  };

  useEffect(() => {
    loadMarketData();

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [marketId]);

  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    if (marketData?.isActive && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 0) {
            clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [marketData?.isActive, timeRemaining]);

  const onRefresh = () => {
    clearSelections();
    setRefreshing(true);
    loadMarketData();
  };

  const formatTime = (seconds) => {
    const days = Math.floor(seconds / (3600 * 24));
    const hours = Math.floor((seconds % (3600 * 24)) / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${days}D : ${hours}H : ${mins}M : ${secs}S`;
  };

  const handleSearch = async () => {
    if (!marketData?.isActive) return;
    
    if (!selectedGroup || !selectedSeries || !selectedNumber) {
      Alert.alert('Error', 'Please select Group, Series and Number');
      return;
    }

    try {
      setSearchLoading(true);
      
      const searchResults = await searchTicket({
        group: selectedGroup.value,
        series: selectedSeries.value,
        number: selectedNumber.value,
        sem: selectedSem?.value,
        marketId: marketId
      });

      navigation.navigate('PurchaseLottery', {
        marketId,
        marketName,
        tickets: searchResults.tickets,
        price: searchResults.price,
        sem: searchResults.sem,
        generateId: searchResults.generateId,
        selectedGroup: selectedGroup.value,
        selectedSeries: selectedSeries.value,
        selectedNumber: selectedNumber.value
      });
    } catch (error) {
      console.error('Search Error:', error);
      Alert.alert('Search Error', error.message || 'Failed to search tickets');
    } finally {
      setSearchLoading(false);
    }
  };

  const renderTimer = () => {
    if (!marketData) return null;
    
    const now = new Date();
    const start = new Date(marketData.start_time);
    const end = new Date(marketData.end_time);
    
    let status = '';
    let timerColor = '#FF3B30';
    
    if (!marketData.isActive) {
      status = 'Completed';
      timerColor = '#8E8E93';
    } else if (now < start) {
      status = 'Starting Soon';
      timerColor = '#FF9500';
    } else if (now < end) {
      status = 'Running';
      timerColor = '#34C759';
    } else {
      status = 'Completed';
      timerColor = '#8E8E93';
    }
    
    return (
      <View style={styles.timerContainer}>
        <View style={[styles.timerIndicator, { backgroundColor: timerColor }]} />
        <View style={styles.timerContent}>
          <Text style={styles.timerText}>
            {marketData.isActive ? formatTime(timeRemaining) : '00D : 00H : 00M : 00S'}
          </Text>
          <Text style={[styles.timerStatus, { color: timerColor }]}>{status}</Text>
        </View>
      </View>
    );
  };

  const openDropdown = (type) => {
    if (!marketData?.isActive) return;
    
    let data = [];
    switch (type) {
      case 'sem':
        data = semOptions;
        break;
      case 'group':
        data = groupOptions;
        break;
      case 'series':
        data = seriesOptions;
        break;
      case 'number':
        data = numberOptions;
        break;
      default:
        return;
    }

    if (data.length === 0) {
      Alert.alert('No Options', `No ${type} options available`);
      return;
    }

    setDropdownData(data);
    setCurrentDropdown(type);
    setDropdownVisible(true);
  };

  const selectItem = (item) => {
    switch (currentDropdown) {
      case 'sem':
        setSelectedSem(item);
        break;
      case 'group':
        setSelectedGroup(item);
        break;
      case 'series':
        setSelectedSeries(item);
        break;
      case 'number':
        setSelectedNumber(item);
        break;
    }
    setDropdownVisible(false);
  };

  const renderDropdownItem = ({ item }) => (
    <TouchableOpacity
      style={styles.dropdownItem}
      onPress={() => selectItem(item)}
      activeOpacity={0.6}
    >
      <Text style={styles.dropdownItemText}>{item.label}</Text>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#5E35B1" />
        <Text style={styles.loadingText}>Loading market data...</Text>
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

  if (!marketData) {
    return (
      <View style={styles.noDataContainer}>
        <Text style={styles.noDataText}>No market data available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#5E35B1']}
            tintColor="#5E35B1"
          />
        }
      >
        {/* Market Info Card */}
        <View style={styles.marketCard}>
          <Text style={styles.marketName}>{marketName || 'Lottery Market'}</Text>
          
          <View style={styles.timeContainer}>
            <View style={styles.timeRow}>
              <Text style={styles.timeLabel}>Price:</Text>
              <Text style={styles.timeValue}>₹{marketData.price || '0'} per ticket</Text>
            </View>
            <View style={styles.timeRow}>
              <Text style={styles.timeLabel}>Start:</Text>
              <Text style={styles.timeValue}>{new Date(marketData.start_time).toLocaleString()}</Text>
            </View>
            <View style={styles.timeRow}>
              <Text style={styles.timeLabel}>End:</Text>
              <Text style={styles.timeValue}>{new Date(marketData.end_time).toLocaleString()}</Text>
            </View>
          </View>
          
          {renderTimer()}
        </View>

        {/* SEM Dropdown */}
        <Text style={styles.dropdownLabel}>SEM Value</Text>
        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => openDropdown('sem')}
          disabled={!marketData.isActive}
          activeOpacity={0.7}
        >
          <Text style={selectedSem ? styles.selectedTextStyle : styles.placeholderStyle}>
            {selectedSem ? selectedSem.label : 'Select SEM'}
          </Text>
        </TouchableOpacity>

        {/* Group Dropdown */}
        <Text style={styles.dropdownLabel}>Group</Text>
        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => openDropdown('group')}
          disabled={!marketData.isActive}
          activeOpacity={0.7}
        >
          <Text style={selectedGroup ? styles.selectedTextStyle : styles.placeholderStyle}>
            {selectedGroup ? selectedGroup.label : 'Select Group'}
          </Text>
        </TouchableOpacity>

        {/* Series Dropdown */}
        <Text style={styles.dropdownLabel}>Series</Text>
        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => openDropdown('series')}
          disabled={!marketData.isActive}
          activeOpacity={0.7}
        >
          <Text style={selectedSeries ? styles.selectedTextStyle : styles.placeholderStyle}>
            {selectedSeries ? selectedSeries.label : 'Select Series'}
          </Text>
        </TouchableOpacity>

        {/* Number Dropdown */}
        <Text style={styles.dropdownLabel}>Number</Text>
        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => openDropdown('number')}
          disabled={!marketData.isActive}
          activeOpacity={0.7}
        >
          <Text style={selectedNumber ? styles.selectedTextStyle : styles.placeholderStyle}>
            {selectedNumber ? selectedNumber.label : 'Select Number'}
          </Text>
        </TouchableOpacity>

        {/* Search Button */}
        <TouchableOpacity
          style={[
            styles.searchButton,
            (!marketData.isActive || searchLoading) && styles.searchButtonDisabled
          ]}
          onPress={handleSearch}
          disabled={!marketData.isActive || searchLoading}
          activeOpacity={0.7}
        >
          {searchLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.searchButtonText}>
              {marketData.isActive ? 'SEARCH TICKETS' : 'MARKET CLOSED'}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Custom Dropdown Modal */}
      <Modal
        visible={dropdownVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDropdownVisible(false)}
      >
        <TouchableOpacity
          style={styles.dropdownBackdrop}
          activeOpacity={1}
          onPress={() => setDropdownVisible(false)}
        >
          <View style={styles.dropdownModal}>
            <FlatList
              data={dropdownData}
              renderItem={renderDropdownItem}
              keyExtractor={(item) => item.value.toString()}
              style={styles.dropdownList}
              contentContainerStyle={styles.dropdownListContent}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Suspended Overlay */}
      {!marketData.isActive && (
        <View style={styles.suspendedOverlay}>
          <View style={styles.suspendedContent}>
            <Text style={styles.suspendedText}>MARKET SUSPENDED</Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#5E35B1',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 16,
    padding: 20,
    textAlign: 'center',
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  noDataText: {
    fontSize: 16,
    color: '#666',
  },
  marketCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  marketName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  timeContainer: {
    marginBottom: 16,
  },
  timeRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  timeLabel: {
    fontSize: 14,
    color: '#666',
    width: 60,
  },
  timeValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  timerIndicator: {
    width: 8,
    height: 40,
    borderRadius: 4,
    marginRight: 12,
  },
  timerContent: {
    flex: 1,
  },
  timerText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  timerStatus: {
    fontSize: 14,
    fontWeight: '500',
  },
  dropdownLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    marginLeft: 4,
  },
  dropdown: {
    height: 50,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#DDD',
    justifyContent: 'center',
  },
  placeholderStyle: {
    fontSize: 14,
    color: '#999',
  },
  selectedTextStyle: {
    fontSize: 14,
    color: '#333',
  },
  searchButton: {
    backgroundColor: '#5E35B1',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    elevation: 3,
  },
  searchButtonDisabled: {
    backgroundColor: '#8E8E93',
  },
  searchButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  suspendedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  suspendedContent: {
    backgroundColor: '#D32F2F',
    padding: 20,
    borderRadius: 8,
  },
  suspendedText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  dropdownBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownModal: {
    width: width * 0.8,
    maxHeight: height * 0.6,
    backgroundColor: 'white',
    borderRadius: 8,
    elevation: 5,
  },
  dropdownList: {
    width: '100%',
  },
  dropdownListContent: {
    paddingVertical: 8,
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#333',
  },
});

export default LotteryMarketDetailScreen;