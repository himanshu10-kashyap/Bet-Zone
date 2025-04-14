import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator, 
  TouchableOpacity, 
  Animated,
  RefreshControl
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { fetchUserActivityLog } from '../services/authService.js';

const UserActivityLogScreen = () => {
  const [activityLog, setActivityLog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const [refreshing, setRefreshing] = useState(false);

  const loadActivityLog = async () => {
    try {
      const response = await fetchUserActivityLog();
      setActivityLog(response.data);
      setError(null);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadActivityLog();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadActivityLog();
  };

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#6a11cb" />
        <Text style={styles.loadingText}>Loading your activity...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.center]}>
        <Icon name="error-outline" size={50} color="#ff4757" />
        <Text style={styles.errorText}>Error: {error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <LinearGradient 
      colors={['#f5f7fa', '#e4e8f0']} 
      style={styles.container}
      start={{x: 0, y: 0}} 
      end={{x: 1, y: 1}}
    >
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
        <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
          <View style={styles.cardHeader}>
            <View style={styles.headerIcon}>
              <Icon name="history" size={24} color="#fff" />
            </View>
            <Text style={styles.title}>Login Activity</Text>
          </View>
          
          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <View style={styles.iconContainer}>
                <Icon name="access-time" size={20} color="#6a11cb" />
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.label}>Date & Time</Text>
                <Text style={styles.value}>
                  {new Date(activityLog.loginDateTime).toLocaleString()}
                </Text>
              </View>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.infoRow}>
              <View style={styles.iconContainer}>
                <Icon name="check-circle" size={20} color="#4CAF50" />
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.label}>Status</Text>
                <Text style={[styles.value, styles.statusSuccess]}>
                  {activityLog.loginStatus}
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>

        <Animated.View style={[styles.card, { opacity: fadeAnim, marginTop: 20 }]}>
          <View style={styles.cardHeader}>
            <View style={styles.headerIcon}>
              <Icon name="network-check" size={24} color="#fff" />
            </View>
            <Text style={styles.title}>IP Information</Text>
          </View>
          
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Icon name="language" size={22} color="#6a11cb" style={styles.gridIcon} />
              <Text style={styles.gridLabel}>IP Address</Text>
              <Text style={styles.gridValue}>{activityLog.ip?.iP || 'N/A'}</Text>
            </View>
            
            <View style={styles.infoItem}>
              <Icon name="public" size={22} color="#6a11cb" style={styles.gridIcon} />
              <Text style={styles.gridLabel}>Country</Text>
              <Text style={styles.gridValue}>{activityLog.ip?.country || 'N/A'}</Text>
            </View>
            
            <View style={styles.infoItem}>
              <Icon name="location-city" size={22} color="#6a11cb" style={styles.gridIcon} />
              <Text style={styles.gridLabel}>Region</Text>
              <Text style={styles.gridValue}>{activityLog.ip?.region || 'N/A'}</Text>
            </View>
            
            <View style={styles.infoItem}>
              <Icon name="schedule" size={22} color="#6a11cb" style={styles.gridIcon} />
              <Text style={styles.gridLabel}>Timezone</Text>
              <Text style={styles.gridValue}>{activityLog.ip?.timezone || 'N/A'}</Text>
            </View>
            
            <View style={styles.infoItem}>
              <Icon name="business" size={22} color="#6a11cb" style={styles.gridIcon} />
              <Text style={styles.gridLabel}>ISP</Text>
              <Text style={styles.gridValue}>{activityLog.ip?.isp || 'N/A'}</Text>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 30,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#6a11cb',
    marginTop: 16,
    fontSize: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6a11cb',
    padding: 16,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  headerIcon: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  infoContainer: {
    padding: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    backgroundColor: 'rgba(106, 17, 203, 0.1)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  textContainer: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  statusSuccess: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 8,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
  },
  infoItem: {
    width: '50%',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  gridIcon: {
    marginBottom: 8,
  },
  gridLabel: {
    fontSize: 12,
    color: '#6a11cb',
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  gridValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  errorText: {
    color: '#ff4757',
    fontSize: 16,
    textAlign: 'center',
    padding: 20,
    maxWidth: '80%',
  },
  retryButton: {
    backgroundColor: '#6a11cb',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 15,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default UserActivityLogScreen;