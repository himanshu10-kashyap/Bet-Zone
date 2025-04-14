import React, { useEffect, useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { fetchFilteredMarketData } from '../services/authService';
import { useAppContext } from '../redux/context';

const ColorGamePlayScreen = ({ route }) => {
  const { marketId } = route.params;
  const { store } = useAppContext();
  const userId = store.user?.userId;
  const [marketData, setMarketData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedOdd, setSelectedOdd] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [betAmount, setBetAmount] = useState('');
  const [selectedAmount, setSelectedAmount] = useState(null);
  const timerRef = useRef(null);

  const fetchMarketData = async () => {
    try {
      if (!userId) {
        throw new Error('User not authenticated');
      }

      const response = await fetchFilteredMarketData(marketId, userId);
      
      if (response.success) {
        setMarketData(response.data);
        calculateTimeRemaining(response.data);
        setError(null);
      } else {
        throw new Error(response.message || 'Failed to load market data');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message || 'An error occurred');
      setMarketData(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const calculateTimeRemaining = (data) => {
    if (!data || !data.startTime || !data.endTime) return;
    
    const now = new Date();
    const start = new Date(data.startTime);
    const end = new Date(data.endTime);
    
    if (now < start) {
      setTimeRemaining(Math.floor((start - now) / 1000));
    } else if (now < end) {
      setTimeRemaining(Math.floor((end - now) / 1000));
    } else {
      setTimeRemaining(0);
    }
  };

  useEffect(() => {
    fetchMarketData();
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 0) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [marketId, userId]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchMarketData();
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleString([], {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid date';
    }
  };

  const handleOddSelection = (runnerId, type, value) => {
    if (!marketData?.isActive) return;
    setSelectedOdd({
      runnerId,
      type,
      value,
      runnerName: marketData.runners.find(r => r.runnerName.runnerId === runnerId)?.runnerName.name
    });
    setSelectedAmount(null);
    setBetAmount('');
  };

  const closeModal = () => {
    setSelectedOdd(null);
  };

  const formatTime = (seconds) => {
    const days = Math.floor(seconds / (3600 * 24));
    const hours = Math.floor((seconds % (3600 * 24)) / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${days}D : ${hours}H : ${mins}M : ${secs}S`;
  };

  const renderTimer = () => {
    if (!marketData) return null;
    
    const now = new Date();
    const start = new Date(marketData.startTime);
    const end = new Date(marketData.endTime);
    
    let status = '';
    let timerColor = '#FF3B30';
    
    if (now < start) {
      status = 'Starting Soon';
      timerColor = '#FF9500';
    } else if (now < end) {
      status = 'Running';
      timerColor = '#34C759';
    } else {
      status = 'Completed';
      timerColor = '#8E8E93';
    }
    
    return (
      <View style={styles.timerContainer}>
        <View style={[styles.timerIndicator, { backgroundColor: timerColor }]} />
        <View style={styles.timerContent}>
          <Text style={styles.timerText}>{formatTime(timeRemaining)}</Text>
          <Text style={[styles.timerStatus, { color: timerColor }]}>{status}</Text>
        </View>
      </View>
    );
  };

  const presetAmounts = [100, 150, 200, 500, 1000, 2000, 5000, 10000];

  const handlePlaceBet = () => {
    if (!betAmount || isNaN(betAmount) || parseFloat(betAmount) <= 0) {
      alert('Please enter a valid bet amount');
      return;
    }
    
    console.log('Placing bet:', {
      runnerId: selectedOdd.runnerId,
      type: selectedOdd.type,
      odd: selectedOdd.value,
      amount: parseFloat(betAmount),
      userId
    });
    
    closeModal();
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#5E35B1" />
        <Text style={styles.loadingText}>Loading market data...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!marketData) {
    return (
      <View style={styles.noDataContainer}>
        <Text style={styles.noDataText}>No market data available</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      {/* Full-screen suspended overlay */}
      {!marketData.isActive && (
        <View style={styles.suspendedOverlay}>
          <View style={styles.suspendedContent}>
            <Text style={styles.suspendedText}>MARKET SUSPENDED</Text>
          </View>
        </View>
      )}

      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#5E35B1']}
            tintColor="#5E35B1"
          />
        }
      >
        {/* Market Info Card */}
        <View style={styles.marketCard}>
          <Text style={styles.marketName}>{marketData.marketName}</Text>
          
          <View style={styles.timeContainer}>
            <View style={styles.timeRow}>
              <Text style={styles.timeLabel}>Start:</Text>
              <Text style={styles.timeValue}>{formatDateTime(marketData.startTime)}</Text>
            </View>
            <View style={styles.timeRow}>
              <Text style={styles.timeLabel}>End:</Text>
              <Text style={styles.timeValue}>{formatDateTime(marketData.endTime)}</Text>
            </View>
          </View>
          
          {renderTimer()}
        </View>

        {/* Runners Table */}
        <View style={styles.runnersTable}>
          {marketData.runners?.map((runner, index) => (
            <View key={`${runner.runnerName.runnerId}-${index}`} style={styles.runnerRow}>
              <View style={styles.runnerInfo}>
                <Text style={styles.runnerNameText} numberOfLines={1}>
                  {runner.runnerName.name}
                </Text>
                {runner.runnerName.isWin && (
                  <View style={styles.winnerBadge}>
                    <Text style={styles.winnerText}>WINNER</Text>
                  </View>
                )}
              </View>
              
              <View style={styles.oddsContainer}>
                <TouchableOpacity 
                  style={[styles.oddButton, styles.backButton]}
                  onPress={() => handleOddSelection(
                    runner.runnerName.runnerId, 
                    'back', 
                    runner.rate[0]?.back
                  )}
                  disabled={!marketData.isActive}
                >
                  <Text style={styles.oddValue}>{runner.rate[0]?.back || 'N/A'}</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.oddButton, styles.layButton]}
                  onPress={() => handleOddSelection(
                    runner.runnerName.runnerId, 
                    'lay', 
                    runner.rate[0]?.lay
                  )}
                  disabled={!marketData.isActive}
                >
                  <Text style={styles.oddValue}>{runner.rate[0]?.lay || 'N/A'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Bet Placement Modal */}
      <Modal
        visible={!!selectedOdd}
        transparent={true}
        animationType="fade"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalHeader}>Place {selectedOdd?.type.toUpperCase()} Bet</Text>
            
            <View style={styles.modalSection}>
              <Text style={styles.modalLabel}>Runner:</Text>
              <Text style={styles.modalValue}>{selectedOdd?.runnerName}</Text>
            </View>
            
            <View style={styles.modalSection}>
              <Text style={styles.modalLabel}>Odd:</Text>
              <Text style={[styles.modalValue, styles.oddValue]}>{selectedOdd?.value}</Text>
            </View>
            
            <View style={styles.modalSection}>
              <Text style={styles.modalLabel}>Amount (₹):</Text>
              <TextInput
                style={styles.amountInput}
                keyboardType="numeric"
                placeholder="Enter amount"
                value={betAmount}
                onChangeText={setBetAmount}
                placeholderTextColor="#999"
              />
              
              <View style={styles.amountPresets}>
                {presetAmounts.map((amount) => (
                  <TouchableOpacity
                    key={amount}
                    style={[
                      styles.amountButton,
                      selectedAmount === amount && styles.selectedAmountButton
                    ]}
                    onPress={() => {
                      setSelectedAmount(amount);
                      setBetAmount(amount.toString());
                    }}
                  >
                    <Text style={[
                      styles.amountButtonText,
                      selectedAmount === amount && styles.selectedAmountButtonText
                    ]}>{amount}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={closeModal}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.placeButton]}
                onPress={handlePlaceBet}
              >
                <Text style={[styles.buttonText, styles.placeButtonText]}>Place Bet</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#5E35B1',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 16,
    padding: 20,
    textAlign: 'center',
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  noDataText: {
    fontSize: 16,
    color: '#666',
  },
  marketCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  marketName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  timeContainer: {
    marginBottom: 16,
  },
  timeRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  timeLabel: {
    fontSize: 14,
    color: '#666',
    width: 60,
  },
  timeValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  timerIndicator: {
    width: 8,
    height: 40,
    borderRadius: 4,
    marginRight: 12,
  },
  timerContent: {
    flex: 1,
  },
  timerText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  timerStatus: {
    fontSize: 14,
    fontWeight: '500',
  },
  runnersTable: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  runnerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  runnerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  runnerNameText: {
    fontSize: 16,
    color: '#333',
    marginRight: 8,
    flexShrink: 1,
  },
  winnerBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  winnerText: {
    fontSize: 12,
    color: '#2E7D32',
    fontWeight: 'bold',
  },
  oddsContainer: {
    flexDirection: 'row',
    width: 120,
    justifyContent: 'space-between',
  },
  oddButton: {
    width: 56,
    height: 40,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    backgroundColor: '#E3F2FD',
  },
  layButton: {
    backgroundColor: '#FFEBEE',
  },
  oddValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  suspendedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  suspendedContent: {
    backgroundColor: '#D32F2F',
    padding: 20,
    borderRadius: 8,
  },
  suspendedText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
  },
  modalHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalSection: {
    marginBottom: 16,
  },
  modalLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  modalValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  oddValue: {
    color: '#5E35B1',
    fontWeight: 'bold',
  },
  amountInput: {
    height: 48,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    marginBottom: 12,
    color: '#333',
  },
  amountPresets: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  amountButton: {
    width: '23%',
    height: 40,
    backgroundColor: '#F0F0F0',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  selectedAmountButton: {
    backgroundColor: '#5E35B1',
  },
  amountButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  selectedAmountButtonText: {
    color: '#FFF',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  modalButton: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F0F0F0',
    marginRight: 8,
  },
  placeButton: {
    backgroundColor: '#5E35B1',
    marginLeft: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  placeButtonText: {
    color: '#FFF',
  },
});

export default ColorGamePlayScreen;