import React, { useEffect, useState } from 'react';
import { View, Text, Image, ActivityIndicator, StyleSheet, Dimensions, TouchableOpacity, Alert } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosClient from '../../apis/axiosClient';
import { appColors } from '../../constants/appColors';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

// Định nghĩa kiểu dữ liệu cho navigation và route
type RootStackParamList = {
  ProductDetail: { productId: string };
  Cart: undefined; // Thêm màn hình giỏ hàng
};

type ProductDetailScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ProductDetail'>;
type ProductDetailScreenRouteProp = RouteProp<RootStackParamList, 'ProductDetail'>;

type Props = {
  navigation: ProductDetailScreenNavigationProp;
  route: ProductDetailScreenRouteProp;
};

const { width, height } = Dimensions.get('window');

const ProductDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { productId } = route.params;
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const response = await axiosClient.get(`/products/${productId}`);
        setProduct(response);
      } catch (error) {
        console.error('Lỗi tải chi tiết sản phẩm:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [productId]);

  // ✅ Hàm thêm sản phẩm vào giỏ hàng
  const addToCart = async () => {
    try {
      // Lấy danh sách sản phẩm hiện có trong giỏ hàng
      const cartData = await AsyncStorage.getItem('cart');
      let cart = cartData ? JSON.parse(cartData) : [];

      // Kiểm tra xem sản phẩm đã có trong giỏ hàng chưa
      const existingProduct = cart.find((item: any) => item.id === product.id);
      if (existingProduct) {
        existingProduct.quantity += 1;
      } else {
        cart.push({ ...product, quantity: 1 });
      }

      // Lưu lại giỏ hàng vào AsyncStorage
      await AsyncStorage.setItem('cart', JSON.stringify(cart));

      Alert.alert('Thông báo', 'Sản phẩm đã được thêm vào giỏ hàng');
    } catch (error) {
      console.error('Lỗi khi thêm vào giỏ hàng:', error);
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color={appColors.danger} style={styles.loader} />;
  }

  if (!product) {
    return <Text style={styles.errorText}>Không tìm thấy sản phẩm</Text>;
  }

  return (
    <View style={styles.container}>
      {/* Ảnh sản phẩm */}
      <Image source={{ uri: product.imageUrl }} style={styles.image} />

      {/* Thông tin sản phẩm */}
      <View style={styles.detailsContainer}>
        <Text style={styles.name}>{product.name}</Text>
        <Text style={styles.price}>{product.price.toLocaleString()} đ</Text>
      </View>

      {/* Thanh công cụ bên dưới */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.iconButton}>
          <MaterialIcons name="comment" size={24} color={appColors.dark} />
        </TouchableOpacity>

        {/* Nút Thêm vào giỏ hàng */}
        <TouchableOpacity style={styles.iconButton} onPress={addToCart}>
          <MaterialIcons name="shopping-cart" size={24} color={appColors.dark} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.buyNowButton}>
          <Text style={styles.buyNowText}>Mua Ngay</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  image: {
    width: width,
    height: height / 2,
    resizeMode: 'cover',
  },
  detailsContainer: {
    padding: 20,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  price: {
    fontSize: 18,
    color: appColors.danger,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    width: width,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    borderTopWidth: 1,
    borderColor: appColors.gray,
    backgroundColor: '#fff',
  },
  iconButton: {
    padding: 10,
  },
  buyNowButton: {
    backgroundColor: appColors.danger,
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
  },
  buyNowText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default ProductDetailScreen;
