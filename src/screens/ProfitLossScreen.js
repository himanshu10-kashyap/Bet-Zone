import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Dropdown } from 'react-native-element-dropdown';
import { fetchProfitLoss } from '../services/authService.js';
import { useNavigation } from '@react-navigation/native';

const ProfitLossScreen = () => {
  const navigation = useNavigation();
  const [dataSource, setDataSource] = useState('live');
  // Initialize dates as null so no default date is shown
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [showFromDate, setShowFromDate] = useState(false);
  const [showToDate, setShowToDate] = useState(false);
  const [isFocus, setIsFocus] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tableData, setTableData] = useState([]);

  // Helper to format date; only called if date exists.
  const formatDateForAPI = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleGetStatement = async () => {
    try {
      setLoading(true);
      
      // Build query params conditionally based on whether dates have been selected
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

  // Load data when component mounts or when data source changes
  useEffect(() => {
    handleGetStatement();
  }, [dataSource]);

  const onChangeFromDate = (event, selectedDate) => {
    const currentDate = selectedDate || fromDate;
    setShowFromDate(false);
    setFromDate(currentDate);
    // Refresh data after date selection if needed
    handleGetStatement();
  };

  const onChangeToDate = (event, selectedDate) => {
    const currentDate = selectedDate || toDate;
    setShowToDate(false);
    setToDate(currentDate);
    // Refresh data after date selection if needed
    handleGetStatement();
  };

  const handleSportPress = (gameName, gameId) => {
    const normalized = gameName?.toLowerCase();
    console.log('Clicked game:', gameName);
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
      <Text style={[styles.cell, styles.amountCell, isPositive ? styles.positiveValue : styles.negativeValue]}>
        {numericValue.toFixed(2)}
      </Text>
    );
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

        {/* Data Source Dropdown */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Data Source</Text>
          <Dropdown
            style={[styles.dropdown, isFocus && { borderColor: '#007BFF' }]}
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

        {/* Display Profit & Loss Table */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007BFF" />
          </View>
        ) : (
          <View style={styles.tableContainer}>
            <View style={styles.tableHeader}>
              <Text style={[styles.headerCell, styles.sportCell]}>Sport Name</Text>
              <Text style={[styles.headerCell, styles.amountCell]}>P&L</Text>
              <Text style={[styles.headerCell, styles.totalCell]}>Total P&L</Text>
            </View>

            {/* Table rows */}
            {tableData.length > 0 ? (
              tableData.map((row, index) => (
                <View 
                  key={index} 
                  style={[
                    styles.tableRow, 
                    index % 2 === 0 ? styles.evenRow : styles.oddRow
                  ]}
                >
                  <TouchableOpacity 
                    style={styles.sportCell} 
                    onPress={() => handleSportPress(row.sport, row.gameId)}
                  >
                    <Text style={[styles.cell, styles.clickableText]}>{row.sport}</Text>
                  </TouchableOpacity>
                  {renderProfitLossValue(row.profitLoss)}
                  {renderProfitLossValue(row.profitLoss)}
                </View>
              ))
            ) : (
              <View style={styles.noDataContainer}>
                <Text style={styles.noDataText}>No data available</Text>
              </View>
            )}
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
  dropdown: {
    height: 45,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    backgroundColor: 'white',
  },
  placeholderStyle: {
    fontSize: 13,
    color: '#999',
  },
  selectedTextStyle: {
    fontSize: 13,
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
    fontSize: 13,
    color: '#333',
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
    flex: 2,
    justifyContent: 'center',
  },
  amountCell: {
    flex: 1,
    textAlign: 'center',
    justifyContent: 'center',
  },
  totalCell: {
    flex: 1.5,
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
  noDataContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noDataText: {
    fontSize: 14,
    color: '#666',
  },
  loadingContainer: {
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
    height: 100,
  },
});

export default ProfitLossScreen;
