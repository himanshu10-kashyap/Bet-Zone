import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import { fetchOpenBets, fetchOpenBetsMarketID } from '../services/authService';

export default function OpenBets() {
  const [selectedMarket, setSelectedMarket] = useState();
  const [markets, setMarkets] = useState([]);
  const [betData, setBetData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMarkets, setLoadingMarkets] = useState(false);

  // Fetch available markets on component mount
  useEffect(() => {
    const loadMarkets = async () => {
      setLoadingMarkets(true);
      try {
        const result = await fetchOpenBetsMarketID();
        setMarkets(result.map(market => ({
          label: market.marketName,
          value: market.marketId,
          key: market.marketId
        })));
      } catch (error) {
        console.error('Error fetching markets:', error.message);
        setMarkets([]);
      } finally {
        setLoadingMarkets(false);
      }
    };
    loadMarkets();
  }, []);

  // Fetch bets when market is selected
  useEffect(() => {
    const loadBets = async () => {
      if (!selectedMarket) return;
      setLoading(true);
      try {
        const result = await fetchOpenBets(selectedMarket);
        setBetData(result);
      } catch (error) {
        console.error('Error fetching bets:', error.message);
        setBetData([]);
      } finally {
        setLoading(false);
      }
    };
    loadBets();
  }, [selectedMarket]);

  const backData = betData.filter(item => item.type === 'back');
  const layData = betData.filter(item => item.type === 'lay');

  const renderItem = (item, type) => (
    <View style={styles.tableRow}>
      <Text style={styles.cell}>{item.runnerName}</Text>
      <Text style={styles.cell}>{item.rate}</Text>
      <Text style={styles.cell}>{item.value}</Text>
      <Text style={styles.cell}>
        {item.value} ({type === 'back' ? `-${item.bidAmount}` : `-${item.bidAmount}`})
      </Text>
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <View style={styles.dropdownWrapper}>
          {loadingMarkets ? (
            <ActivityIndicator size="small" color="#00BCD4" />
          ) : (
            <RNPickerSelect
              onValueChange={(value) => setSelectedMarket(value)}
              items={markets}
              value={selectedMarket}
              placeholder={{ label: 'Select a market...', value: null }}
              style={pickerSelectStyles}
              useNativeAndroidPickerStyle={false}
            />
          )}
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#00BCD4" />
        ) : selectedMarket ? (
          <>
            <View style={styles.cardBlue}>
              <View style={styles.tableHeader}>
                <Text style={styles.headerCell}>Back</Text>
                <Text style={styles.headerCell}>Odds</Text>
                <Text style={styles.headerCell}>Stake</Text>
                <Text style={styles.headerCell}>Profit</Text>
              </View>
              {backData.length > 0 ? (
                backData.map((item, index) => (
                  <View key={`back-${index}`}>{renderItem(item, 'back')}</View>
                ))
              ) : (
                <Text style={styles.noData}>No Back Bets</Text>
              )}
            </View>

            <View style={styles.cardPink}>
              <View style={styles.tableHeader}>
                <Text style={styles.headerCell}>Lay</Text>
                <Text style={styles.headerCell}>Odds</Text>
                <Text style={styles.headerCell}>Stake</Text>
                <Text style={styles.headerCell}>Liability</Text>
              </View>
              {layData.length > 0 ? (
                layData.map((item, index) => (
                  <View key={`lay-${index}`}>{renderItem(item, 'lay')}</View>
                ))
              ) : (
                <Text style={styles.noData}>No Lay Bets</Text>
              )}
            </View>
          </>
        ) : null}
      </View>
    </ScrollView>
  );
}

// ... keep the same styles and pickerSelectStyles from your original code ...

const styles = StyleSheet.create({
  scrollContainer: { paddingBottom: 30 },
  container: { padding: 16, backgroundColor: '#fff', flexGrow: 1 },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    backgroundColor: '#00BCD4',
    paddingVertical: 10,
    color: '#fff',
    borderRadius: 5,
    marginBottom: 20,
  },
  dropdownWrapper: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  cardBlue: {
    backgroundColor: '#d6eaf8',
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
    elevation: 2,
  },
  cardPink: {
    backgroundColor: '#f8d7da',
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
    elevation: 2,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    marginBottom: 5,
  },
  headerCell: {
    flex: 1,
    fontWeight: 'bold',
    fontSize: 14,
  },
  tableRow: {
    flexDirection: 'row',
    marginVertical: 4,
    backgroundColor: '#f2f2f2',
    borderRadius: 4,
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  cell: {
    flex: 1,
    fontSize: 13,
  },
  noData: {
    textAlign: 'center',
    fontStyle: 'italic',
    color: 'gray',
    marginTop: 10,
  },
});

// Custom styles for RNPickerSelect
const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    color: 'black',
    borderRadius: 4,
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 10,
    color: 'black',
    borderRadius: 4,
  },
});
