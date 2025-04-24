import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    Image,
    TouchableOpacity,
    StyleSheet,
    Alert,
} from 'react-native';
import axiosClient from '../../apis/axiosClient';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';

const OrderHistoryScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const userId = useSelector((state: RootState) => state.authReducer.authData.id);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await axiosClient.get(`/orders/${userId}`);
                setOrders(response.data);
            } catch (error) {
                console.error('Lỗi khi lấy danh sách đơn hàng:', error.response?.data || error.message);
                Alert.alert('Lỗi', 'Không thể tải danh sách đơn hàng. Vui lòng thử lại sau.');
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [userId]);

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.orderCard}
            onPress={() => navigation.navigate('OrderDetail', { orderId: item._id })}
        >
            <Text style={styles.orderId}>Mã đơn hàng: {item._id}</Text>
            <Text style={styles.orderTotal}>Tổng tiền: {item.totalAmount.toLocaleString()} đ</Text>
            <Text style={styles.orderStatus}>Trạng thái: {item.status}</Text>
            <FlatList
                data={item.items}
                renderItem={({ item }: { item: any }) => (
                    <View style={styles.productCard}>
                        <Image source={{ uri: item.productId.image }} style={styles.productImage} />
                        <Text style={styles.productName}>{item.productId.name}</Text>
                        <Text style={styles.productQuantity}>Số lượng: {item.quantity}</Text>
                    </View>
                )}
                keyExtractor={(item) => item.productId._id}
                horizontal
                showsHorizontalScrollIndicator={false}
            />
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Lịch sử đơn hàng</Text>
            {loading ? (
                <Text>Đang tải...</Text>
            ) : orders.length > 0 ? (
                <FlatList
                    data={orders}
                    renderItem={renderItem}
                    keyExtractor={(item) => item._id}
                    showsVerticalScrollIndicator={false}
                />
            ) : (
                <Text style={styles.emptyText}>Bạn chưa có đơn hàng nào.</Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    orderCard: {
        marginBottom: 20,
        padding: 15,
        borderRadius: 10,
        backgroundColor: '#f9f9f9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    orderId: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    orderTotal: {
        fontSize: 14,
        color: '#f00',
        marginBottom: 5,
    },
    orderStatus: {
        fontSize: 14,
        color: '#555',
        marginBottom: 10,
    },
    productCard: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 10,
    },
    productImage: {
        width: 50,
        height: 50,
        borderRadius: 5,
        marginRight: 10,
    },
    productName: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    productQuantity: {
        fontSize: 12,
        color: '#555',
    },
    emptyText: {
        fontSize: 16,
        color: '#888',
        textAlign: 'center',
        marginTop: 20,
    },
});

export default OrderHistoryScreen;