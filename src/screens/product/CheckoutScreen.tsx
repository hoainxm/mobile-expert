// CheckoutScreen.tsx
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import {useRoute} from '@react-navigation/native';
import {useNavigation} from '@react-navigation/native';

import {Icon} from 'iconsax-react-native';
import axiosClient from '../../apis/axiosClient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useSelector} from 'react-redux';
import {authSelector} from '../../redux/reducers/authReducer';
import socketManager, {OrderData} from '../../utils/NotificationSocket';

const CheckoutScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const authData = useSelector(authSelector);

  const {items, totalAmount} = route.params as {
    items: any[];
    totalAmount: number;
  };

  const [voucher, setVoucher] = useState('');
  const [applied, setApplied] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [selectAll, setSelectAll] = useState(true);
  const [userdata, setUserData] = useState<any>([]);

  const finalTotal = totalAmount * (1 - discount / 100);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await axiosClient.get('/users/get-profile');
        console.log('User data:', userData.data.phone);
        setUserData(userData.data);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    fetchUserData();
  }, []);

  const applyPromoCode = async () => {
    try {
      const res = await axiosClient.post('/discount/apply', {
        code: voucher,
        userId: authData.id,
      });

      if (res.success) {
        setDiscount(res.discountPercentage);
        setApplied(true);
        Alert.alert('Thành công', `Đã áp dụng mã ${voucher}`);
      } else {
        Alert.alert('Thất bại', 'Mã không hợp lệ hoặc đã hết hạn.');
      }
    } catch (err) {
      console.error('Error applying promo code:', err);
      Alert.alert('Lỗi', 'Không thể kiểm tra mã giảm giá.');
    }
  };

  const handleCODPayment = async () => {
    if (!authData.id) {
      Alert.alert('Lỗi', 'Không tìm thấy thông tin người dùng.');
      return;
    }

    try {
      const orderData = {
        userId: authData.id,
        totalAmount: finalTotal,
        items,
        paymentMethod: 'COD',
        address: {
          name: userdata?.name,
          phone: userdata?.phone,
          address: userdata?.address,
        },
      };

      const response = await axiosClient.post('/order/cod', orderData);
      if (response?.data) {
        Alert.alert('Thành công', 'Đơn hàng COD đã được đặt thành công!');

        const notificationPayload: OrderData = {
          customerName: authData.email,
          type: 'order',
          totalAmount: finalTotal,
          quantity: items.length,
        };
        socketManager.emitNewOrder(notificationPayload);

        // Xóa các sản phẩm đã thanh toán khỏi giỏ hàng
        const existingCart = await AsyncStorage.getItem('cart');
        const parsedCart = existingCart ? JSON.parse(existingCart) : [];

        const paidItemIds = new Set(items.map(item => item.id));
        const updatedCart = parsedCart.filter(
          cartItem => !paidItemIds.has(cartItem.id),
        );

        await AsyncStorage.setItem('cart', JSON.stringify(updatedCart));
        navigation.navigate('Home');
      } else {
        throw new Error(response.data?.message || 'Không thể đặt hàng');
      }
    } catch (error: any) {
      console.error('Lỗi khi đặt hàng COD:', error);
      Alert.alert(
        'Lỗi',
        error.response?.data?.message ||
          error.message ||
          'Lỗi khi đặt hàng COD',
      );
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color="#000" variant="Bold" />
        </TouchableOpacity>
        <Text style={styles.title}>Thanh toán</Text>
        <View style={{width: 24}} />
      </View>

      {/* Address Section */}
      <View style={styles.sectionContainer}>
        <View style={styles.addressRow}>
          <Icon
            name="location"
            size={20}
            color="#F44336"
            variant="Bold"
            style={{marginRight: 8}}
          />
          <Text style={styles.sectionTitle}>Địa chỉ nhận hàng</Text>
        </View>
        <TouchableOpacity style={styles.addressBox}>
          <View style={styles.addressInfo}>
            <Text style={styles.name}>{userdata?.name}</Text>
            <Text style={styles.phone}>{userdata?.phone}</Text>
            <Text style={styles.address}>{userdata?.address}</Text>
          </View>
          <Icon name="arrow-right" size={18} color="#999" variant="Outline" />
        </TouchableOpacity>
      </View>

      {/* Voucher Section */}
      <View style={styles.voucherContainer}>
        <TextInput
          style={styles.voucherInput}
          placeholder="Nhập mã giảm giá"
          value={voucher}
          onChangeText={setVoucher}
        />
        <TouchableOpacity style={styles.voucherButton} onPress={applyPromoCode}>
          <Text style={styles.voucherButtonText}>
            {applied ? 'Đã áp dụng' : 'Áp dụng'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Footer Checkout */}
      <View style={styles.checkoutBar}>
        <TouchableOpacity
          style={styles.checkboxRow}
          onPress={() => setSelectAll(!selectAll)}>
          <CheckBox
            value={selectAll}
            onValueChange={setSelectAll}
            tintColors={{true: '#F44336', false: '#ccc'}}
          />
          <Text style={styles.checkAllText}>Chọn tất cả</Text>
        </TouchableOpacity>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Tổng giá</Text>
          <Text style={styles.totalPrice}>đ{finalTotal.toLocaleString()}</Text>
        </View>
        <TouchableOpacity
          style={styles.buyNowButton}
          onPress={handleCODPayment}>
          <Text style={styles.buyNowText}>Mua ngay</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff'},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  backButton: {marginRight: 8},
  title: {fontSize: 18, fontWeight: 'bold', color: '#000'},
  sectionContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 10,
    borderColor: '#f3f3f3',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
  },
  addressBox: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addressInfo: {
    flex: 1,
    marginRight: 10,
  },
  name: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 4,
  },
  phone: {
    fontSize: 13,
    marginBottom: 4,
    color: '#555',
  },
  address: {
    fontSize: 13,
    color: '#666',
  },
  voucherContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 20,
    paddingHorizontal: 10,
  },
  voucherInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 40,
  },
  voucherButton: {
    backgroundColor: '#F44336',
    marginLeft: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
  },
  voucherButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  checkoutBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#eee',
    padding: 10,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  checkAllText: {
    marginLeft: 4,
    fontSize: 13,
  },
  totalContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  totalLabel: {
    fontSize: 13,
    color: '#666',
  },
  totalPrice: {
    fontWeight: 'bold',
    color: '#F44336',
    fontSize: 16,
  },
  buyNowButton: {
    backgroundColor: '#F44336',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
    marginLeft: 10,
  },
  buyNowText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default CheckoutScreen;
