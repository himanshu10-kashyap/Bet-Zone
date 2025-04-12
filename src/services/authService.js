import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Base configuration
const API_BASE_URL = 'https://cg.server.dummydoma.in/api';
const DEFAULT_ERROR_MESSAGE = 'Something went wrong. Please try again.';

// Helper function for API requests
const makeRequest = async (endpoint, method = 'GET', body = null, requiresAuth = true) => {
  try {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (requiresAuth) {
      const authToken = await AsyncStorage.getItem('accessToken');
      if (authToken) {
        headers.Authorization = `Bearer ${authToken}`;
      }
    }

    const options = {
      method,
      headers,
      ...(body && { body: JSON.stringify(body) }),
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    const data = await response.json();

    // Log response for debugging
    console.log(`API ${method} ${endpoint}:`, { status: response.status, data });

    if (!response.ok) {
      // Handle 401 Unauthorized specifically
      if (response.status === 401) {
        await AsyncStorage.removeItem('authToken');
        throw new Error(data?.errMessage || 'Session expired. Please login again.');
      }
      throw new Error(data?.message || data?.errMessage || `Request failed with status ${response.status}`);
    }

    if (data.success === false) {
      throw new Error(data?.message || data?.errMessage || 'Request was not successful');
    }

    return data;

  } catch (error) {
    console.error(`API Error ${endpoint}:`, error);
    throw new Error(error.message || DEFAULT_ERROR_MESSAGE);
  }
};

// API Services
export const loginUser = async (credentials) => {
  try {
    const data = await makeRequest('/user-login', 'POST', credentials, false);
    
    // Store token if available
    if (data.token) {
      await AsyncStorage.setItem('authToken', data.token);
    }
    
    return data;
  } catch (error) {
    Alert.alert('Login Error', error.message);
    throw error;
  }
};

export const fetchOpenBetsMarketID = async () => {
  try {
    const data = await makeRequest('/user-currentOrder-games');
    return data.data || []; // Always return array for easier handling in components
  } catch (error) {
    Alert.alert('Error', error.message);
    throw error;
  }
};

export const fetchOpenBets = async (marketId) => {
  try {
    const data = await makeRequest(`/user-currentOrderHistory/${marketId}`);
    return data.data || []; // Always return array
  } catch (error) {
    Alert.alert('Error', error.message);
    throw error;
  }
};

export const fetchSliderImages = async () => {
  try {
    const data = await makeRequest('/admin/get-inner-game-img');
    // Return only active image URLs
    return (data.data || [])
      .filter(item => item.isActive)
      .map(item => item.image);
  } catch (error) {
    Alert.alert('Error', error.message);
    throw error;
  }
};

export const fetchUserWallet = async () => {
  try {
    // Get userId from storage
    const userId = await AsyncStorage.getItem('userId');
    if (!userId) throw new Error('User authentication required');

    // Fetch wallet data
    const response = await makeRequest(`/user/view-wallet/${userId}`);
    
    // Validate response
    if (!response.data || typeof response.data.balance === 'undefined') {
      throw new Error('Invalid wallet data structure');
    }

    // Calculate exposure_balance
    const exposure_balance = response.data.marketListExposure
      ? response.data.marketListExposure.reduce((total, marketExposure) => {
          const exposureAmount = Object.values(marketExposure)[0];
          return total + (Number(exposureAmount) || 0);
        }, 0)
      : 0;

    return {
      ...response.data,
      exposure_balance,
    };

  } catch (error) {
    console.error('Wallet fetch error:', error);
    Alert.alert(
      'Wallet Error',
      error.message || 'Could not load wallet data'
    );
    throw error;
  }
};

export const fetchAccountStatement = async ({
  page = 1,
  pageSize = 10,
  startDate = '',
  endDate = '',
  dataType = 'backup'
} = {}) => {
  try {
    // Build query string from parameters
    const queryParams = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
      ...(dataType && { dataType }),
    }).toString();

    const data = await makeRequest(`/user-account-statement?${queryParams}`);
    
    // Validate and return the data structure
    if (!data || typeof data.success === 'undefined') {
      throw new Error('Invalid account statement data structure');
    }
    
    return {
      success: data.success,
      message: data.message || '',
      data: data.data || [],
      totalRecords: data.totalRecords || 0,
      currentPage: data.currentPage || page,
      totalPages: data.totalPages || 1,
    };
  } catch (error) {
    console.error('Account Statement Error:', error);
    Alert.alert(
      'Account Statement Error',
      error.message || 'Could not load account statement'
    );
    throw error;
  }
};

// Add this to handle token cleanup on logout
export const logoutUser = async () => {
  await AsyncStorage.removeItem('authToken');
};