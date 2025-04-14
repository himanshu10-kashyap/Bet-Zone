import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const BalanceExposureCard = () => {
  const [balance, setBalance] = useState(10000); // Initial dummy balance
  const [exposure, setExposure] = useState(2500); // Initial dummy exposure
  const [spinValue] = useState(new Animated.Value(0));

  const refreshData = () => {
    // Spin animation
    Animated.timing(spinValue, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      spinValue.setValue(0);
    });

    // Generate random values for demo
    const newBalance = Math.floor(Math.random() * 20000) + 5000;
    const newExposure = Math.floor(Math.random() * 5000) + 1000;
    
    setBalance(newBalance);
    setExposure(newExposure);
  };

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <TouchableOpacity onPress={refreshData} activeOpacity={0.8}>
      <View style={styles.card}>
        <View style={styles.row}>
          <Icon name="account-balance-wallet" size={20} color="#4CAF50" />
          <Text style={styles.text}>Balance: ₹{balance.toLocaleString()}</Text>
        </View>
        <View style={styles.row}>
          <Icon name="show-chart" size={20} color="#FF5722" />
          <Text style={styles.text}>Exposure: ₹{exposure.toLocaleString()}</Text>
        </View>
        <Animated.View style={{ transform: [{ rotate: spin }], position: 'absolute', right: 10 }}>
          <Icon name="refresh" size={16} color="#3F51B5" />
        </Animated.View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    margin: 8,
    width: 160,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  text: {
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
  },
});

export default BalanceExposureCard;