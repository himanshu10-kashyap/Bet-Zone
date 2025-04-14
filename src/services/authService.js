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
      await AsyncStorage.setItem('accessToken', data.token);
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
    const data = await makeRequest(`/user-currentOrderHistory/${marketId}`, 'GET', null, true);
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

export const fetchUserWallet = async (userId) => {
  try {
    if (!userId) throw new Error('User ID is required');

    const response = await makeRequest(`/user/view-wallet/${userId}`, 'GET', null, true);

    console.log('Full Wallet Response:', response);

    if (!response.data || typeof response.data.balance === 'undefined') {
      throw new Error('Invalid wallet data structure');
    }

    const exposure_balance = response.data.marketListExposure
      ? response.data.marketListExposure.reduce((total, marketExposure) => {
          const exposureAmount = Object.values(marketExposure)[0];
          return total + (Number(exposureAmount) || 0);
        }, 0)
      : 0;

    console.log('Exposure Balance:', exposure_balance);
    console.log('Wallet Data:', response.data); // Removed the spread operator here
    
    return {
      ...response.data, // This spread is fine - it's spreading object properties
      exposure_balance,
    };

  } catch (error) {
    console.error('Wallet fetch error:', error);
    Alert.alert('Wallet Error', error.message || 'Could not load wallet data');
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

    const data = await makeRequest(`/user-account-statement?${queryParams}`, 'GET', null, true);
    
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

export const changePassword = async ({ oldPassword, password, confirmPassword }) => {
  try {
    const data = await makeRequest('/user/resetpassword', 'POST', {
      oldPassword,
      password,
      confirmPassword
    }, true);

    return data;
  } catch (error) {
    Alert.alert('Password Change Error', error.message || 'Unable to change password.');
    throw error;
  }
};

export const fetchProfitLoss = async ({
  page = 1,
  limit = 10,
  startDate = '',
  endDate = '',
  search = '',
  dataType = 'live'
} = {}) => {
  try {
    // Build query string from parameters
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      startDate,
      endDate,
      search,
      dataType,
    }).toString();

    const data = await makeRequest(`/profit_loss?${queryParams}`, 'GET', null, true);

    console.log("queryParams", queryParams);
    

    // Validate and return the structured response
    return {
      data: data.data || [],
      success: data.success || false,
      successCode: data.successCode || null,
      panelStatusCode: data.panelStatusCode || null,
      message: data.message || '',
      pagination: data.pagination || {
        page: 1,
        limit: 10,
        totalPages: 1,
        totalItems: 0,
      },
    };

  } catch (error) {
    console.error('Profit/Loss Fetch Error:', error);
    Alert.alert('Profit/Loss Error', error.message || 'Could not load profit/loss data');
    throw error;
  }
};

export const fetchLotteryProfitLoss = async ({
  page = 1,
  limit = 10,
  searchMarketName = ''
} = {}) => {
  try {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      searchMarketName,
    }).toString();

    const data = await makeRequest(`/lottery-profit-loss?${queryParams}`, 'GET', null, true);

    // Log the full response for debugging
    console.log("Lottery Profit/Loss Response:", data);

    return {
      data: data.data || [],
      success: data.success || false,
      successCode: data.successCode || null,
      panelStatusCode: data.panelStatusCode || null,
      message: data.message || '',
      pagination: data.pagination || {
        page: 1,
        limit: 10,
        totalPages: 1,
        totalItems: 0,
      },
    };
  } catch (error) {
    console.error('Lottery Profit/Loss Fetch Error:', error);
    Alert.alert('Lottery Profit/Loss Error', error.message || 'Could not load data');
    throw error;
  }
};

export const fetchLotteryBetHistoryProfitLoss = async (marketId) => {
  try {
    if (!marketId) {
      throw new Error('Market ID is required');
    }

    const data = await makeRequest(`/lottery-betHistory-profitLoss/${marketId}`, 'GET', null, true);

    // Log the full response for debugging
    console.log("Lottery Bet History Profit/Loss Response:", data);

    // Validate and structure the response
    return {
      data: data.data || [],
      success: data.success || false,
      successCode: data.successCode || null,
      panelStatusCode: data.panelStatusCode || null,
      message: data.message || 'Success',
      pagination: data.pagination || null,
    };
  } catch (error) {
    console.error('Lottery Bet History Profit/Loss Error:', error);
    Alert.alert(
      'Lottery Bet History Error',
      error.message || 'Could not load bet history data'
    );
    throw error;
  }
};

