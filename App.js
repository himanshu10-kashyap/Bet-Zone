import React from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import { AppProvider } from './src/redux/context.js';

export default function App() {
  return (
    <AppProvider>
      <AppNavigator />
    </AppProvider>

  );
}