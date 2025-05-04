// CartScreen.tsx
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  CheckBox,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useSelector} from 'react-redux';
import axiosClient from '../../apis/axiosClient';
import {authSelector} from '../../redux/reducers/authReducer';
import {OrderData} from '../../utils/NotificationSocket';
import CartItem from '../../components/CartItem';
import {Icon} from 'iconsax-react-native';
import {useNavigation} from '@react-navigation/native';

interface CartItemType {
  id: string;
  name: string;
  imageUrl: string;
  price: number;
  quantity: number;
  variant?: string;
}

const CartScreen: React.FC = () => {
  const [cart, setCart] = useState<CartItemType[]>([]);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const authData = useSelector(authSelector);
  const userId = authData.id;
  const userName = authData.email || 'Khách hàng';
  const navigation = useNavigation();

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      const cartData = await AsyncStorage.getItem('cart');
      const parsedCart: CartItemType[] = cartData ? JSON.parse(cartData) : [];
      setCart(parsedCart);
      calculateTotal(parsedCart, selectedItems);
    } catch (error) {
      console.error('Lỗi khi tải giỏ hàng:', error);
    }
  };

  const calculateTotal = (cartItems: CartItemType[], selectedIds: string[]) => {
    const total = cartItems
      .filter(item => selectedIds.includes(item.id))
      .reduce((sum, item) => sum + item.price * item.quantity, 0);
    setTotalPrice(total);
  };

  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      Alert.alert('Thông báo', 'Bạn chưa chọn sản phẩm nào!');
      return;
    }
    navigation.navigate('CheckoutScreen', {
      items: cart,
      totalAmount: totalPrice,
    });
  };

  const toggleSelectItem = (itemId: string) => {
    const updatedSelection = selectedItems.includes(itemId)
      ? selectedItems.filter(id => id !== itemId)
      : [...selectedItems, itemId];
    setSelectedItems(updatedSelection);
    calculateTotal(cart, updatedSelection);
  };

  const changeQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) return;
    const updatedCart = cart.map(item =>
      item.id === itemId ? {...item, quantity: newQuantity} : item,
    );
    setCart(updatedCart);
    calculateTotal(updatedCart, selectedItems);
    AsyncStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const onBack = () => {
    // Handle back navigation
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color="#000" variant="Bold" />
        </TouchableOpacity>
        <Text style={styles.title}>Giỏ hàng ({cart.length})</Text>
      </View>

      <FlatList
        data={cart}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <View style={styles.cartRow}>
            <TouchableOpacity onPress={() => toggleSelectItem(item.id)}>
              <View style={styles.checkbox}>
                <View
                  style={
                    selectedItems.includes(item.id)
                      ? styles.checkboxSelected
                      : styles.checkboxUnselected
                  }
                />
              </View>
            </TouchableOpacity>
            <CartItem
              name={item.name}
              price={item.price}
              imageUrl={item.imageUrl}
              quantity={item.quantity}
              variantOptions={['nhỏ', 'vừa', 'lớn']}
              onQuantityChange={qty => changeQuantity(item.id, qty)}
            />
          </View>
        )}
      />

      {selectedItems.length > 0 && (
        <View style={styles.footer}>
          <Text style={styles.totalText}>
            Tổng giá: {totalPrice.toLocaleString()} đ
          </Text>
          <TouchableOpacity
            style={styles.checkoutButton}
            onPress={handleCheckout}>
            <Text style={styles.checkoutText}>Mua ngay</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f8f8f8', marginTop: 30},
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderTopWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#f2f2f2',
    paddingVertical: 12,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  backButton: {
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  totalText: {fontSize: 16, fontWeight: 'bold', color: 'red'},
  checkoutButton: {backgroundColor: 'red', padding: 10, borderRadius: 5},
  checkoutText: {color: '#fff', fontSize: 16, fontWeight: 'bold'},
  cartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginVertical: 4,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 1,
    borderColor: '#ccc',
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    width: 16,
    height: 16,
    backgroundColor: 'red',
  },
  checkboxUnselected: {
    width: 16,
    height: 16,
    backgroundColor: '#fff',
  },
});

export default CartScreen;
