import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  Dimensions, 
  ActivityIndicator,
  TouchableOpacity,
  Platform 
} from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import DateTimePicker from '@react-native-community/datetimepicker';
import { fetchAccountStatement } from '../services/authService.js';

const { width } = Dimensions.get('window');

const AccountStatement = () => {
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [transactions, setTransactions] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [dataType, setDataType] = useState('live'); // Changed default to 'live'
    
    // Date filter states
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [showStartDatePicker, setShowStartDatePicker] = useState(false);
    const [showEndDatePicker, setShowEndDatePicker] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    // Format date for display
    const formatDisplayDate = (date) => {
        if (!date) return 'Select date';
        return date.toLocaleDateString();
    };

    // Format date for API (YYYY-MM-DD)
    const formatAPIDate = (date) => {
        if (!date) return '';
        return date.toISOString().split('T')[0];
    };

    // Fetch account statement data
    const fetchData = async (page = 1, size = pageSize, reset = false) => {
        try {
            if (page === 1) {
                setIsLoading(true);
            } else {
                setIsLoadingMore(true);
            }
            
            const response = await fetchAccountStatement({
                page,
                pageSize: size,
                dataType,
                startDate: formatAPIDate(startDate),
                endDate: formatAPIDate(endDate)
            });
            
            if (reset) {
                setTransactions(response.data);
            } else {
                setTransactions(prev => [...prev, ...response.data]);
            }
            
            setTotalPages(response.totalPages);
            setTotalItems(response.totalItems);
            setCurrentPage(page);
            setHasMore(page < response.totalPages);
        } catch (error) {
            console.error('Error fetching account statement:', error);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
            setIsLoadingMore(false);
        }
    };

    // Initial data fetch
    useEffect(() => {
        fetchData(1, pageSize, true);
    }, [pageSize, dataType, startDate, endDate]);

    // Handle refresh
    const handleRefresh = () => {
        setIsRefreshing(true);
        fetchData(1, pageSize, true);
    };

    // Handle load more for infinite scroll
    const handleLoadMore = () => {
        if (!isLoadingMore && hasMore) {
            fetchData(currentPage + 1);
        }
    };

    // Date picker handlers
    const handleStartDateChange = (event, selectedDate) => {
        setShowStartDatePicker(Platform.OS === 'ios');
        if (selectedDate) {
            setStartDate(selectedDate);
            // Reset end date if it's before the new start date
            if (endDate && selectedDate > endDate) {
                setEndDate(null);
            }
        }
    };

    const handleEndDateChange = (event, selectedDate) => {
        setShowEndDatePicker(Platform.OS === 'ios');
        if (selectedDate) {
            setEndDate(selectedDate);
        }
    };

    // Clear date filters
    const clearDateFilters = () => {
        setStartDate(null);
        setEndDate(null);
    };

    // Format transaction amount with color
    const formatAmount = (transaction) => {
        const amount = transaction.amount || 0;
        if (transaction.transactionType === 'credit') {
            return { 
                amount: `+${amount}`, 
                color: '#4CAF50' // Green
            };
        } else {
            return { 
                amount: `-${amount}`, 
                color: '#F44336' // Red
            };
        }
    };

    const renderItem = ({ item, index }) => {
        const formattedAmount = formatAmount(item);
        const date = new Date(item.date);
        
        return (
            <View style={[
                styles.card,
                index % 2 === 0 ? styles.evenItem : styles.oddItem
            ]}>
                <View style={styles.rowBetween}>
                    <Text style={styles.label}>Date:</Text>
                    <Text style={styles.dateValue}>
                        {date.toLocaleDateString()} {date.toLocaleTimeString()}
                    </Text>
                </View>
                <View style={styles.rowBetween}>
                    <Text style={styles.label}>Amount:</Text>
                    <Text style={[styles.amountValue, { color: formattedAmount.color }]}>
                        {formattedAmount.amount}
                    </Text>
                </View>
                <View style={styles.rowBetween}>
                    <Text style={styles.label}>Balance:</Text>
                    <Text style={styles.balanceValue}>{item.currentBalance || item.balance}</Text>
                </View>
                {item.remarks && (
                    <View style={styles.rowBetween}>
                        <Text style={styles.label}>Remarks:</Text>
                        <Text style={styles.remarksValue}>{item.remarks}</Text>
                    </View>
                )}
            </View>
        );
    };

    const renderFooter = () => {
        if (isLoadingMore) {
            return (
                <View style={styles.footer}>
                    <ActivityIndicator size="small" color="#0000ff" />
                </View>
            );
        }
        return null;
    };

    return (
        <View style={styles.container}>
            <Text style={styles.heading}>Account Statement</Text>

            {/* Date Filters */}
            <View style={styles.dateFilterContainer}>
                <View style={styles.dateInputGroup}>
                    <View style={styles.dateInputContainer}>
                        <Text style={styles.dateLabel}>From:</Text>
                        <TouchableOpacity 
                            style={styles.dateInput}
                            onPress={() => setShowStartDatePicker(true)}
                        >
                            <Text style={styles.dateInputText}>{formatDisplayDate(startDate)}</Text>
                        </TouchableOpacity>
                        {showStartDatePicker && (
                            <DateTimePicker
                                value={startDate || new Date()}
                                mode="date"
                                display="default"
                                onChange={handleStartDateChange}
                                maximumDate={endDate || new Date()}
                            />
                        )}
                    </View>

                    <View style={styles.dateInputContainer}>
                        <Text style={styles.dateLabel}>To:</Text>
                        <TouchableOpacity 
                            style={styles.dateInput}
                            onPress={() => setShowEndDatePicker(true)}
                            disabled={!startDate}
                        >
                            <Text style={styles.dateInputText}>{formatDisplayDate(endDate)}</Text>
                        </TouchableOpacity>
                        {showEndDatePicker && (
                            <DateTimePicker
                                value={endDate || new Date()}
                                mode="date"
                                display="default"
                                onChange={handleEndDateChange}
                                minimumDate={startDate}
                                maximumDate={new Date()}
                            />
                        )}
                    </View>
                </View>

                {(startDate || endDate) && (
                    <TouchableOpacity 
                        style={styles.clearButton}
                        onPress={clearDateFilters}
                    >
                        <Text style={styles.clearButtonText}>Clear</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Other Filters */}
            <View style={styles.filterContainer}>
                <Dropdown
                    style={styles.dropdown}
                    data={[
                        { label: '10 items', value: 10 },
                        { label: '20 items', value: 20 },
                        { label: '50 items', value: 50 }
                    ]}
                    labelField="label"
                    valueField="value"
                    placeholder="Items per page"
                    value={pageSize}
                    onChange={item => setPageSize(item.value)}
                />
                <Dropdown
                    style={styles.dropdown}
                    data={[
                        { label: 'Live Data', value: 'live' },
                        { label: 'Backup Data', value: 'backup' }
                    ]}
                    labelField="label"
                    valueField="value"
                    placeholder="Data Type"
                    value={dataType}
                    onChange={item => setDataType(item.value)}
                />
            </View>

            {isLoading && currentPage === 1 ? (
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" />
                </View>
            ) : (
                <>
                    <Text style={styles.summaryText}>
                    {transactions.length} of {totalItems} transaction{totalItems !== 1 ? 's' : ''}
                    </Text>
                    
                    <FlatList
                        data={transactions}
                        keyExtractor={item => item.transactionId || item.id}
                        renderItem={renderItem}
                        contentContainerStyle={styles.listContent}
                        onRefresh={handleRefresh}
                        refreshing={isRefreshing}
                        onEndReached={handleLoadMore}
                        onEndReachedThreshold={0.1}
                        ListFooterComponent={renderFooter}
                        ListEmptyComponent={
                            <Text style={styles.emptyText}>
                                No transactions found for the selected filters
                            </Text>
                        }
                    />
                </>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9f9f9',
        padding: 15,
    },
    heading: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#333',
        textAlign: 'center',
    },
    dateFilterContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: 15,
    },
    dateInputGroup: {
        flex: 1,
        flexDirection: 'row',
    },
    dateInputContainer: {
        flex: 1,
        marginRight: 10,
    },
    dateLabel: {
        fontSize: 14,
        color: '#666',
        marginBottom: 5,
    },
    dateInput: {
        height: 45,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 10,
        backgroundColor: '#fff',
        justifyContent: 'center',
    },
    dateInputText: {
        fontSize: 14,
        color: '#333',
    },
    clearButton: {
        height: 45,
        backgroundColor: '#e0e0e0',
        paddingHorizontal: 15,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 10,
    },
    clearButtonText: {
        color: '#333',
        fontSize: 14,
        fontWeight: '500',
    },
    filterContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    dropdown: {
        height: 45,
        width: width * 0.43,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 10,
        backgroundColor: '#fff',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 15,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    rowBetween: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    label: {
        fontSize: 14,
        color: '#666',
    },
    value: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        maxWidth: '60%',
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    footer: {
        padding: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    summaryText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 10,
        textAlign: 'center',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 20,
        color: '#666',
    },
    listContent: {
        paddingBottom: 20,
    },
    evenItem: {
        backgroundColor: '#ffffff',
        borderLeftWidth: 4,
        borderLeftColor: '#4CAF50', // Green accent
    },
    oddItem: {
        backgroundColor: '#f9f9f9',
        borderLeftWidth: 4,
        borderLeftColor: '#2196F3', // Blue accent
    },
    card: {
        padding: 15,
        marginBottom: 10,
        borderRadius: 8,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    label: {
        fontWeight: '600',
        color: '#555',
        width: '30%',
    },
    dateValue: {
        color: '#795548', // Brown
        flex: 1,
        fontSize: 13,
    },
    amountValue: {
        fontWeight: 'bold',
        flex: 1,
        fontSize: 15,
    },
    balanceValue: {
        color: '#607D8B', // Blue grey
        fontWeight: '500',
        flex: 1,
    },
    remarksValue: {
        color: '#333',
        flex: 1,
        fontSize: 13,
        fontStyle: 'italic',
    },
});

export default AccountStatement;