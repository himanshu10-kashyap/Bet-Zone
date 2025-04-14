import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, FlatList, TouchableOpacity } from 'react-native';
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

  const renderBackItem = ({ item, index }) => (
    <View style={[
      styles.itemContainer,
      styles.backItem // Sky blue background for back bets
    ]}>
      <View style={styles.row}>
        <Text style={styles.label}>Runner:</Text>
        <Text style={styles.runnerValue}>{item.runnerName}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Odds:</Text>
        <Text style={styles.oddsValue}>{item.rate}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Stake:</Text>
        <Text style={styles.stakeValue}>{item.value}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Profit:</Text>
        <Text style={styles.profitValue}>-{item.bidAmount}</Text>
      </View>
      <View style={styles.separator} />
    </View>
  );

  const renderLayItem = ({ item, index }) => (
    <View style={[
      styles.itemContainer,
      styles.layItem // Pink background for lay bets
    ]}>
      <View style={styles.row}>
        <Text style={styles.label}>Runner:</Text>
        <Text style={styles.runnerValue}>{item.runnerName}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Odds:</Text>
        <Text style={styles.oddsValue}>{item.rate}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Stake:</Text>
        <Text style={styles.stakeValue}>{item.value}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Liability:</Text>
        <Text style={styles.liabilityValue}>-{item.bidAmount}</Text>
      </View>
      <View style={styles.separator} />
    </View>
  );

  return (
    <View style={styles.mainContainer}>
      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.dropdownWrapper}>
          {loadingMarkets ? (
            <ActivityIndicator size="small" color="#007BFF" />
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
          <ActivityIndicator size="large" color="#007BFF" style={styles.loadingIndicator} />
        ) : selectedMarket ? (
          <>
            <Text style={styles.sectionTitle}>Back Bets</Text>
            {backData.length > 0 ? (
              <FlatList
                data={backData}
                renderItem={renderBackItem}
                keyExtractor={(item, index) => `back-${index}`}
                scrollEnabled={false}
                contentContainerStyle={styles.listContainer}
              />
            ) : (
              <View style={styles.noDataContainer}>
                <Text style={styles.noData}>No back bets available</Text>
              </View>
            )}

            <Text style={styles.sectionTitle}>Lay Bets</Text>
            {layData.length > 0 ? (
              <FlatList
                data={layData}
                renderItem={renderLayItem}
                keyExtractor={(item, index) => `lay-${index}`}
                scrollEnabled={false}
                contentContainerStyle={styles.listContainer}
              />
            ) : (
              <View style={styles.noDataContainer}>
                <Text style={styles.noData}>No lay bets available</Text>
              </View>
            )}
          </>
        ) : (
          <View style={styles.noDataContainer}>
            <Text style={styles.noData}>Please select a market to view bets</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 15,
    paddingTop: 15,
    paddingBottom: 30,
  },
  dropdownWrapper: {
    backgroundColor: 'white',
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    overflow: 'hidden',
  },
  loadingIndicator: {
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 10,
    marginTop: 15,
  },
  itemContainer: {
    borderRadius: 10,
    padding: 18,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  backItem: {
    backgroundColor: '#87CEEB', // Sky blue for back bets
    borderLeftWidth: 4,
    borderLeftColor: '#1565C0', // Darker blue border
  },
  layItem: {
    backgroundColor: '#FFC0CB', // Pink for lay bets
    borderLeftWidth: 4,
    borderLeftColor: '#C2185B', // Darker pink border
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    alignItems: 'center',
  },
  label: {
    fontSize: 15,
    color: '#333', // Darker text for better contrast
    fontWeight: '500',
    flex: 1,
  },
  runnerValue: {
    color: '#2c3e50',
    flex: 2,
    textAlign: 'right',
    fontWeight: '600', // Slightly bolder
  },
  oddsValue: {
    color: '#0D47A1', // Darker blue for better contrast
    flex: 2,
    textAlign: 'right',
    fontWeight: '600',
  },
  stakeValue: {
    color: '#006064', // Darker teal for better contrast
    flex: 2,
    textAlign: 'right',
    fontWeight: '600',
  },
  profitValue: {
    color: '#1B5E20', // Darker green for better contrast
    flex: 2,
    textAlign: 'right',
    fontWeight: '600',
  },
  liabilityValue: {
    color: '#B71C1C', // Darker red for better contrast
    flex: 2,
    textAlign: 'right',
    fontWeight: '600',
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
    marginTop: 15,
    marginBottom: 5,
  },
  noDataContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 15,
  },
  noData: {
    textAlign: 'center',
    color: '#95a5a6',
    fontSize: 15,
    fontWeight: '500',
  },
  listContainer: {
    paddingBottom: 5,
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    color: 'black',
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 10,
    color: 'black',
  },
});