// context/AppContext.js
import { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAppInitialState } from '../utilities/getInitiateState';
import { reducer } from './reducer';


const AppContext = createContext();

const AppProvider = ({ children }) => {
  const [store, dispatch] = useReducer(reducer, getAppInitialState());

  // Load saved state
  useEffect(() => {
    const loadState = async () => {
      try {
        const savedState = await AsyncStorage.getItem('app_state');
        if (savedState) {
          dispatch({ type: 'HYDRATE_STATE', payload: JSON.parse(savedState) });
        }
      } catch (error) {
        console.error('Failed to load state', error);
      }
    };
    loadState();
  }, []);

  // Save state on changes
  useEffect(() => {
    const saveState = async () => {
      try {
        await AsyncStorage.setItem('app_state', JSON.stringify(store));
      } catch (error) {
        console.error('Failed to save state', error);
      }
    };
    saveState();
  }, [store]);

  return (
    <AppContext.Provider value={{ store, dispatch }}>
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