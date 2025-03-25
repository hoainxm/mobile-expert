import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, Image, TouchableOpacity, StyleSheet, Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosClient from '../../apis/axiosClient';
import { useSelector } from 'react-redux';
import { authSelector } from '../../redux/reducers/authReducer';

interface CartItem {
  id: string;
  name: string;
  imageUrl: string;
  price: number;
  quantity: number;
}

const CartScreen: React.FC = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const authData = useSelector(authSelector); // Lấy thông tin người dùng từ Redux
  const userId = authData.id; // Lấy userId

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      const cartData = await AsyncStorage.getItem('cart');
      const parsedCart: CartItem[] = cartData ? JSON.parse(cartData) : [];
      setCart(parsedCart);
      calculateTotal(parsedCart);
    } catch (error) {
      console.error("Lỗi khi tải giỏ hàng:", error);
    }
  };

  const calculateTotal = (cartItems: CartItem[]) => {
    const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    setTotalPrice(total);
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      Alert.alert('Thông báo', 'Giỏ hàng của bạn đang trống!');
      return;
    }

    Alert.alert(
      'Chọn phương thức thanh toán',
      `Tổng tiền: ${totalPrice.toLocaleString()} đ`,
      [
        { text: 'Thanh toán COD', onPress: handleCODPayment },
        { text: 'Thanh toán Online', onPress: () => Alert.alert('Online', 'Chuyển sang thanh toán online') },
        { text: 'Hủy', style: 'cancel' }
      ]
    );
  };

  const handleCODPayment = async () => {
    if (!userId) {
      Alert.alert('Lỗi', 'Không tìm thấy thông tin người dùng.');
      return;
    }

    try {
      const orderData = {
        userId, // Thêm userId vào đơn hàng
        totalAmount: totalPrice,
        items: cart.map(item => ({
          id: item.id,
          name: item.name,
          imageUrl: item.imageUrl,
          price: item.price,
          quantity: item.quantity
        })),
        paymentMethod: 'COD'
      };

      const response = await axiosClient.post('/order/cod', orderData);

      if (response.status === 201) {
        Alert.alert('Thành công', 'Đơn hàng COD đã được đặt thành công!');
        await AsyncStorage.removeItem('cart');
        setCart([]);
        setTotalPrice(0);
      } else {
        throw new Error(response.data?.message || 'Không thể đặt hàng');
      }
    } catch (error: any) {
      console.error('Lỗi khi đặt hàng COD:', error);
      Alert.alert('Lỗi', error.response?.data?.message || error.message || 'Đã có lỗi xảy ra khi đặt hàng COD');
    }
  };

  // Hàm thay đổi số lượng
  const changeQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) return; // Không giảm số lượng dưới 1

    const updatedCart = cart.map(item =>
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    );

    setCart(updatedCart);
    calculateTotal(updatedCart);
    AsyncStorage.setItem('cart', JSON.stringify(updatedCart)); // Cập nhật giỏ hàng trong AsyncStorage
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={cart}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Image source={{ uri: item.imageUrl }} style={styles.image} />
            <View style={styles.details}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.price}>{item.price.toLocaleString()} đ</Text>
              <Text style={styles.quantity}>Số lượng: {item.quantity}</Text>
              <View style={styles.quantityControl}>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => changeQuantity(item.id, item.quantity - 1)}>
                  <Text style={styles.buttonText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.buttonText}>{item.quantity}</Text>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => changeQuantity(item.id, item.quantity + 1)}>
                  <Text style={styles.buttonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      />
      {cart.length > 0 && (
        <View style={styles.footer}>
          <Text style={styles.totalText}>Tổng tiền: {totalPrice.toLocaleString()} đ</Text>
          <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
            <Text style={styles.checkoutText}>Thanh toán</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  item: { flexDirection: 'row', marginBottom: 10, alignItems: 'center' },
  image: { width: 80, height: 80, marginRight: 10, borderRadius: 8 },
  details: { flex: 1 },
  name: { fontSize: 16, fontWeight: 'bold' },
  price: { fontSize: 14, color: 'red', marginBottom: 5 },
  quantity: { fontSize: 14, marginBottom: 5 },
  footer: { padding: 15, borderTopWidth: 1, borderColor: '#ddd', alignItems: 'center' },
  totalText: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  checkoutButton: { backgroundColor: 'green', padding: 10, borderRadius: 5 },
  checkoutText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  quantityControl: { flexDirection: 'row', alignItems: 'center' },
  button: { padding: 10, backgroundColor: '#ddd', marginHorizontal: 5, borderRadius: 5 },
  buttonText: { fontSize: 16, fontWeight: 'bold' },
});

export default CartScreen;
