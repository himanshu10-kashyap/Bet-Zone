// components/DrawerHeader.js
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';

const BalanceDrawerHeader = () => {
  const [balance, setBalance] = useState('10,000.00');
  const [exposure, setExposure] = useState('2,500.00');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchBalance = () => {
    setIsRefreshing(true);
    // Simulate API call - replace with your actual API call
    setTimeout(() => {
      const randomBalance = (Math.random() * 20000).toFixed(2);
      const randomExposure = (Math.random() * 5000).toFixed(2);
      setBalance(randomBalance.replace(/\B(?=(\d{3})+(?!\d))/g, ","));
      setExposure(randomExposure.replace(/\B(?=(\d{3})+(?!\d))/g, ","));
      setIsRefreshing(false);
    }, 1000);
  };

  useEffect(() => {
    fetchBalance(); // Initial fetch
  }, []);

  return (
    <LinearGradient
      colors={['#3F51B5', '#303F9F']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
    >
      <View style={styles.headerRow}>
        <View style={styles.balanceContainer}>
          <View style={styles.balanceRow}>
            <Icon name="wallet-outline" size={20} color="#fff" style={styles.icon} />
            <Text style={styles.balanceText}>₹{balance}</Text>
          </View>
          <View style={styles.balanceRow}>
            <Icon name="alert-circle-outline" size={20} color="#fff" style={styles.icon} />
            <Text style={styles.balanceText}>₹{exposure}</Text>
          </View>
        </View>
        
        <TouchableOpacity 
          onPress={fetchBalance}
          style={styles.refreshButton}
          disabled={isRefreshing}
        >
          <Icon 
            name={isRefreshing ? 'refresh' : 'refresh-outline'} 
            size={24} 
            color="#fff" 
          />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 40,
    paddingBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceContainer: {
    flex: 1,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    marginRight: 10,
  },
  balanceText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  refreshButton: {
    padding: 8,
    marginLeft: 10,
  },
});

export default BalanceDrawerHeader;