export const fetchProfitLossByMarketCg = async ({gameId, page = 1, limit = 10, searchMarketName = '' } = {}) => {
  try {
    if (!gameId) {
      throw new Error('Game ID is required');
    }

    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      searchMarketName,
    }).toString();

    const endpoint = `/profit_loss_market/${gameId}?${queryParams}`;
    const data = await makeRequest(endpoint, 'GET', null, true);

    console.log('Profit Loss By Market Response:', data);

    return {
      data: data.data || [],
      success: data.success || false,
      successCode: data.successCode || null,
      panelStatusCode: data.panelStatusCode || null,
      message: data.message || '',
      pagination: data.pagination || {
        page: 1,
        limit: 10,
        totalItems: 0,
        totalPages: 1,
      },
    };
  } catch (error) {
    console.error('Profit Loss By Market Error:', error);
    Alert.alert('Error', error.message || 'Could not fetch profit/loss by market');
    throw error;
  }
};

export const fetchCgBetHistoryProfitLoss = async (marketId) => {
  try {
    if (!marketId) {
      throw new Error('Market ID is required');
    }

    const data = await makeRequest(`/profit_loss_runner/${marketId}`, 'GET', null, true);

    // Log the full response for debugging
    console.log("Color Game Bet History Profit/Loss Response:", data);

    // Validate and structure the response
    return {
      data: data.data || [],
      success: data.success || false,
      successCode: data.successCode || null,
      panelStatusCode: data.panelStatusCode || null,
      message: data.message || 'Success',
      pagination: data.pagination || null,
    };
  } catch (error) {
    console.error('Color Game Bet History Profit/Loss Error:', error);
    Alert.alert(
      'Color Game Bet History Error',
      error.message || 'Could not load bet history data'
    );
    throw error;
  }
};

export const fetchRunnerDetails = async ({runnerId, page = 1, limit = 10 } = {}) => {
  try {
    if (!runnerId) {
      throw new Error('Runner Id is required');
    }

    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    }).toString();

    const endpoint = `/get-user-betList/${runnerId}?${queryParams}`;
    const data = await makeRequest(endpoint, 'GET', null, true);

    console.log('Profit Loss By Market Response:', data);

    return {
      data: data.data || [],
      success: data.success || false,
      successCode: data.successCode || null,
      panelStatusCode: data.panelStatusCode || null,
      message: data.message || '',
      pagination: data.pagination || {
        page: 1,
        limit: 10,
        totalItems: 0,
        totalPages: 1,
      },
    };
  } catch (error) {
    console.error('Profit Loss By Market Error:', error);
    Alert.alert('Error', error.message || 'Could not fetch profit/loss by market');
    throw error;
  }
};

export const fetchGameBetHistory = async ({ gameId, page = 1, limit = 10, startDate = '', endDate = '', dataType = '', type = '' } = {}) => {
  try {
    if (!gameId) {
      throw new Error('Game ID is required');
    }

    // Build query string from parameters
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
      dataType,
      type,
    }).toString();

    const data = await makeRequest(`/user-betHistory/${gameId}?${queryParams}`, 'GET', null, true);

    // Log the full response for debugging
    console.log("Game Bet History Response:", data);

    // Validate and structure the response
    return {
      data: data.data || [],
      success: data.success || false,
      successCode: data.successCode || null,
      panelStatusCode: data.panelStatusCode || null,
      message: data.message || '',
      pagination: data.pagination || {
        page: 1,
        limit: 10,
        totalItems: 0,
        totalPages: 1,
      },
    };
  } catch (error) {
    console.error('Game Bet History Error:', error);
    Alert.alert(
      'Bet History Error',
      error.message || 'Could not load bet history data'
    );
    throw error;
  }
};

export const fetchLotteryBetHistory = async ({
  page = 1,
  limit = 10,
  startDate = '',
  endDate = '',
  dataType = '',
  type = '',
} = {}) => {
  try {
    // Prepare the request body
    const requestBody = {
      page,
      limit,
      startDate,
      endDate,
      dataType,
      type,
    };

    // Optional: Build query string if backend requires both
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
      dataType,
      type,
    }).toString();

    // Call API using POST method with body and optional query string
    const data = await makeRequest(`/lottery-bet-history?${queryParams}`, 'POST', requestBody, true);

    console.log('Lottery Bet History Response:', data);

    return {
      data: data.data || [],
      success: data.success || false,
      successCode: data.successCode || null,
      panelStatusCode: data.panelStatusCode || null,
      message: data.message || '',
      pagination: data.pagination || {
        page: 1,
        limit: 10,
        totalPages: 1,
        totalItems: 0,
      },
    };
  } catch (error) {
    console.error('Lottery Bet History Error:', error);
    Alert.alert(
      'Lottery Bet History Error',
      error.message || 'Could not load lottery bet history'
    );
    throw error;
  }
};


