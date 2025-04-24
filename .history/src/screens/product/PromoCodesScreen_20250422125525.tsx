import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Alert } from 'react-native';
import axiosClient from '../../apis/axiosClient';
import { appColors } from '../../constants/appColors';
import { useSelector } from 'react-redux';

const PromoCodesScreen: React.FC = () => {
    const [promoCodes, setPromoCodes] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const userId = useSelector((state: any) => state.authReducer.authData.id);
    useEffect(() => {
        const fetchPromoCodes = async () => {
            try {
                const response = await axiosClient.get(`/discount/userid/${userId}`);
                console.log('Danh sách mã khuyến mãi:', response);

                if (response.success == true) {
                    setPromoCodes(response.discounts); // Lấy danh sách mã khuyến mãi từ `response.discounts`
                } else {
                    Alert.alert('Lỗi', 'Không thể lấy danh sách mã khuyến mãi!');
                }
            } catch (error) {
                console.error('❌ Lỗi khi lấy mã khuyến mãi:', error);
                Alert.alert('Lỗi', 'Không thể lấy danh sách mã khuyến mãi!');
            } finally {
                setLoading(false);
            }
        };

        fetchPromoCodes();
    }, []);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <Text>Đang tải...</Text>
            </View>
        );
    }

    if (promoCodes.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Text>Không có mã khuyến mãi nào.</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Danh sách mã khuyến mãi</Text>
            <FlatList
                data={promoCodes}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => (
                    <View style={styles.promoCodeCard}>
                        <Text style={styles.promoCodeText}>Mã: {item.code}</Text>
                        <Text>Giảm giá: {item.discountPercentage}%</Text>
                        <Text>Hạn sử dụng: {new Date(item.expiresAt).toLocaleDateString()}</Text>
                        <Text>Đã sử dụng: {item.isUsed ? 'Có' : 'Không'}</Text>
                    </View>
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#fff' },
    title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    promoCodeCard: {
        padding: 15,
        marginBottom: 10,
        borderRadius: 10,
        backgroundColor: appColors.danger,
    },
    promoCodeText: { fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
});

export default PromoCodesScreen;