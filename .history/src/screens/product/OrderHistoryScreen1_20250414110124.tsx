import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import axiosClient from '../../apis/axiosClient';
import { useSelector } from 'react-redux';
import { authSelector } from '../../redux/reducers/authReducer';

interface OrderItem {
    _id: string;
    totalAmount: number;
    status: string;
    createdAt: string;
}

const OrderHistoryScreen: React.FC = () => {
    const [orders, setOrders] = useState<OrderItem[]>([]);
    const user = useSelector(authSelector);
    console.log(user);

    useEffect(() => {
        if (user.id) {
            fetchOrders();
        }
    }, [user.id]);

    const fetchOrders = async () => {
        try {
            const response = await axiosClient.get(`/order/user/${user.id}`);
            console.log('Danh sách đơn hàng:', user.id);
            setOrders(response.data);
        } catch (error) {
            console.error('Lỗi khi lấy danh sách đơn hàng:', error);
        }
    };

    const renderOrderStatus = (status: string) => {
        switch (status) {
            case 'Mới':
                return <Text style={styles.statusNew}>Mới</Text>;
            case 'Đã xác nhận':
                return <Text style={styles.statusConfirmed}>Đã xác nhận</Text>;
            case 'Đang chuẩn bị giao hàng':
                return <Text style={styles.statusPreparing}>Đang chuẩn bị giao hàng</Text>;
            case 'Đang giao hàng':
                return <Text style={styles.statusShipping}>Đang giao hàng</Text>;
            case 'Đã giao hàng':
                return <Text style={styles.statusDelivered}>Đã giao hàng</Text>;
            case 'Hủy':
                return <Text style={styles.statusCanceled}>Hủy</Text>;
            default:
                return <Text>{status}</Text>;
        }
    };

    const handleViewOrder = (orderId: string) => {
        // Điều hướng đến màn hình chi tiết đơn hàng
        // Ví dụ: navigation.navigate('OrderDetails', { orderId });
    };

    const renderOrderItem = ({ item }: { item: OrderItem }) => (
        <TouchableOpacity style={styles.orderItem} onPress={() => handleViewOrder(item._id)}>
            <View style={styles.orderDetails}>
                <Text style={styles.orderAmount}>Tổng tiền: {item.totalAmount} đ</Text>
                <Text style={styles.orderDate}>Ngày tạo: {new Date(item.createdAt).toLocaleDateString()}</Text>
                {renderOrderStatus(item.status)}
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={orders}
                keyExtractor={(item) => item._id}
                renderItem={renderOrderItem}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 10 },
    orderItem: { marginBottom: 15, padding: 10, backgroundColor: '#fff', borderRadius: 8 },
    orderDetails: { marginBottom: 10 },
    orderAmount: { fontWeight: 'bold', fontSize: 16 },
    orderDate: { color: '#777' },
    statusNew: { color: 'blue' },
    statusConfirmed: { color: 'green' },
    statusPreparing: { color: 'orange' },
    statusShipping: { color: 'purple' },
    statusDelivered: { color: 'green' },
    statusCanceled: { color: 'red' },
});

export default OrderHistoryScreen;
