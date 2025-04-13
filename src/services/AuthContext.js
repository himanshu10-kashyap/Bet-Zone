// context/AuthContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginUser as apiLoginUser, logoutUser as apiLogoutUser } from '../services/authService.js';

const AuthContext = createContext();


export const AuthProvider = ({ children }) => {
  const [authToken, setAuthToken] = useState(null);
  const [user, setUser] = useState(null); // <-- store user info
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAuth = async () => {
      const token = await AsyncStorage.getItem('authToken');
      const userData = await AsyncStorage.getItem('user');

      if (token) setAuthToken(token);
      if (userData) setUser(JSON.parse(userData));

      setIsLoading(false);
    };
    loadAuth();
  }, []);

  const login = async (credentials) => {
    const data = await apiLoginUser(credentials);
    if (data?.token) {
      setAuthToken(data.token);
      setUser(data); // <-- store full login response
         
      await AsyncStorage.setItem('authToken', data.token);
      await AsyncStorage.setItem('user', JSON.stringify(data));
    }
    return data;
  };

  const logout = async () => {
    await apiLogoutUser();
    setAuthToken(null);
    setUser(null);
    await AsyncStorage.multiRemove(['authToken', 'user']);
  };

  return (
    <AuthContext.Provider value={{ authToken, isLoggedIn: !!authToken, user, login, logout }}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};



// Custom hook
export const useAuth = () => useContext(AuthContext);