export const fetchGamesList = async ({ page = 1, pageSize = 10 } = {}) => {
  try {
    // Build query string from parameters
    const queryParams = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    }).toString();

    const data = await makeRequest(`/user-games?${queryParams}`, 'GET', null, true);

    // Log the full response for debugging
    console.log("Games List Response:", data);

    // Validate and structure the response
    return {
      data: data.data || [],
      success: data.success || false,
      successCode: data.successCode || null,
      panelStatusCode: data.panelStatusCode || null,
      message: data.message || '',
      pagination: data.pagination || {
        page: 1,
        pageSize: 10,
        totalPages: 1,
      },
    };
  } catch (error) {
    console.error('Games List Error:', error);
    Alert.alert(
      'Games List Error',
      error.message || 'Could not load games list'
    );
    throw error;
  }
};

export const fetchUserActivityLog = async () => {
  try {
    const data = await makeRequest('/user-activitylog', 'GET', null, true);

    // Log the full response for debugging
    console.log("User Activity Log Response:", data);

    // Validate and structure the response
    return {
      data: data.data || null,
      success: data.success || false,
      successCode: data.successCode || null,
      panelStatusCode: data.panelStatusCode || null,
      message: data.message || '',
    };
  } catch (error) {
    console.error('User Activity Log Error:', error);
    Alert.alert(
      'Activity Log Error',
      error.message || 'Could not load user activity log'
    );
    throw error;
  }
};

// Lottery market 
export const fetchAllMarkets = async () => {
  try {
    const data = await makeRequest('/user-getAllMarket', 'GET', null, true);
    
    // Return only the data array
    return data.data || [];
  } catch (error) {
    console.error('All Markets Fetch Error:', error);
    Alert.alert(
      'Markets Error',
      error.message || 'Could not load markets data'
    );
    throw error;
  }
};


export const fetchAllGameData = async () => {
  try {
    const data = await makeRequest('/user-all-gameData', 'GET', null, true);
    
    // Log the full response for debugging
    console.log("All Game Data Response:", data);

    // Validate and structure the response
    return {
      data: data.data || [],
      success: data.success || false,
      successCode: data.successCode || null,
      panelStatusCode: data.panelStatusCode || null,
      message: data.message || 'Success',
      pagination: data.pagination || null,
    };
  } catch (error) {
    console.error('All Game Data Fetch Error:', error);
    Alert.alert(
      'Game Data Error',
      error.message || 'Could not load game data'
    );
    throw error;
  }
};

export const fetchAllMarketsByDate = async (date) => {
  try {
    // Format the date parameter (assuming it's a Date object or ISO string)
    const dateParam = date ? new Date(date).toISOString().split('T')[0] : '';
    
    // Make the request with the date parameter
    const data = await makeRequest(`/user/getMarkets?date=${dateParam}`, 'GET', null, true);
    
    // Return the data array or empty array if not available
    return data.data || [];
  } catch (error) {
    console.error('All Markets Fetch Error:', error);
    Alert.alert(
      'Markets Error',
      error.message || 'Could not load markets data'
    );
    throw error;
  }
};

export const fetchPurchaseHistory = async (
  marketId,
  { page = 1, limitPerPage = 10, sem = '' } = {}
) => {
  try {
    if (!marketId) throw new Error('Market ID is required');

    const requestBody = {
      marketId,
      page,
      limit: limitPerPage,
      searchBySem: sem,
    };

    // Construct the URL with query params
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limitPerPage: limitPerPage.toString(),
      sem: sem || '',
    }).toString();

    const url = `/purchase-history/${marketId}?${queryParams}`;

    const data = await makeRequest(url, 'POST', requestBody, true);

    console.log('dataaaaaaaaaaaaaaaa', data);

    return data.data || [];
  } catch (error) {
    console.error('Purchase History Error:', error);
    Alert.alert(
      'Purchase History Error',
      error.message || 'Could not load purchase history'
    );
    throw error;
  }
};

