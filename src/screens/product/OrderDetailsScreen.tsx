import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Image } from 'react-native';
import axiosClient from '../../apis/axiosClient';

interface OrderDetailItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    imageUrl: string;
}

const OrderDetailsScreen: React.FC<{ route: any }> = ({ route }) => {
    const [order, setOrder] = useState<any>(null);
    const { orderId } = route.params;

    useEffect(() => {
        fetchOrderDetails();
    }, []);

    const fetchOrderDetails = async () => {
        try {
            const response = await axiosClient.get(`/order/${orderId}`);
            setOrder(response.data);
        } catch (error) {
            console.error('Lỗi khi lấy chi tiết đơn hàng:', error);
        }
    };

    if (!order) {
        return <Text>Loading...</Text>;
    }

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Chi tiết đơn hàng</Text>
            <Text style={styles.status}>Trạng thái: {order.status}</Text>
            <FlatList
                data={order.items}
                keyExtractor={(item) => item.id}
                renderItem={({ item }: { item: OrderDetailItem }) => (
                    <View style={styles.item}>
                        <Image source={{ uri: item.imageUrl }} style={styles.image} />
                        <View style={styles.details}>
                            <Text style={styles.itemName}>{item.name}</Text>
                            <Text style={styles.itemPrice}>Giá: {item.price} đ</Text>
                            <Text style={styles.itemQuantity}>Số lượng: {item.quantity}</Text>
                        </View>
                    </View>
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 15 },
    header: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
    status: { fontSize: 16, marginBottom: 10 },
    item: { flexDirection: 'row', marginBottom: 10, alignItems: 'center' },
    image: { width: 80, height: 80, marginRight: 10, borderRadius: 8 },
    details: { flex: 1 },
    itemName: { fontSize: 16, fontWeight: 'bold' },
    itemPrice: { fontSize: 14, color: 'red', marginBottom: 5 },
    itemQuantity: { fontSize: 14 },
});

export default OrderDetailsScreen;
