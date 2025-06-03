import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  ToastAndroid,
  Alert
} from 'react-native';
import { fetchFilteredMarketData, fetchUserWallet, userBidding } from '../services/authService';
import { useAppContext } from '../redux/context';
import strings from '../utilities/stringConstant';
// import { db } from '../utilities/firebase';
// import { collection, onSnapshot } from "firebase/firestore";
import { useNavigation } from '@react-navigation/native';

const ColorGamePlayScreen = ({ route }) => {
  // State and ref declarations
  const { marketId } = route.params;
  const { store, dispatch, updateWalletAndExposure } = useAppContext();
  const userId = store.user?.userId;
  // const [isActive, setIsActive] = useState(null);
  const [marketData, setMarketData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [bidding, setBidding] = useState({ amount: 0, rate: 0 });
  const [toggle, setToggle] = useState({ toggleOpen: false,
    indexNo: "",
    mode: "",
    stateindex: 0,
    runnerName: "", });
  const [preExposure, setPreExposure] = useState(0);
  const [placingBet, setPlacingBet] = useState(false);
  // const [isUpdate, setIsUpdate] = useState(null);
  const navigation = useNavigation();
  
  const timerRef = useRef(null);
  // let arr = [];
  const [arr, setArr] = useState([]);

  const fetchMarketData = async () => {
    try {
      if (!userId) {
        throw new Error('User not authenticated');
      }

      dispatch({
        type: strings.isLoading,
        payload: true,
      });
      
      const response = await fetchFilteredMarketData(marketId, userId);

      dispatch({
        type: strings.isLoading,
        payload: false,
      });

      if (response.success) {
        const preMaxExposure = getMaxNegativeBalance(response.data.runners);
        console.log("preMaxExposure", preMaxExposure);
        setPreExposure(preMaxExposure);
        setMarketData(response.data);
        setError(null);
        // Reset timer when new data comes in
        setupTimer(response.data);
      } else {
        throw new Error(response.message || 'Failed to load market data');
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
      setMarketData(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (marketData?.runners?.length) {
      const newBetArr = marketData.runners.map(runner => runner.runnerName.bal);
      setArr(newBetArr);
    }
  }, [bidding.amount]);

  // Fire base code

  // useEffect(() => {
  //   const unsubscribe = onSnapshot(
  //     collection(db, "color-game-db"),
  //     (snapshot) => {
  //       const messagesData = snapshot.docs.map((doc) => ({
  //         id: doc.id,
  //         ...doc.data(),
  //       }));

  //       console.log("Messages Data:", messagesData);
  //       messagesData.map((message) => {
  //         if (store?.placeBidding?.marketId === message?.id) {
  //           console.log(
  //             "Filtered Message ID:",
  //             message.id,
  //             store?.placeBidding?.marketId
  //           );
  //           setIsActive(message.isActive);
  //           setIsUpdate(message.updatedAt);
  //           if (message.hideMarketUser === false) {
  //             navigation.navigate('HomeScreen');
  //           }
  //         }
  //       });
  //     }
  //   );

  //   return () => unsubscribe();
  // }, []);

  // firebase 

  // Helper functions
  const showToast = (message) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      Alert.alert(message);
    }
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

  const winBalance =
    bidding.amount *
    (Number(bidding.rate) === 0
      ? Number(bidding.rate)
      : Number(bidding.rate) - 1);

  function lowestNegativeNumber(arr) {
    let lowestNegative = Number.POSITIVE_INFINITY;
    let foundNegative = false;

    for (let i = 0; i < arr.length; i++) {
      if (arr[i] < 0 && arr[i] < lowestNegative) {
        lowestNegative = arr[i];
        foundNegative = true;
      }
    }
     console.log("lowestNegative", lowestNegative);
    return foundNegative ? lowestNegative : 0;
  }

  const getMaxNegativeBalance = (runners) => {
    let maxNegativeRunner = 0;

    runners.forEach((runner) => {
      if (Number(runner.runnerName.bal) < maxNegativeRunner) {
        maxNegativeRunner = Number(runner.runnerName.bal);
      }
    });
    return maxNegativeRunner;
  };

  const formatTime = (seconds) => {
    const days = Math.floor(seconds / (3600 * 24));
    const hours = Math.floor((seconds % (3600 * 24)) / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${days.toString().padStart(2, '0')}D : ${hours.toString().padStart(2, '0')}H : ${mins.toString().padStart(2, '0')}M : ${secs.toString().padStart(2, '0')}S`;
  };

  // Timer functions
  const calculateTimeRemaining = (market) => {
    if (!market) return 0;

    const now = new Date();
    const end = new Date(market.endTime);

    if (!market.isActive || now >= end) {
      return 0;
    }

    return Math.floor((end - now) / 1000);
  };

  const setupTimer = (market) => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    const initialTime = calculateTimeRemaining(market || marketData);
    setTimeRemaining(initialTime);

    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 0) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Event handlers
  const onRefresh = () => {
    setRefreshing(true);
    fetchMarketData();
  };

  const handleToggle = (indexNo, rate, mode, runnerId) => {
    setToggle(prev => ({
      indexNo,
      mode,
      toggleOpen: prev.indexNo === indexNo ? !prev.toggleOpen : true
    }));
    setBidding({
      amount: 0,
      rate: rate
    });
    dispatch({
      type: 'UPDATE_PLACE_BIDDING',
      payload: { runnerId: runnerId }
    });
  };

  const handleCancel = () => {
    setToggle({
      mode: '',
      indexNo: null,
      toggleOpen: false
    });
    setBidding({
      amount: 0,
      rate: 0
    });
  };

  const handleBiddingAmount = (type, value) => {
    setBidding(prev => ({
      ...prev,
      [type]: Number(value)
    }));
  };

  const handleUserBidding = async (index, amount, mode) => {
    try {
      setPlacingBet(true);
      
      let difference = 0;
      let bal = 0;

      for (let i = 0; i < arr.length; i++) {
        if (mode === "back") {
          if (index === i) {
            arr[i] = arr[i] + winBalance;
          } else {
            arr[i] = arr[i] - Number(amount);
          }
        }
        if (mode === "lay") {
          if (index === i) {
            arr[i] = arr[i] - winBalance;
          } else {
            arr[i] = arr[i] + Number(amount);
          }
        }
      }

      const highestNegetive = lowestNegativeNumber(arr);

      if (Math.abs(preExposure) >= Math.abs(highestNegetive.toFixed(2))) {
        difference = Math.abs(preExposure) - Math.abs(highestNegetive.toFixed(2));
        bal = store.user.wallet.balance + difference;
      } else {
        difference = Math.abs(highestNegetive.toFixed(2)) - Math.abs(preExposure);
        bal = store.user.wallet.balance - difference;
      }

      if (!store.user.isLogin) {
        showToast("Please login to place bets");
        return;
      }

      if (
        bidding.amount == 0 ||
        bidding.amount < 0 ||
        bidding.amount === "" ||
        bidding.amount < 100
      ) {
        if (bidding.amount === 0) {
          showToast("Amount cannot be zero");
          return;
        } else if (bidding.amount < 0) {
          showToast("Amount should be a positive value.");
          return;
        } else if (bidding.amount === "") {
          showToast("Amount cannot be empty.");
          return;
        } else if (bidding.amount < 100) {
          showToast("Minimum Amount for Bet should be 100.");
          return;
        }
      }

      if (
        (bidding.amount > store.user?.wallet?.balance &&
          !(toggle.mode === "lay")) ||
        ((Number(bidding.rate) - 1) * bidding.amount >
          store.user?.wallet?.balance &&
          !(toggle.mode === "back"))
      ) {
        showToast("Insufficient amount.");
        return;
      }

      let marketListExposureUpdated = [];
      if (
        store.user.wallet?.marketListExposure &&
        store.user.wallet?.marketListExposure.length > 0
      ) {
        marketListExposureUpdated = [...store.user.wallet?.marketListExposure];
      }

      let currentMarketExposure = {
        [store.placeBidding.marketId]: Math.abs(highestNegetive.toFixed(2)),
      };

      if (marketListExposureUpdated?.length === 0) {
        marketListExposureUpdated.push(currentMarketExposure);
      } else {
        let flag = true;
        marketListExposureUpdated.forEach((entry) => {
          if (entry[store.placeBidding.marketId]) {
            entry[store.placeBidding.marketId] = Math.abs(
              highestNegetive.toFixed(2)
            );
            flag = false;
          }
        });

        if (flag) {
          marketListExposureUpdated.push(currentMarketExposure);
        }
      }

      const values = {
        userId: store.user.userId,
        gameId: store.placeBidding.gameId,
        marketId: store.placeBidding.marketId,
        runnerId: store.placeBidding.runnerId,
        value: bidding.amount,
        bidType: toggle.mode,
        exposure: Math.abs(highestNegetive.toFixed(2)),
        wallet: bal,
        marketListExposure: marketListExposureUpdated ?? [],
      };
       
      console.log("values", values);
      

      const response = await userBidding(values);


      if (response.success) {
        showToast("Bet placed successfully!");
        // Update wallet and exposure
        await updateWalletAndExposure();
        // Refresh market data
        await fetchMarketData();
      } else {
        showToast(response.message || "Failed to place bet");
      }
    } catch (error) {
      showToast("An error occurred while placing your bet");
    } finally {
      setPlacingBet(false);
      handleCancel();
    }
  };

  // Component render functions
  const renderTimer = () => {
    if (!marketData) return null;

    const now = new Date();
    const start = new Date(marketData.startTime);
    const end = new Date(marketData.endTime);

    let status = '';
    let timerColor = '#FF3B30';

    if (!marketData.isActive) {
      status = 'Completed';
      timerColor = '#8E8E93';
    } else if (now < start) {
      status = 'Running';
      timerColor = '#34C759';
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
          <Text style={styles.timerText}>
            {marketData.isActive ? formatTime(timeRemaining) : '00D : 00H : 00M : 00S'}
          </Text>
          <Text style={[styles.timerStatus, { color: timerColor }]}>{status}</Text>
        </View>
      </View>
    );
  };

  const renderRunnerRow = ({ item: runnerData, index }) => {
    // const winBalance = toggle.mode === 'back' ? bidding.amount * (Number(bidding.rate) - 1) : bidding.amount;

    const shouldDisplayTempLay = toggle.mode === "lay" &&
      toggle.indexNo === runnerData.id &&
      (winBalance !== 0 ||
        Number(runnerData.runnerName.bal) -
        Math.round(Math.abs(winBalance)) !==
        0);

    const shouldDisplayTempBack = toggle.mode === "back" &&
      toggle.indexNo === runnerData.id &&
      (winBalance !== 0 ||
        Number(runnerData.runnerName.bal) -
        Math.round(Math.abs(winBalance)) !==
        0);

    return (
      <View>
        <View style={styles.runnerRow}>
          <View style={styles.runnerNameContainer}>
            <Text style={styles.runnerNameText}>{runnerData.runnerName.name}</Text>

            {toggle.mode === "lay" ? (
              <View>
                {shouldDisplayTempLay ? (
                  <View style={styles.balanceContainer}>
                    {Number(runnerData.runnerName.bal) === 0 && !bidding.amount ? (
                      <Text style={styles.balanceText}>0</Text>
                    ) : Number(runnerData.runnerName.bal) > 0 ? (
                      <Text style={styles.positiveBalance}>+{Number(runnerData.runnerName.bal)}</Text>
                    ) : (
                      runnerData.runnerName.bal != 0 && (
                        <Text style={styles.negativeBalance}>{Number(runnerData.runnerName.bal)}</Text>
                      )
                    )}

                    {Number(runnerData.runnerName.bal) - Math.round(Math.abs(winBalance)) > 0 ? (
                      <Text style={styles.positiveBalance}>
                        {bidding.amount != 0 && (
                          `(${Number(runnerData.runnerName.bal) - Math.round(Math.abs(winBalance))})`
                        )}
                      </Text>
                    ) : (
                      <Text style={styles.negativeBalance}>
                        {bidding.amount != 0 && (
                          `(${Number(runnerData.runnerName.bal) - Math.round(Math.abs(winBalance))})`
                        )}
                      </Text>
                    )}
                  </View>
                ) : (
                  <View style={styles.balanceContainer}>
                    {Number(runnerData.runnerName.bal) === 0 && !bidding.amount ? (
                      null
                    ) : Number(runnerData.runnerName.bal) > 0 ? (
                      <Text style={styles.positiveBalance}>
                        {bidding.amount != 0 && runnerData.runnerName.bal}
                        <Text
                          style={
                            Number(runnerData.runnerName.bal) + Math.round(bidding.amount) > 0
                              ? styles.positiveBalance
                              : styles.negativeBalance
                          }
                        >
                          {bidding.amount != 0 &&
                            `(${Number(runnerData.runnerName.bal) + Math.round(bidding.amount)})`
                          }
                        </Text>
                      </Text>
                    ) : (
                      <Text
                        style={
                          Number(runnerData.runnerName.bal) + Math.round(bidding.amount) > 0
                            ? styles.positiveBalance
                            : styles.negativeBalance
                        }
                      >
                        {runnerData.runnerName.bal != 0 && bidding.amount != 0 && runnerData.runnerName.bal}
                        {bidding.amount != 0 &&
                          `(${Number(runnerData.runnerName.bal) + Math.round(bidding.amount)})`
                        }
                      </Text>
                    )}
                  </View>
                )}
              </View>
            ) : (
              <View>
                {shouldDisplayTempBack ? (
                  <View style={styles.balanceContainer}>
                    {Number(runnerData.runnerName.bal) === 0 &&
                      !bidding.amount ? (
                      null
                    ) : Number(runnerData.runnerName.bal) > 0 ? (
                      <Text style={styles.positiveBalance}>+{Number(runnerData.runnerName.bal)}</Text>
                    ) : (
                      runnerData.runnerName.bal != 0 && (
                        <Text style={styles.negativeBalance}>{Number(runnerData.runnerName.bal)}</Text>
                      )
                    )}

                    {Number(runnerData.runnerName.bal) +
                      Math.round(Math.abs(winBalance)) >
                      0 ? (
                      <Text style={styles.positiveBalance}>
                        {bidding.amount != 0 && (
                          `(${Number(runnerData.runnerName.bal) +
                          Math.round(Math.abs(winBalance))})`
                        )}
                      </Text>
                    ) : (
                      <Text style={styles.negativeBalance}>
                        {bidding.amount != 0 && (
                          `(${Number(runnerData.runnerName.bal) +
                          Math.round(Math.abs(winBalance))})`
                        )}
                      </Text>
                    )}
                  </View>
                ) : (
                  <View style={styles.balanceContainer}>
                    {Number(runnerData.runnerName.bal) === 0 &&
                      !bidding.amount ? (
                      null
                    ) : Number(runnerData.runnerName.bal) > 0 ? (
                      <Text style={styles.positiveBalance}>
                        {bidding.amount != 0 && runnerData.runnerName.bal}
                        <Text style={Number(runnerData.runnerName.bal) -
                          Math.round(bidding.amount) >
                          0
                          ? styles.positiveBalance
                          : styles.negativeBalance}>
                          {`(${Number(runnerData.runnerName.bal) -
                            Math.round(bidding.amount)})`}
                        </Text>
                      </Text>
                    ) : (
                      <Text style={Number(runnerData.runnerName.bal) -
                        Math.round(bidding.amount) >
                        0
                        ? styles.positiveBalance
                        : styles.negativeBalance}>
                        {runnerData.runnerName.bal != 0 &&
                          bidding.amount != 0 &&
                          runnerData.runnerName.bal}
                        {`(${Number(runnerData.runnerName.bal) -
                          Math.round(bidding.amount)})`}
                      </Text>
                    )}
                  </View>
                )}
              </View>
            )}
          </View>

          <View style={styles.oddsContainer}>
            <TouchableOpacity
              style={[
                styles.oddButton,
                styles.backButton,
                !marketData.isActive && styles.disabledButton
              ]}
              onPress={() => handleToggle(
                runnerData.id,
                runnerData.rate[0]?.back,
                'back',
                runnerData.runnerName.runnerId
              )}
              disabled={!marketData.isActive}
            >
              <Text style={styles.oddValue}>{runnerData.rate[0]?.back || 'N/A'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.oddButton,
                styles.layButton,
                !marketData.isActive && styles.disabledButton
              ]}
              onPress={() => handleToggle(
                runnerData.id,
                runnerData.rate[0]?.lay,
                'lay',
                runnerData.runnerName.runnerId
              )}
              disabled={!marketData.isActive}
            >
              <Text style={styles.oddValue}>{runnerData.rate[0]?.lay || 'N/A'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {toggle.indexNo === runnerData.id && toggle.toggleOpen && (
          <View style={[
            styles.biddingContainer,
            toggle.mode === 'back' ? styles.backBidding : styles.layBidding
          ]}>
            <View style={styles.biddingControls}>
              <View style={styles.controlGroup}>
                <Text style={styles.controlLabel}>Odds</Text>
                <View style={styles.inputGroup}>
                  <TouchableOpacity
                    style={styles.adjustButton}
                    onPress={() => handleBiddingAmount('rate', bidding.rate - 0.1)}
                  >
                    <Text style={styles.adjustText}>-</Text>
                  </TouchableOpacity>
                  <TextInput
                    style={styles.numberInput}
                    value={bidding.rate.toString()}
                    keyboardType="numeric"
                    onChangeText={(text) => handleBiddingAmount('rate', text)}
                  />
                  <TouchableOpacity
                    style={styles.adjustButton}
                    onPress={() => handleBiddingAmount('rate', bidding.rate + 0.1)}
                  >
                    <Text style={styles.adjustText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.controlGroup}>
                <Text style={styles.controlLabel}>Amount</Text>
                <View style={styles.inputGroup}>
                  <TouchableOpacity
                    style={styles.adjustButton}
                    onPress={() => handleBiddingAmount(
                      'amount',
                      bidding.amount >= 100 ? bidding.amount - 100 : 0
                    )}
                    disabled={bidding.amount === 0}
                  >
                    <Text style={styles.adjustText}>-</Text>
                  </TouchableOpacity>
                  <TextInput
                    style={styles.numberInput}
                    value={bidding.amount.toString()}
                    keyboardType="numeric"
                    onChangeText={(text) => handleBiddingAmount('amount', text)}
                  />
                  <TouchableOpacity
                    style={styles.adjustButton}
                    onPress={() => handleBiddingAmount('amount', bidding.amount + 100)}
                  >
                    <Text style={styles.adjustText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View style={styles.presetAmounts}>
              {[100, 150, 200, 300, 500, 1000].map((amount) => (
                <TouchableOpacity
                  key={amount}
                  style={[
                    styles.presetButton,
                    bidding.amount === amount && styles.selectedPreset
                  ]}
                  onPress={() => handleBiddingAmount('amount', amount)}
                >
                  <Text style={[
                    styles.presetText,
                    bidding.amount === amount && styles.selectedPresetText
                  ]}>
                    {amount}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCancel}
                disabled={placingBet}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.placeButton}
                onPress={() => handleUserBidding(index, bidding.amount, toggle.mode)}
                disabled={placingBet}
              >
                {placingBet ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.placeButtonText}>Place Bet</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    );
  };

  // Effects
  useEffect(() => {
    if (marketData?.runners?.length) {
      for (let i = 0; i < marketData.runners.length; i++) {
        arr.push(marketData.runners[i].runnerName.bal);
      }
    }
  }, [bidding.amount]);

  useEffect(() => {
    fetchMarketData();

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [marketId, userId]);

  // Loading and error states
  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6a11cb" />
        <Text style={styles.loadingText}>Loading market data...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={fetchMarketData}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!marketData) {
    return (
      <View style={styles.noDataContainer}>
        <Text style={styles.noDataText}>No market data available</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={fetchMarketData}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Main render
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      {!marketData.isActive && (
        <View style={styles.suspendedOverlay}>
          <Text style={styles.suspendedText}>MARKET SUSPENDED</Text>
        </View>
      )}

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#6a11cb']}
            tintColor="#6a11cb"
          />
        }
      >
        <View style={styles.marketInfo}>
          <Text style={styles.marketTitle}>{marketData.marketName}</Text>
          <View style={styles.timeInfo}>
            <Text style={styles.timeLabel}>Start: {formatDateTime(marketData.startTime)}</Text>
            <Text style={styles.timeLabel}>End: {formatDateTime(marketData.endTime)}</Text>
          </View>
        </View>

        {renderTimer()}

        <View style={styles.tableHeader}>
          <View style={styles.runnerColumn}>
            <Text style={styles.headerText}>Runner</Text>
          </View>
          <View style={styles.backColumn}>
            <Text style={styles.headerText}>Back</Text>
          </View>
          <View style={styles.layColumn}>
            <Text style={styles.headerText}>Lay</Text>
          </View>
        </View>

        <FlatList
          data={marketData.runners}
          renderItem={renderRunnerRow}
          keyExtractor={(item, index) => `${item.runnerName.runnerId}-${index}`}
          scrollEnabled={false}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    padding: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#6a11cb',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    color: '#666',
    fontSize: 16,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#6a11cb',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
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
  suspendedText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    padding: 20,
    backgroundColor: '#d32f2f',
    borderRadius: 5,
  },
  marketInfo: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  marketTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  timeInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeLabel: {
    fontSize: 12,
    color: '#666',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#6a11cb',
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    paddingVertical: 10,
  },
  runnerColumn: {
    flex: 3,
    paddingLeft: 12,
  },
  backColumn: {
    flex: 1,
    alignItems: 'center',
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255,255,255,0.2)',
  },
  layColumn: {
    flex: 1,
    alignItems: 'center',
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255,255,255,0.2)',
  },
  headerText: {
    color: 'white',
    fontWeight: 'bold',
  },
  runnerRow: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 12,
  },
  runnerNameContainer: {
    flex: 3,
    paddingLeft: 12,
    justifyContent: 'center',
  },
  runnerNameText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  balanceContainer: {
    flexDirection: 'row',
    marginTop: 4,
  },
  balanceText: {
    fontSize: 12,
  },
  tempBalance: {
    fontSize: 12,
    marginLeft: 4,
  },
  positiveBalance: {
    color: '#4CAF50',
    fontSize: 12,
  },
  negativeBalance: {
    color: '#F44336',
    fontSize: 12,
  },
  oddsContainer: {
    flexDirection: 'row',
    flex: 2,
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  oddButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    marginHorizontal: 4,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  backButton: {
    backgroundColor: '#87CEFA',
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },
  layButton: {
    backgroundColor: '#FFB6C1',
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
  },
  disabledButton: {
    opacity: 0.6,
  },
  oddValue: {
    fontWeight: 'bold',
    color: '#333',
    fontSize: 14,
  },
  biddingContainer: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backBidding: {
    borderLeftWidth: 4,
    borderLeftColor: '#87CEFA',
  },
  layBidding: {
    borderLeftWidth: 4,
    borderLeftColor: '#FFB6C1',
  },
  biddingControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  controlGroup: {
    flex: 1,
    marginHorizontal: 6,
  },
  controlLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    textAlign: 'center',
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  adjustButton: {
    backgroundColor: '#e0e0e0',
    padding: 8,
    borderRadius: 4,
  },
  adjustText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  numberInput: {
    flex: 1,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    marginHorizontal: 6,
    padding: 8,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  presetAmounts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  presetButton: {
    width: '30%',
    backgroundColor: '#e0e0e0',
    padding: 8,
    borderRadius: 4,
    marginBottom: 8,
    alignItems: 'center',
  },
  selectedPreset: {
    backgroundColor: '#6a11cb',
  },
  presetText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
  selectedPresetText: {
    color: 'white',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    backgroundColor: '#f44336',
    padding: 12,
    borderRadius: 4,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  placeButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 4,
    flex: 1,
    marginLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  placeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  timerIndicator: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginRight: 12,
  },
  timerContent: {
    flex: 1,
  },
  timerText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  timerStatus: {
    fontSize: 12,
    marginTop: 4,
  },
});

export default ColorGamePlayScreen;