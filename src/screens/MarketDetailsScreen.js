import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, FlatList, Alert, TouchableOpacity, Modal } from 'react-native';
import { fetchLotteryBetHistoryProfitLoss } from '../services/authService';

const MarketDetailsScreen = ({ route }) => {
  const { marketId, marketName } = route.params;
  const [marketData, setMarketData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTickets, setSelectedTickets] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const loadMarketData = async () => {
      try {
        setLoading(true);
        const response = await fetchLotteryBetHistoryProfitLoss(marketId);
        
        if (response.success) {
          setMarketData(response.data);
        } else {
          Alert.alert('Error', response.message || 'Failed to fetch market details');
        }
      } catch (error) {
        console.error('Error fetching market details:', error);
        Alert.alert('Error', error.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadMarketData();
  }, [marketId]);

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'N/A';
    const date = new Date(dateTimeString);
    return date.toLocaleString();
  };

  const handleTicketsPress = (tickets) => {
    setSelectedTickets(tickets);
    setModalVisible(true);
  };

  const renderItem = ({ item, index }) => (
    <View style={[
      styles.itemContainer,
      index % 2 === 0 ? styles.evenItem : styles.oddItem
    ]}>
      <View style={styles.row}>
        <Text style={styles.label}>Sport Name:</Text>
        <Text style={styles.sportValue}>{item.gameName}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Event Name:</Text>
        <Text style={styles.eventValue}>{item.marketName}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Market</Text>
        <Text style={styles.marketValue}>Winner</Text>
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
      <View style={styles.row}>
        <Text style={styles.label}>Sem:</Text>
        <Text style={styles.semValue}>{item.sem}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Ticket Price:</Text>
        <Text style={styles.priceValue}>{item.ticketPrice.toFixed()}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Amount:</Text>
        <Text style={styles.amountValue}>{item.amount.toFixed()}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Place Time:</Text>
        <Text style={styles.timeValue}>{formatDateTime(item.placeTime)}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Settle Time:</Text>
        <Text style={styles.timeValue}>{formatDateTime(item.settleTime)}</Text>
      </View>
      <View style={styles.separator} />
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      {/* Header with safe area padding */}
      <View style={styles.headerContainer}>
  <View style={styles.header}>
    <Text style={styles.marketName}>{marketName}</Text>
    {/* <Text style={styles.marketId}>Market ID: {marketId}</Text> */}
  </View>
  <View style={styles.headerDecoration} />
</View>

      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {marketData && marketData.length > 0 ? (
          <FlatList
            data={marketData}
            renderItem={renderItem}
            keyExtractor={(item, index) => index.toString()}
            scrollEnabled={false}
            contentContainerStyle={styles.listContainer}
          />
        ) : (
          <View style={styles.noDataContainer}>
            <Text style={styles.noData}>No data available for this market</Text>
          </View>
        )}
      </ScrollView>

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
  headerContainer: {
    backgroundColor: '#ffffff',
    paddingTop: 25,
    paddingBottom: 15,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    overflow: 'hidden',
    marginBottom: 15,
},
header: {
  paddingHorizontal: 20,
  zIndex: 2, // Ensure text appears above the decoration
},
headerDecoration: {
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  height: 5,
  backgroundColor: '#FF6D00',
  borderTopLeftRadius: 5,
  borderTopRightRadius: 5,
},
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  marketName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 5,
    textTransform: 'uppercase',
    letterSpacing: 1,
},
marketId: {
  fontSize: 14,
  color: '#7f8c8d',
  backgroundColor: '#f5f5f5',
  paddingHorizontal: 10,
  paddingVertical: 4,
  borderRadius: 10,
  alignSelf: 'flex-start',
  overflow: 'hidden',
  fontWeight: '600',
},
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  listContainer: {
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
  value: {
    fontSize: 15,
    color: '#2c3e50',
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
  sportValue: {
    color: '#2E7D32', // Dark green
    flex: 2,
    textAlign: 'right',
    fontWeight: '500',
  },
  eventValue: {
    color: '#1565C0', // Dark blue
    flex: 2,
    textAlign: 'right',
    fontWeight: '500',
  },
  marketValue: {
    color: '#6A1B9A', // Purple
    flex: 2,
    textAlign: 'right',
    fontWeight: '500',
  },
  semValue: {
    color: '#D84315', // Deep orange
    flex: 2,
    textAlign: 'right',
    fontWeight: '500',
  },
  priceValue: {
    color: '#00838F', // Cyan dark
    flex: 2,
    textAlign: 'right',
    fontWeight: '500',
  },
  amountValue: {
    color: '#C62828', // Dark red
    flex: 2,
    textAlign: 'right',
    fontWeight: 'bold',
  },
  timeValue: {
    color: '#5D4037', // Brown
    flex: 2,
    textAlign: 'right',
    fontWeight: '400',
    fontSize: 14,
  },
  ticketValue: {
    fontSize: 15,
    color: '#2c3e50',
    marginBottom: 4,
    textAlign: 'right',
    fontWeight: '500',
    backgroundColor: '#ECEFF1', // Light blue-gray background
    padding: 4,
    borderRadius: 4,
  },
});

export default MarketDetailsScreen;