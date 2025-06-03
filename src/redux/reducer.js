import { getAppInitialState, getUserInitialState, getUserPlaceBidding, getUserWalletInitialState } from "../utilities/getInitiateState";
import strings from "../utilities/stringConstant";
import AsyncStorage from '@react-native-async-storage/async-storage';

export const reducer = (state, action) => {
  switch (action.type) {
    case strings.LOG_IN:
      return {
        ...state,
        user: getUserInitialState({ 
          ...action.payload, 
          isLogin: true 
        }),
        isLoading: false
      };
      
    case strings.LOG_OUT:
      // Clear all user-related data
      return {
        ...getAppInitialState(), // Reset to initial state
        isLoading: false
      };

    case strings.UPDATE_NAME:
      return {
        ...state,
        user: {
          ...state.user,
          ...action.payload,
        },
      };

    case strings.UPDATE_ANNOUNCEMENT:
      return {
        ...state,
        announcement: action.payload,
      };

    case strings.UPDATE_USER_WALLET:
      return {
        ...state,
        user: {
          ...state.user,
          wallet: getUserWalletInitialState(action.payload),
        },
      };

      case 'UPDATE_PLACE_BIDDING':
        return {
          ...state,
          placeBidding: {
            ...state.placeBidding,
            ...action.payload
          }
        };

    case strings.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };

    case 'WALLET_ERROR':
    case 'AUTH_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false
      };

    default:
      return state;
  }
};

export const logoutUser = async (dispatch) => {
  try {
    // Clear all relevant storage
    await AsyncStorage.multiRemove([
      'app_state',
      'authToken',
      'userData'
    ]);
    
    // Dispatch logout action
    dispatch({ type: strings.LOG_OUT });
    
    return true;
  } catch (error) {
    console.error('Logout failed:', error);
    return false;
  }
};