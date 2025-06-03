import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { fetchAllGameData } from '../services/authService.js';
import strings from '../utilities/stringConstant.js';
import { useAppContext } from '../redux/context.js';

const ColorGameMarketsScreen = () => {
    const navigation = useNavigation();
    const [markets, setMarkets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const { store, dispatch } = useAppContext();

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await fetchAllGameData();
            console.log('responseMarketeeee', response);
            dispatch({
                type: 'UPDATE_PLACE_BIDDING',
                payload: { gameId: response.data[0].gameId }
            });
            if (response.success && response.data) {
                // Filter to only show COLORGAME markets
                const colorGame = response.data.find(game => game.gameName === "COLORGAME");
                if (colorGame) {
                    setMarkets(colorGame.markets || []);
                } else {
                    setMarkets([]);
                }
            } else {
                setError(response.message || 'Failed to load data');
            }
        } catch (err) {
            console.error('Fetch error:', err);
            setError(err.message || 'An error occurred');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    console.log('markets:markets', markets);

    useEffect(() => {
        fetchData();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleString();
    };

    const handleMarketPress = (market) => {
        navigation.navigate('ColorGamePlayScreen', {
            gameId: markets.gameId,
            marketId: market.marketId,
            marketName: market.marketName
        });
        dispatch({
            type: 'UPDATE_PLACE_BIDDING',
            payload: { marketId: market.marketId }
        });
    };

    const renderMarketItem = ({ item }) => {
        const statusColor = item.isActive ? '#4CAF50' : '#F44336';
        const statusText = item.isActive ? 'ACTIVE' : 'INACTIVE';

        return (
            <TouchableOpacity
                style={[
                    styles.marketCard,
                    item.isActive ? styles.activeMarket : styles.inactiveMarket
                ]}
                onPress={() => handleMarketPress(item)}
            >
                <View style={styles.marketHeader}>
                    <Text style={styles.marketName}>{item.marketName}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
                        <Text style={styles.statusText}>{statusText}</Text>
                    </View>
                </View>

                <View style={styles.detailsContainer}>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Start Time:</Text>
                        <Text style={styles.detailValue}>{formatDateTime(item.startTime)}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>End Time:</Text>
                        <Text style={styles.detailValue}>{formatDateTime(item.endTime)}</Text>
                    </View>
                </View>

                <View style={styles.runnersContainer}>
                    {item.runners?.map((runner, index) => (
                        <View key={index} style={styles.runnerRow}>
                            <Text style={styles.runnerName}>{runner.runnerName}</Text>
                            <View style={styles.oddsContainer}>
                                <View style={[styles.oddButton, styles.backButton]}>
                                    <Text style={styles.oddText}>{runner.rate?.[0]?.back || 'N/A'}</Text>
                                </View>
                                <View style={[styles.oddButton, styles.layButton]}>
                                    <Text style={styles.oddText}>{runner.rate?.[0]?.lay || 'N/A'}</Text>
                                </View>
                            </View>
                        </View>
                    ))}
                </View>
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#6a11cb" />
                <Text style={styles.loadingText}>Loading markets...</Text>
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

    if (markets.length === 0) {
        return (
            <View style={styles.noDataContainer}>
                <Text style={styles.noDataText}>No Color Game markets available</Text>
            </View>
        );
    }

    return (
        <View style={styles.mainContainer}>
            <FlatList
                data={markets}
                renderItem={renderMarketItem}
                keyExtractor={(item) => item.marketId}
                contentContainerStyle={styles.listContainer}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#6a11cb']}
                        tintColor="#6a11cb"
                    />
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: '#f8f9fa',
        paddingTop: 15,
    },
    header: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#2c3e50',
        marginBottom: 15,
    },
    listContainer: {
        paddingHorizontal: 15,
        paddingBottom: 30,
    },
    marketCard: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 18,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    activeMarket: {
        borderLeftWidth: 4,
        borderLeftColor: '#4CAF50',
    },
    inactiveMarket: {
        borderLeftWidth: 4,
        borderLeftColor: '#F44336',
    },
    marketHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    marketName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#2c3e50',
        flex: 1,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: 'flex-start',
    },
    statusText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 12,
        textTransform: 'uppercase',
    },
    detailsContainer: {
        marginTop: 10,
        marginBottom: 15,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    detailLabel: {
        fontSize: 14,
        color: '#7f8c8d',
        fontWeight: '500',
    },
    detailValue: {
        fontSize: 14,
        color: '#2c3e50',
        fontWeight: '600',
    },
    runnersContainer: {
        marginTop: 10,
    },
    runnerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 5,
    },
    runnerName: {
        fontSize: 15,
        color: '#444',
        flex: 1,
    },
    oddsContainer: {
        flexDirection: 'row',
        width: 120,
    },
    oddButton: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 4,
        marginLeft: 8,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 50,
    },
    backButton: {
        backgroundColor: '#87CEFA',
    },
    layButton: {
        backgroundColor: '#FFB6C1',
    },
    oddText: {
        color: '#333',
        fontWeight: 'bold',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
    },
    loadingText: {
        marginTop: 10,
        color: '#7f8c8d',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
    },
    errorText: {
        color: '#C62828',
        fontSize: 16,
        textAlign: 'center',
        padding: 20,
        fontWeight: '500',
    },
    noDataContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
    },
    noDataText: {
        textAlign: 'center',
        color: '#95a5a6',
        fontSize: 17,
        fontWeight: '500',
    },
});

export default ColorGameMarketsScreen;