import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  ActivityIndicator, 
  Alert, 
  ScrollView
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Dropdown } from 'react-native-element-dropdown';
import { fetchProfitLoss } from '../services/authService.js';
import { useNavigation } from '@react-navigation/native';

const ProfitLossScreen = () => {
  const navigation = useNavigation();
  const [dataSource, setDataSource] = useState('live');
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [showFromDate, setShowFromDate] = useState(false);
  const [showToDate, setShowToDate] = useState(false);
  const [isFocus, setIsFocus] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tableData, setTableData] = useState([]);

  const formatDateForAPI = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleGetStatement = async () => {
    try {
      setLoading(true);
      
      const queryParams = {
        dataType: dataSource
      };
      if (fromDate) {
        queryParams.startDate = formatDateForAPI(fromDate);
      }
      if (toDate) {
        queryParams.endDate = formatDateForAPI(toDate);
      }
      
      const response = await fetchProfitLoss(queryParams);

      if (response.success) {
        const formattedData = response.data.map(item => ({
          sport: item.gameName,
          profitLoss: item.totalProfitLoss,
          gameId: item.gameId
        }));

        setTableData(formattedData);
      } else {
        Alert.alert('Error', response.message || 'Failed to fetch profit/loss data');
        setTableData([]);
      }
    } catch (error) {
      console.error('Error fetching profit/loss:', error);
      Alert.alert('Error', 'Failed to fetch profit/loss data');
      setTableData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleGetStatement();
  }, [dataSource]);

  const onChangeFromDate = (event, selectedDate) => {
    const currentDate = selectedDate || fromDate;
    setShowFromDate(false);
    setFromDate(currentDate);
    handleGetStatement();
  };

  const onChangeToDate = (event, selectedDate) => {
    const currentDate = selectedDate || toDate;
    setShowToDate(false);
    setToDate(currentDate);
    handleGetStatement();
  };

  const handleSportPress = (gameName, gameId) => {
    const normalized = gameName?.toLowerCase();
    if (normalized === 'lottery') {
      navigation.navigate('LotteryProfitAndLossScreen');
    } else if (normalized === 'colorgame') {
      navigation.navigate('ColorgameProfitAndLossScreen', { 
        gameId: gameId,
        gameName: gameName 
      });
    } else {
      Alert.alert('Navigation Error', `No screen available for ${gameName}`);
    }
  };

  const dataSourceOptions = [
    { label: 'Live Data', value: 'live' },
    { label: 'Backup Data', value: 'backup' },
    { label: 'Old Data', value: 'olddata' },
  ];

  const renderProfitLossValue = (value) => {
    const numericValue = parseFloat(value || 0);
    const isPositive = numericValue >= 0;
    
    return (
      <Text style={[styles.value, isPositive ? styles.positiveValue : styles.negativeValue]}>
        {numericValue.toFixed(2)}
      </Text>
    );
  };

  const renderItem = ({ item, index }) => (
    <View style={[
      styles.itemContainer,
      index % 2 === 0 ? styles.evenItem : styles.oddItem
    ]}>
      <View style={styles.row}>
        <Text style={styles.label}>Sport Name:</Text>
        <TouchableOpacity onPress={() => handleSportPress(item.sport, item.gameId)}>
          <Text style={[styles.sportValue, styles.clickableText]}>{item.sport}</Text>
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
      {/* Data Source Dropdown */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Data Source</Text>
        <Dropdown
          style={[styles.dropdown, isFocus && { borderColor: '#6a11cb' }]}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          data={dataSourceOptions}
          labelField="label"
          valueField="value"
          value={dataSource}
          onFocus={() => setIsFocus(true)}
          onBlur={() => setIsFocus(false)}
          onChange={item => {
            setDataSource(item.value);
            setIsFocus(false);
          }}
        />
      </View>

      {/* From and To Date Pickers */}
      <View style={styles.dateContainer}>
        <View style={styles.datePicker}>
          <Text style={styles.label}>From Date</Text>
          <TouchableOpacity 
            style={styles.dateInput} 
            onPress={() => setShowFromDate(true)}
          >
            <Text style={styles.dateText}>
              {fromDate ? fromDate.toDateString() : 'Select From Date'}
            </Text>
          </TouchableOpacity>
          {showFromDate && (
            <DateTimePicker
              value={fromDate || new Date()}
              mode="date"
              display="default"
              onChange={onChangeFromDate}
              maximumDate={new Date()}
            />
          )}
        </View>

        <View style={styles.datePicker}>
          <Text style={styles.label}>To Date</Text>
          <TouchableOpacity 
            style={styles.dateInput} 
            onPress={() => setShowToDate(true)}
          >
            <Text style={styles.dateText}>
              {toDate ? toDate.toDateString() : 'Select To Date'}
            </Text>
          </TouchableOpacity>
          {showToDate && (
            <DateTimePicker
              value={toDate || new Date()}
              mode="date"
              display="default"
              onChange={onChangeToDate}
              maximumDate={new Date()}
              minimumDate={fromDate || undefined}
            />
          )}
        </View>
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

      {/* Display Profit & Loss Cards */}
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
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingTop: 15,
    paddingHorizontal: 15,
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
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    marginBottom: 5,
    color: '#555',
    fontWeight: '500',
  },
  dropdown: {
    height: 45,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    backgroundColor: 'white',
  },
  placeholderStyle: {
    fontSize: 14,
    color: '#999',
  },
  selectedTextStyle: {
    fontSize: 14,
    color: '#333',
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  datePicker: {
    flex: 1,
    marginRight: 8,
  },
  dateInput: {
    height: 45,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  dateText: {
    fontSize: 14,
    color: '#333',
  },
  button: {
    backgroundColor: '#6a11cb',
    padding: 12,
    alignItems: 'center',
    borderRadius: 6,
    marginBottom: 15,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default ProfitLossScreen;