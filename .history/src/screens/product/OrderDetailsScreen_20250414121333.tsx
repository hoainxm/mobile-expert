import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    Image,
    TextInput,
    Button,
    Alert,
} from 'react-native';
import axiosClient from '../../apis/axiosClient';
import axios from 'axios';
import { useSelector } from 'react-redux';

interface OrderDetailItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    imageUrl: string;
    productId: string;
}

const OrderDetailsScreen: React.FC<{ route: any }> = ({ route }) => {
    const [order, setOrder] = useState<any>(null);
    const [rating, setRating] = useState<number>(0);
    const [comment, setComment] = useState<string>('');
    const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
    const { orderId } = route.params;

    useEffect(() => {
        fetchOrderDetails();
    }, []);

    const fetchOrderDetails = async () => {
        try {
            const response = await axiosClient.get(`/order/${orderId}`);
            console.log('Chi tiết đơn hàng:', response);
            setOrder(response);
        } catch (error) {
            console.error('Lỗi khi lấy chi tiết đơn hàng:', error);
        }
    };
    const handleAddReview = async () => {
        if (!selectedProductId) {
            Alert.alert('Lỗi', 'Vui lòng chọn sản phẩm để đánh giá.');
            return;
        }

        if (rating <= 0 || rating > 5) {
            Alert.alert('Lỗi', 'Vui lòng nhập đánh giá từ 1 đến 5 sao.');
            return;
        }

        try {
            const response = await axiosClient.post('/reviews', {
                productId: selectedProductId,
                rating,
                comment,
            });

            console.log('Đánh giá thành công:', response);
            Alert.alert('Thành công', response || 'Đánh giá thành công!');
            setRating(0);
            setComment('');
            setSelectedProductId(null);
        } catch (error: any) {
            console.error('Lỗi khi thêm đánh giá:', error.message || error);
            Alert.alert('Lỗi', error.message || 'Không thể thêm đánh giá. Vui lòng thử lại sau.');
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
                keyExtractor={(item) => item._id}
                renderItem={({ item }: { item: OrderDetailItem }) => (
                    <View style={styles.item}>
                        <Image source={{ uri: item.imageUrl }} style={styles.image} />
                        <View style={styles.details}>
                            <Text style={styles.itemName}>{item.name}</Text>
                            <Text style={styles.itemPrice}>Giá: {item.price} đ</Text>
                            <Text style={styles.itemQuantity}>Số lượng: {item.quantity}</Text>
                            <Button
                                title="Đánh giá sản phẩm"
                                onPress={() => setSelectedProductId(item._id)}
                            />
                        </View>
                    </View>
                )}
            />
            {selectedProductId && (
                <View style={styles.reviewContainer}>
                    <Text style={styles.reviewHeader}>Đánh giá sản phẩm</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Nhập số sao (1-5)"
                        keyboardType="numeric"
                        value={rating.toString()}
                        onChangeText={(text) => setRating(Number(text))}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Nhập nhận xét"
                        value={comment}
                        onChangeText={setComment}
                    />
                    <Button title="Gửi đánh giá" onPress={handleAddReview} />
                </View>
            )}
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
    reviewContainer: { marginTop: 20 },
    reviewHeader: { fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        marginBottom: 10,
    },
});

export default OrderDetailsScreen;