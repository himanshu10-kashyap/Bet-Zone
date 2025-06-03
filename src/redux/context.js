// context/AppContext.js
import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAppInitialState } from '../utilities/getInitiateState';
import { reducer } from './reducer';
import { fetchUserWallet } from '../services/authService';
import strings from '../utilities/stringConstant';

const AppContext = createContext();

const AppProvider = ({ children }) => {
  const [store, dispatch] = useReducer(reducer, getAppInitialState());

  const fetchWalletBalance = useCallback(async () => {
    console.log('Starting wallet balance fetch...');
    try {
      const userId = store.user?.userId;
      if (!userId) {
        console.log('No userId available, skipping wallet fetch');
        return;
      }
      const walletData = await fetchUserWallet(userId);
  
      if (walletData) {
        dispatch({
          type: strings.UPDATE_USER_WALLET,
          payload: {
            balance: walletData.balance || 0,
            walletId: walletData.walletId || '',
            exposure: walletData.exposure_balance || 0,
            marketListExposure: walletData.marketListExposure || [],
            lastUpdated: new Date().toISOString()
          }
        });
        console.log('Wallet state updated successfully');
      } else {
        console.warn('Received empty wallet data');
      }
    } catch (error) {
      console.error('Failed to fetch wallet balance:', error);
    }
  }, [store.user?.userId]);

// Function to update wallet and exposure after any API call
  const updateWalletAndExposure = () => {
    fetchWalletBalance();
  };

  // Load saved state
  useEffect(() => {
    const loadState = async () => {
      try {
        const savedState = await AsyncStorage.getItem('app_state');
        if (savedState) {
          const parsedState = JSON.parse(savedState);
          // Skip hydrating wallet data as we'll fetch fresh data
          const { wallet, ...restState } = parsedState;
          dispatch({ type: 'HYDRATE_STATE', payload: restState });
        }
      } catch (error) {
        console.error('Failed to load state', error);
      }
    };
    loadState();
  }, []);

  // Save state on changes (excluding wallet for freshness)
  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        // Omit wallet from persisted state to ensure fresh data
        const { wallet, ...stateToSave } = store;
        await AsyncStorage.setItem('app_state', JSON.stringify(stateToSave));
      } catch (error) {
        console.error('Failed to save state', error);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [store]);

  // Fetch wallet when user ID changes
  useEffect(() => {
    if (store.user?.userId) {
      console.log('User ID detected, fetching wallet...');
      fetchWalletBalance();
      
      // Set up refresh interval (every 30 seconds)
      const interval = setInterval(fetchWalletBalance, 30000);
      return () => clearInterval(interval);
    }
  }, [store.user?.userId, fetchWalletBalance]);

  return (
    <AppContext.Provider value={{ 
      store, 
      dispatch,
      fetchWalletBalance,
      refreshWallet: fetchWalletBalance,
      updateWalletAndExposure
    }}>
      {children}
    </AppContext.Provider>
  );
};

const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};

export { AppProvider, useAppContext };