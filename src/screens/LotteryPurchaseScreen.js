import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  FlatList, StyleSheet, ScrollView, KeyboardAvoidingView,
  Platform
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

const LotteryPurchaseScreen = () => {
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedMarket, setSelectedMarket] = useState(null);

  const marketData = [
    { id: '1', name: 'Market One', result: 'Win: 5000' },
    { id: '2', name: 'Market Two', result: 'Win: 1000' },
    { id: '3', name: 'Market Three', result: 'Win: 3000' },
  ];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: '#f2f6fc' }}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.heading}>Purchase Lottery</Text>

        {/* Date Picker */}
        <TouchableOpacity style={styles.dateBox} onPress={() => setShowPicker(true)}>
          <Text style={styles.dateText}>Selected Date: {date.toLocaleDateString()}</Text>
        </TouchableOpacity>

        {showPicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowPicker(false);
              if (selectedDate) setDate(selectedDate);
            }}
          />
        )}

        {/* Search */}
        <TextInput
          style={styles.searchInput}
          placeholder="Search Market..."
          value={search}
          onChangeText={setSearch}
        />

        {/* Market List */}
        <FlatList
          data={marketData.filter(item => item.name.toLowerCase().includes(search.toLowerCase()))}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.marketCard}
              onPress={() => setSelectedMarket(selectedMarket === item.id ? null : item.id)}
            >
              <Text style={styles.marketName}>{item.name}</Text>
              {selectedMarket === item.id && (
                <View style={styles.resultBox}>
                  <Text style={styles.resultText}>{item.result}</Text>
                </View>
              )}
            </TouchableOpacity>
          )}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LotteryPurchaseScreen;

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2d2d2d',
    marginBottom: 12,
  },
  dateBox: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  dateText: {
    color: '#333',
    fontSize: 16,
  },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  marketCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    elevation: 3,
  },
  marketName: {
    fontSize: 18,
    color: '#333',
  },
  resultBox: {
    marginTop: 8,
    backgroundColor: '#e6f2ff',
    padding: 10,
    borderRadius: 8,
  },
  resultText: {
    color: '#0055ff',
    fontSize: 16,
  },
});