export const fetchMarketsByDate = async (date) => {
  try {
    if (!date) {
      throw new Error('Date is required in YYYY-MM-DD format');
    }

    // Validate date format (simple regex check)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new Error('Invalid date format. Please use YYYY-MM-DD');
    }

    const data = await makeRequest(`/user/markets-dateWise?date=${date}`, 'GET', null, true);

    // Log the full response for debugging
    console.log("Markets by Date Response:", data);

    // Validate and structure the response
    return {
      data: data.data || [],
      success: data.success || false,
      successCode: data.successCode || null,
      panelStatusCode: data.panelStatusCode || null,
      message: data.message || '',
      pagination: data.pagination || null,
    };
  } catch (error) {
    console.error('Markets by Date Error:', error);
    Alert.alert(
      'Markets Error',
      error.message || 'Could not load markets for the selected date'
    );
    throw error;
  }
};

export const fetchLotteryResultsByMarket = async (marketId) => {
  try {
    if (!marketId) {
      throw new Error('Market ID is required');
    }

    const data = await makeRequest(`/user-lottery-results/${marketId}`, 'GET', null, true);

    // Log the full response for debugging
    console.log("Lottery Results Response:", data);

    // Validate and structure the response
    return {
      data: data.data || [],
      success: data.success || false,
      successCode: data.successCode || null,
      panelStatusCode: data.panelStatusCode || null,
      message: data.message || '',
      pagination: data.pagination || null,
    };
  } catch (error) {
    console.error('Lottery Results Error:', error);
    Alert.alert(
      'Lottery Results Error',
      error.message || 'Could not load lottery results'
    );
    throw error;
  }
};

export const fetchFilteredMarketData = async (marketId, userId) => {
  try {
    if (!marketId) {
      throw new Error('Market ID is required');
    }
    if (!userId) {
      throw new Error('User ID is required');
    }

    // Make POST request with marketId in URL and userId in body
    const data = await makeRequest(
      `/user-filter-marketData/${marketId}`,
      'POST',
      { userId },
      true
    );

    // Log the full response for debugging
    console.log("Filtered Market Data Response:", data);

    // Validate and structure the response
    return {
      data: data.data || null,
      success: data.success || false,
      successCode: data.successCode || null,
      panelStatusCode: data.panelStatusCode || null,
      message: data.message || '',
      pagination: data.pagination || null,
    };
  } catch (error) {
    console.error('Filtered Market Data Error:', error);
    Alert.alert(
      'Market Data Error',
      error.message || 'Could not load market data'
    );
    throw error;
  }
};

export const fetchLotteryRanges = async () => {
  try {
    const data = await makeRequest('/get-range', 'GET', null, true);

    // Log the full response for debugging
    console.log("Lottery Ranges Response:", data);

    // Validate and structure the response
    return {
      data: data.data || [],
      success: data.success || false,
      successCode: data.successCode || null,
      panelStatusCode: data.panelStatusCode || null,
      message: data.message || '',
      pagination: data.pagination || null,
    };
  } catch (error) {
    console.error('Lottery Ranges Error:', error);
    Alert.alert(
      'Lottery Ranges Error',
      error.message || 'Could not load lottery ranges'
    );
    throw error;
  }
};

export const searchTicket = async ({ group, series, number, sem, marketId }) => {
  try {
    // Validate required parameters
    if (!group || !series || !number || !sem || !marketId) {
      throw new Error('All parameters (group, series, number, sem, marketId) are required');
    }

    // Prepare request body
    const requestBody = {
      group,
      series,
      number,
      sem,
      marketId
    };

    // Make the API request
    const data = await makeRequest('/search-ticket', 'POST', requestBody, true);

    // Log the response for debugging
    console.log('Search Ticket Response:', data);

    // Validate and structure the response
    return {
      tickets: data.data?.tickets || [],
      price: data.data?.price || 0,
      sem: data.data?.sem || 0,
      generateId: data.data?.generateId || '',
      success: data.success || false,
      message: data.message || '',
      ...(data.pagination && { pagination: data.pagination })
    };

  } catch (error) {
    console.error('Search Ticket Error:', error);
    Alert.alert(
      'Search Error',
      error.message || 'Could not search for tickets'
    );
    throw error;
  }
};

// Add this to handle token cleanup on logout
export const logoutUser = async () => {
  await AsyncStorage.removeItem('authToken');
};