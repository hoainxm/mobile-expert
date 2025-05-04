import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { appColors } from '../../constants/appColors';
import axiosClient from '../../apis/axiosClient';

const OrderDetailScreen = ({ route, navigation }) => {
  const { orderId } = route.params;
  const [order, setOrder] = useState(null);
  const [productDetails, setProductDetails] = useState([]);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await axiosClient.get(`/order/${orderId}`);
        setOrder(res);
  
        // Gọi tiếp API lấy chi tiết từng sản phẩm
        const productPromises = res.products.map(p =>
          axiosClient.get(`/products/${p.productId}`)
        );
        const productInfos = await Promise.all(productPromises);
        setProductDetails(productInfos);
      } catch (error) {
        console.error('Lỗi khi tải chi tiết đơn hàng:', error);
      }
    };
    fetchOrder();
  }, [orderId]);
  

  if (!order) return null;
  console.log('Chi tiết đơn hàng:', order); // Kiểm tra dữ liệu đơn hàng
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color={appColors.danger} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thông tin đơn mua</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={{ flex: 1 }}>
        {/* Address */}
        <View style={styles.sectionBox}>
          <Text style={styles.sectionTitle}> Địa chỉ nhận hàng</Text>
          <Text style={styles.text}>{order.address.name || "Thành"}</Text>
          <Text style={styles.text}>{order.address.phone || "0852214522"}</Text>
          <Text style={styles.text}>{order.address.address || "Chưa có địa chỉ"}</Text>
        </View>

        {/* Product */}
        <View style={styles.sectionBox}>
          <View style={styles.shopRow}>
            <Text style={styles.sectionTitle}>Shopname</Text>
            <TouchableOpacity><Text style={styles.linkText}>Xem shop</Text></TouchableOpacity>
          </View>
          {order.products.map((item, index) => {
  const product = productDetails[index];
  if (!product) return null;

  return (
    <View key={item._id} style={styles.productRow}>
      <Image source={{ uri: product.imageUrl }} style={styles.image} />
      <View style={{ flex: 1, marginLeft: 10 }}>
        <Text numberOfLines={1} style={styles.productName}>{product.name}</Text>
        <Text style={styles.text}>Phân loại: {item.variant || 'Mặc định'}</Text>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={styles.text}>x{item.quantity}</Text>
        <Text style={styles.productPrice}>đ{product.price.toLocaleString()}</Text>
      </View>
    </View>
  );
})}

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Thành tiền:</Text>
            <Text style={styles.totalValue}>đ{order.totalAmount.toLocaleString()}</Text>
          </View>
        </View>

        {/* Order Info */}
        <View style={styles.sectionBox}>
          <View style={styles.orderInfoRow}>
            <Text style={styles.orderInfoLabel}>Mã đơn hàng</Text>
            <Text style={styles.orderInfoValue}>{order._id}</Text>
          </View>
          <Text style={styles.text}>Thời gian đặt hàng</Text>
          <Text style={styles.text}>Thời gian vận chuyển</Text>
          <Text style={styles.text}>Thời gian hoàn thành</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#000' },
  sectionBox: {
    borderTopWidth: 8,
    borderColor: '#f2f2f2',
    padding: 12,
  },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 8, color: '#000' },
  text: { fontSize: 13, color: '#444', marginBottom: 4 },
  shopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  linkText: { color: appColors.danger, fontSize: 13 },
  productRow: { flexDirection: 'row', marginTop: 12, alignItems: 'center' },
  image: { width: 60, height: 60, borderRadius: 6 },
  productName: { fontWeight: 'bold', fontSize: 14, marginBottom: 2 },
  productPrice: { fontSize: 14, color: appColors.danger, fontWeight: 'bold', marginTop: 4 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  totalLabel: { fontSize: 14, fontWeight: 'bold', color: '#000' },
  totalValue: { fontSize: 14, fontWeight: 'bold', color: appColors.danger },
  orderInfoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  orderInfoLabel: { fontWeight: 'bold', fontSize: 13 },
  orderInfoValue: { fontSize: 13 },
});

export default OrderDetailScreen;