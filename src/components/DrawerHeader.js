import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { fetchUserWallet } from '../services/authService';
import { useAppContext } from '../redux/context';

const DrawerHeader = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [walletData, setWalletData] = useState({  balance: 0,  exposure_balance: 0 });
  
  const { store } = useAppContext();
  const user = store.user; // Get user from store
  console.log('user:nnnnnnnnnnnnnnnnnnnnnnn', user);
  
  const isAuthenticated = user?.isLogin; // Check if user is logged in

  useEffect(() => {
    const loadWalletData = async () => {
      try {
        if (!isAuthenticated || !user?.userId) {
          setLoading(false);
          return;
        }
  
        setLoading(true);
        setError(null);
        
        const walletResponse = await fetchUserWallet(user.userId);
  
        console.log("walletResponse", walletResponse);
        
        if (walletResponse) {
          setWalletData({
            balance: walletResponse.balance || 0,
            exposure_balance: walletResponse.exposure_balance || 0
          });
        }
         else {
          throw new Error('Invalid wallet data structure');
        }
      } catch (err) {
        console.error('Wallet load error:', err);
        setError(err.message || 'Failed to load wallet');
        Alert.alert('Error', 'Failed to load wallet data');
      } finally {
        setLoading(false);
      }
    };
  
    loadWalletData();
  }, [isAuthenticated, user?.userId]);

  return (
    <View style={styles.headerContainer}>
      <LinearGradient
        colors={['#3F51B5', '#5C6BC0']}
        style={styles.gradientContainer}
      >
        {/* User Information Section */}
        <View style={styles.userInfoContainer}>
          <Text style={styles.userName}>
            {user?.userName || 'Guest User'}
          </Text>
          {user?.userType && (
            <Text style={styles.userType}>
              {user.userType.toUpperCase()}
            </Text>
          )}
        </View>
        
        {/* Conditional Rendering */}
        {!isAuthenticated ? (
          <View style={styles.errorContainer}>
            <Icon name="log-in" size={20} color="#ffebee" />
            <Text style={styles.errorText}>Please login to view details</Text>
          </View>
        ) : loading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : error ? (
          <View style={styles.errorContainer}>
            <Icon name="warning" size={20} color="#ffebee" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : (
          <View style={styles.balanceContainer}>
            <View style={styles.balanceItem}>
              <Icon name="wallet" size={18} color="#fff" />
              <Text style={styles.balanceText}>
                ₹{walletData.balance}
              </Text>
            </View>
            
            <View style={styles.balanceItem}>
              <Icon name="alert-circle" size={18} color="#fff" />
              <Text style={styles.balanceText}>
                ₹{walletData.exposure_balance}
              </Text>
            </View>
          </View>
        )}
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    height: 180,
    borderBottomRightRadius: 30,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  gradientContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  userInfoContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  userName: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  userType: {
    color: '#e0e0e0',
    fontSize: 14,
    textTransform: 'capitalize',
  },
  balanceContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  balanceItem: {
    alignItems: 'center',
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  balanceText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 8,
    fontWeight: '500',
  },
  errorContainer: {
    alignItems: 'center',
    padding: 10,
  },
  errorText: {
    color: '#ffebee',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 5,
  },
});

export default DrawerHeader;