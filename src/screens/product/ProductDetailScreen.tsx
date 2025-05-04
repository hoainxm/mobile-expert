import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  Image,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  TextInput,
  FlatList,
  Alert,
  ScrollView,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {useSelector} from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {appColors} from '../../constants/appColors';
import axiosClient from '../../apis/axiosClient';
import socketManager, {OrderData} from '../../utils/NotificationSocket';

const {width} = Dimensions.get('window');

const ProductDetailScreen = ({route, navigation}) => {
  const {productId} = route.params;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [commentContent, setCommentContent] = useState('');
  const [similarProducts, setSimilarProducts] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [userData, setUserData] = useState(null);
  const user_email = useSelector(state => state.authReducer.authData.email);
  const user_id = useSelector(state => state.authReducer.authData.id);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false); // New state to prevent multiple calls

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productRes, similarRes, commentsRes] = await Promise.all([
          axiosClient.get(`/products/${productId}`),
          axiosClient.get(`/products/similar/${productId}`),
          axiosClient.get(`/comments/${productId}`),
        ]);
        setProduct(productRes);
        setSimilarProducts(similarRes);
        setComments(commentsRes);
      } catch (err) {
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [productId]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await axiosClient.get('/users/get-profile');
        if (userData) {
          setUserData(userData);
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
      }
    };
    fetchUser();
  }, [user_id]);

  const placeOrder = async () => {
    if (isPlacingOrder) return; // Prevent multiple calls
    setIsPlacingOrder(true); // Set placing order state

    try {
      const total = product.price * quantity;
      const res = await axiosClient.post('/order/cod', {
        userId: user_id,
        totalAmount: total,
        items: [{productId: product._id, quantity}],
        paymentMethod: 'COD',
        address: {
          name: user_email,
          phone: userData?.phone || '0852214522',
          address: userData?.address || 'Chưa có địa chỉ',
        },
      });
      const notificationPayload: OrderData = {
        customerName: userData?.name || user_email,
        type: 'order',
        totalAmount: total,
        quantity: 1,
      };
      socketManager.emitNewOrder(notificationPayload);

      if (res?.orderId) {
        Alert.alert('Thành công', 'Đơn hàng đã được đặt!', [
          {text: 'OK', onPress: () => navigation.navigate('OrderHistory')},
        ]);
      } else {
        Alert.alert('Lỗi', 'Không thể đặt hàng.');
      }
    } catch {
      Alert.alert('Lỗi', 'Lỗi trong quá trình đặt hàng.');
    } finally {
      setIsPlacingOrder(false); // Reset placing order state
    }
  };

  const addComment = async () => {
    if (!commentContent.trim()) {
      return Alert.alert('Lỗi', 'Bình luận không được để trống');
    }
    try {
      const res = await axiosClient.post(`/comments/${productId}`, {
        userName: user_email,
        content: commentContent,
      });
      setComments([res, ...comments]);
      setCommentContent('');
      setShowCommentInput(false);
    } catch (err) {
      console.error('Error adding comment:', err);
    }
  };

  const addToCart = async () => {
    try {
      const cartData = await AsyncStorage.getItem('cart');
      const cart = cartData ? JSON.parse(cartData) : [];
      const existing = cart.findIndex(item => item.id === product._id);
      if (existing !== -1) {
        cart[existing].quantity += quantity;
      } else {
        cart.push({
          id: product._id,
          name: product.name,
          imageUrl: product.imageUrl,
          price: product.price,
          quantity,
        });
      }
      await AsyncStorage.setItem('cart', JSON.stringify(cart));
      Alert.alert('Thành công', 'Sản phẩm đã được thêm vào giỏ hàng!');
    } catch {
      Alert.alert('Lỗi', 'Không thể thêm vào giỏ hàng.');
    }
  };

  if (loading) {
    return (
      <ActivityIndicator
        size="large"
        color={appColors.danger}
        style={styles.loader}
      />
    );
  }

  if (!product) {
    return <Text style={styles.errorText}>Không tìm thấy sản phẩm</Text>;
  }
  const chuyentrangdanhgia = () => {
    navigation.navigate('RatingScreen', {productId: product._id});
  };
  return (
    <View style={styles.container}>
      <FlatList
        ListHeaderComponent={
          <>
            <Image source={{uri: product.imageUrl}} style={styles.image} />
            <View style={styles.detailsContainer}>
              <Text style={styles.price}>
                đ{product.price.toLocaleString()}
              </Text>
              <Text style={styles.name}>{product.name}</Text>
              <Text style={styles.mota}>Mô tả sản phẩm:</Text>
              <Text style={styles.name}>
                {product.description || 'Không có mô tả.'}
              </Text>

              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: 10,
                }}>
                <View>
                  <Text style={styles.mota}>Đánh giá sản phẩm:</Text>
                  <View style={{flexDirection: 'row'}}>
                    <Text style={styles.name}>3/5 ⭐</Text>
                    <Text style={styles.name}>(16 đánh giá)</Text>
                  </View>
                </View>
                <Text
                  onPress={() => chuyentrangdanhgia()}
                  style={{color: 'red', fontSize: 13}}>
                  Xem thêm
                </Text>
              </View>

              <Text style={styles.mota}>Bình luận:</Text>
              {comments.map(item => (
                <View key={item._id} style={styles.commentItem}>
                  <Text style={styles.commentUser}>{item.userName}</Text>
                  <Text>{item.content}</Text>
                </View>
              ))}
              {showCommentInput && (
                <View style={styles.commentInputContainer}>
                  <TextInput
                    style={styles.commentInput}
                    placeholder="Nhập bình luận..."
                    value={commentContent}
                    onChangeText={setCommentContent}
                  />
                  <TouchableOpacity
                    style={styles.sendButton}
                    onPress={addComment}>
                    <Text style={styles.sendButtonText}>Gửi</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </>
        }
        data={[]}
        renderItem={null}
        contentContainerStyle={{paddingBottom: 100}}
      />

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => setShowCommentInput(!showCommentInput)}>
          <MaterialIcons name="comment" size={24} color={appColors.gray} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton} onPress={addToCart}>
          <MaterialIcons
            name="add-shopping-cart"
            size={24}
            color={appColors.danger}
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.buyNowButton} onPress={placeOrder}>
          <Text style={styles.buyNowText}>Mua Ngay</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff'},
  loader: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  image: {width: width, height: 360, resizeMode: 'cover'},
  detailsContainer: {padding: 20},
  name: {fontSize: 12, fontWeight: 'bold', marginBottom: 5},
  price: {fontSize: 20, fontWeight: 'bold', color: '#F7472F'},
  mota: {fontSize: 12, fontWeight: 'bold', marginBottom: 5, color: '#000000'},
  errorText: {
    fontSize: 16,
    color: appColors.danger,
    textAlign: 'center',
    marginTop: 20,
  },
  commentItem: {marginBottom: 10},
  commentUser: {fontWeight: 'bold'},
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderColor: appColors.gray,
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: appColors.gray,
    borderRadius: 8,
    padding: 10,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: appColors.danger,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  sendButtonText: {color: '#fff', fontWeight: 'bold'},
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderTopWidth: 1,
    borderColor: appColors.gray,
    backgroundColor: '#fff',
    zIndex: 100,
  },
  iconButton: {padding: 10},
  buyNowButton: {
    backgroundColor: appColors.danger,
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
  },
  buyNowText: {color: '#fff', fontWeight: 'bold'},
});

export default ProductDetailScreen;
