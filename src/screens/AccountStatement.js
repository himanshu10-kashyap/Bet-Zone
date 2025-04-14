import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  ActivityIndicator,
  TouchableOpacity,
  Platform,
  ScrollView,
  Alert
} from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import DateTimePicker from '@react-native-community/datetimepicker';
import { fetchAccountStatement } from '../services/authService.js';

const AccountStatement = () => {
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [transactions, setTransactions] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [dataType, setDataType] = useState('live');
    const [isFocus, setIsFocus] = useState(false);
    
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
            Alert.alert('Error', 'Failed to fetch account statement');
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
    const formatAmount = (amount, type) => {
        const numericValue = parseFloat(amount || 0);
        if (type === 'credit') {
            return { 
                amount: `+${numericValue.toFixed(2)}`, 
                color: '#28a745' // Green
            };
        } else {
            return { 
                amount: `-${numericValue.toFixed(2)}`, 
                color: '#dc3545' // Red
            };
        }
    };

    const renderItem = ({ item, index }) => {
        const formattedAmount = formatAmount(item.amount, item.transactionType);
        const date = new Date(item.date);
        
        return (
            <View style={[
                styles.itemContainer,
                index % 2 === 0 ? styles.evenItem : styles.oddItem
            ]}>
                <View style={styles.row}>
                    <Text style={styles.label}>Date:</Text>
                    <Text style={styles.value}>
                        {date.toLocaleDateString()} {date.toLocaleTimeString()}
                    </Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Amount:</Text>
                    <Text style={[styles.value, { color: formattedAmount.color }]}>
                        {formattedAmount.amount}
                    </Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Balance:</Text>
                    <Text style={styles.value}>{item.currentBalance || item.balance}</Text>
                </View>
                {item.remarks && (
                    <View style={styles.row}>
                        <Text style={styles.label}>Remarks:</Text>
                        <Text style={styles.value}>{item.remarks}</Text>
                    </View>
                )}
                <View style={styles.separator} />
            </View>
        );
    };

    const renderFooter = () => {
        if (isLoadingMore) {
            return (
                <View style={styles.footer}>
                    <ActivityIndicator size="small" color="#6a11cb" />
                </View>
            );
        }
        return null;
    };

    if (isLoading && currentPage === 1) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#6a11cb" />
            </View>
        );
    }

    return (
        <View style={styles.mainContainer}>
            {/* Data Source Dropdown */}
            <View style={styles.inputContainer}>
                <Text style={styles.label}>Data Source</Text>
                <Dropdown
                    style={[styles.dropdown, isFocus && { borderColor: '#6a11cb' }]}
                    placeholderStyle={styles.placeholderStyle}
                    selectedTextStyle={styles.selectedTextStyle}
                    data={[
                        { label: 'Live Data', value: 'live' },
                        { label: 'Backup Data', value: 'backup' },
                        { label: 'Old Data', value: 'olddata' },
                    ]}
                    labelField="label"
                    valueField="value"
                    value={dataType}
                    onFocus={() => setIsFocus(true)}
                    onBlur={() => setIsFocus(false)}
                    onChange={item => {
                        setDataType(item.value);
                        setIsFocus(false);
                    }}
                />
            </View>

            {/* Items Per Page Dropdown */}
            <View style={styles.inputContainer}>
                <Text style={styles.label}>Items Per Page</Text>
                <Dropdown
                    style={[styles.dropdown, isFocus && { borderColor: '#6a11cb' }]}
                    placeholderStyle={styles.placeholderStyle}
                    selectedTextStyle={styles.selectedTextStyle}
                    data={[
                        { label: '10 items', value: 10 },
                        { label: '20 items', value: 20 },
                        { label: '50 items', value: 50 }
                    ]}
                    labelField="label"
                    valueField="value"
                    value={pageSize}
                    onFocus={() => setIsFocus(true)}
                    onBlur={() => setIsFocus(false)}
                    onChange={item => {
                        setPageSize(item.value);
                        setIsFocus(false);
                    }}
                />
            </View>

            {/* From and To Date Pickers */}
            <View style={styles.dateContainer}>
                <View style={styles.datePicker}>
                    <Text style={styles.label}>From Date</Text>
                    <TouchableOpacity 
                        style={styles.dateInput} 
                        onPress={() => setShowStartDatePicker(true)}
                    >
                        <Text style={styles.dateText}>
                            {startDate ? startDate.toDateString() : 'Select From Date'}
                        </Text>
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

                <View style={styles.datePicker}>
                    <Text style={styles.label}>To Date</Text>
                    <TouchableOpacity 
                        style={styles.dateInput} 
                        onPress={() => setShowEndDatePicker(true)}
                        disabled={!startDate}
                    >
                        <Text style={styles.dateText}>
                            {endDate ? endDate.toDateString() : 'Select To Date'}
                        </Text>
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

            {/* Clear Button */}
            {(startDate || endDate) && (
                <TouchableOpacity 
                    style={styles.clearButton} 
                    onPress={clearDateFilters}
                >
                    <Text style={styles.clearButtonText}>CLEAR DATES</Text>
                </TouchableOpacity>
            )}

            {/* Get Statement Button */}
            <TouchableOpacity 
                style={styles.button} 
                onPress={() => fetchData(1, pageSize, true)}
                disabled={isLoading}
            >
                {isLoading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.buttonText}>GENERATE STATEMENT</Text>
                )}
            </TouchableOpacity>

            {/* Summary Text */}
            <Text style={styles.summaryText}>
                Showing {transactions.length} of {totalItems} transaction{totalItems !== 1 ? 's' : ''}
            </Text>

            {/* Display Transactions */}
            <ScrollView 
                style={styles.scrollContainer}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {transactions.length > 0 ? (
                    <FlatList
                        data={transactions}
                        renderItem={renderItem}
                        keyExtractor={(item, index) => index.toString()}
                        scrollEnabled={false}
                        contentContainerStyle={styles.listContainer}
                        onEndReached={handleLoadMore}
                        onEndReachedThreshold={0.1}
                        ListFooterComponent={renderFooter}
                    />
                ) : (
                    <View style={styles.noDataContainer}>
                        <Text style={styles.noData}>No transactions found</Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: '#f8f9fa',
        paddingTop: 15,
        paddingHorizontal: 15,
    },
    scrollContainer: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 30,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
    },
    inputContainer: {
        marginBottom: 15,
    },
    label: {
        fontSize: 14,
        marginBottom: 5,
        color: '#555',
        fontWeight: '500',
    },
    dropdown: {
        height: 45,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 6,
        paddingHorizontal: 12,
        backgroundColor: 'white',
    },
    placeholderStyle: {
        fontSize: 14,
        color: '#999',
    },
    selectedTextStyle: {
        fontSize: 14,
        color: '#333',
    },
    dateContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    datePicker: {
        flex: 1,
        marginRight: 8,
    },
    dateInput: {
        height: 45,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 6,
        paddingHorizontal: 12,
        justifyContent: 'center',
        backgroundColor: 'white',
    },
    dateText: {
        fontSize: 14,
        color: '#333',
    },
    clearButton: {
        backgroundColor: '#e0e0e0',
        padding: 12,
        alignItems: 'center',
        borderRadius: 6,
        marginBottom: 15,
    },
    clearButtonText: {
        color: '#333',
        fontSize: 14,
        fontWeight: 'bold',
    },
    button: {
        backgroundColor: '#6a11cb',
        padding: 12,
        alignItems: 'center',
        borderRadius: 6,
        marginBottom: 15,
    },
    buttonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    summaryText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 15,
        textAlign: 'center',
    },
    itemContainer: {
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
    evenItem: {
        backgroundColor: '#ffffff',
        borderLeftWidth: 4,
        borderLeftColor: '#4CAF50',
    },
    oddItem: {
        backgroundColor: '#f9f9f9',
        borderLeftWidth: 4,
        borderLeftColor: '#2196F3',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
        alignItems: 'center',
    },
    value: {
        fontSize: 15,
        color: '#2c3e50',
        flex: 2,
        textAlign: 'right',
        fontWeight: '500',
    },
    separator: {
        height: 1,
        backgroundColor: '#e0e0e0',
        marginTop: 15,
        marginBottom: 5,
    },
    noDataContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 50,
    },
    noData: {
        textAlign: 'center',
        color: '#95a5a6',
        fontSize: 17,
        fontWeight: '500',
    },
    listContainer: {
        paddingTop: 15,
    },
    footer: {
        padding: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default AccountStatement;