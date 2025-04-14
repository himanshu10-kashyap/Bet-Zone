import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList
} from 'react-native';
import { searchTicket } from '../services/authService';

const { width } = Dimensions.get('window');

const PurchaseLottery = ({ route, navigation }) => {
  // Get parameters from navigation
  const {
    marketId,
    marketName,
    tickets = [],
    price,
    sem,
    generateId,
    selectedGroup,
    selectedSeries,
    selectedNumber
  } = route.params;

  const [loading, setLoading] = useState(false);

  const handlePurchase = async () => {
    try {
      setLoading(true);
      
      const purchaseData = {
        marketId,
        generateId,
        tickets,
        sem,
        price,
        group: selectedGroup,
        series: selectedSeries,
        number: selectedNumber
      };

      const response = await searchTicket(purchaseData);

      if (response.success) {
        Alert.alert(
          'Success', 
          `Successfully purchased ${tickets.length} ticket(s)`,
        );
      } else {
        throw new Error(response.message || 'Purchase failed');
      }
    } catch (error) {
      console.error('Purchase Error:', error);
      Alert.alert('Purchase Error', error.message || 'Failed to purchase tickets');
    } finally {
      setLoading(false);
    }
  };

  const totalAmount = tickets.length * price;

  // Function to split ticket number into parts (like in your image)
  const renderTicketNumber = (ticketNumber) => {
    // Example: "04 D 00004" or "04 H 041"
    const parts = ticketNumber.split(' ');
    return (
      <View style={styles.ticketNumberContainer}>
        <Text style={styles.ticketNumberPart}>{parts[0]}</Text>
        <Text style={styles.ticketNumberPart}>{parts[1]}</Text>
        <Text style={styles.ticketNumberPart}>{parts[2]}</Text>
      </View>
    );
  };

  const renderTicketItem = ({ item }) => (
    <View style={styles.ticketContainer}>
      <Text style={styles.ticketHeader}>LOTTERY TICKET</Text>
      {renderTicketNumber(item)}
      <View style={styles.ticketFooter}>
        <Text style={styles.ticketPrice}>₹{price}</Text>
        <Text style={styles.ticketSem}>SEM: {sem}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Market Summary Card */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>MARKET SUMMARY</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Market:</Text>
          <Text style={styles.summaryValue}>{marketName}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Total Tickets:</Text>
          <Text style={styles.summaryValue}>{tickets.length}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Total Amount:</Text>
          <Text style={styles.summaryValue}>₹{totalAmount}</Text>
        </View>
      </View>

      {/* Tickets List */}
      <View style={styles.ticketsTitleContainer}>
        <Text style={styles.ticketsTitle}>YOUR TICKETS</Text>
      </View>
      
      <FlatList
        data={tickets}
        renderItem={renderTicketItem}
        keyExtractor={(item) => item}
        numColumns={2}
        columnWrapperStyle={styles.ticketRow}
        contentContainerStyle={styles.ticketGrid}
        showsVerticalScrollIndicator={false}
      />

      {/* Purchase Button */}
      <View style={styles.purchasePanel}>
        <TouchableOpacity
          style={[
            styles.purchaseButton,
            loading && styles.purchaseButtonDisabled
          ]}
          onPress={handlePurchase}
          disabled={loading}
          activeOpacity={0.7}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.purchaseButtonText}>
              PURCHASE ALL TICKETS (₹{totalAmount})
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#F8F9FA',
      paddingTop: 16,
    },
    summaryCard: {
      backgroundColor: '#5E35B1',
      borderRadius: 10,
      padding: 16,
      marginHorizontal: 16,
      marginBottom: 16,
      elevation: 3,
    },
    summaryTitle: {
      color: 'white',
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: 12,
      textAlign: 'center',
    },
    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    summaryLabel: {
      color: '#D1C4E9',
      fontSize: 14,
    },
    summaryValue: {
      color: 'white',
      fontSize: 14,
      fontWeight: 'bold',
    },
    ticketsTitleContainer: {
      paddingHorizontal: 16,
      marginBottom: 12,
    },
    ticketsTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#333',
    },
    ticketRow: {
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      marginBottom: 12,
    },
    ticketGrid: {
      paddingBottom: 100,
    },
    ticketContainer: {
      width: width / 2 - 24,
      backgroundColor: 'white',
      borderRadius: 8,
      padding: 12,
      borderWidth: 1,
      borderColor: '#E0E0E0',
      elevation: 2,
      minHeight: 150, // Fixed height to prevent overlapping
    },
    ticketHeader: {
      fontSize: 14,
      fontWeight: 'bold',
      color: '#5E35B1',
      marginBottom: 8,
      textAlign: 'center',
    },
    ticketNumberContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginVertical: 20,
      paddingHorizontal: 8,
    },
    ticketNumberPart: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#333',
      textAlign: 'center',
      marginHorizontal: 4,
      minWidth: 40, // Ensure consistent spacing
    },
    ticketFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 'auto', // Push to bottom
      paddingTop: 8,
      borderTopWidth: 1,
      borderTopColor: '#EEEEEE',
    },
    ticketPrice: {
      fontSize: 14,
      fontWeight: 'bold',
      color: '#5E35B1',
    },
    ticketSem: {
      fontSize: 12,
      color: '#666',
    },
    purchasePanel: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: 'white',
      padding: 16,
      borderTopWidth: 1,
      borderTopColor: '#E0E0E0',
      elevation: 5,
    },
    purchaseButton: {
      backgroundColor: '#5E35B1',
      padding: 16,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    purchaseButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: 'bold',
      textTransform: 'uppercase',
    },
  });

export default PurchaseLottery;