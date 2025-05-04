import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Image,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import axiosClient from '../../apis/axiosClient';
import { appColors } from '../../constants/appColors';

const { width } = Dimensions.get('window');

const RatingScreen = ({ route, navigation }) => {
  const { productId } = route.params;
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await axiosClient.get(`/reviews/${productId}`);
        setReviews(res);
        const avg =
          res.reduce((sum, review) => sum + (review.rating || 5), 0) /
          res.length;
        setAverageRating(avg);
      } catch (error) {
        console.error('Error fetching reviews:', error);
      }
    };
    fetchReviews();
  }, [productId]);

  const renderReview = ({ item }) => (
    <View style={styles.reviewCard}>
      <View style={styles.userRow}>
        <Image
          source={require('../../assets/images/logo.png')} // hoặc item.userId.avatar
          style={styles.avatar}
        />
        <View>
          <Text style={styles.username}>{item.userId?.username || 'Người dùng'}</Text>
          <View style={styles.stars}>
            {[...Array(5)].map((_, i) => (
              <MaterialIcons
                key={i}
                name="star"
                size={16}
                color={i < item.rating ? '#FFD700' : '#ccc'}
              />
            ))}
          </View>
        </View>
      </View>
      <Text style={styles.comment}>{item.comment}</Text>
    </View>
  );
  

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color={appColors.danger} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đánh giá</Text>
        <View style={styles.headerIcons}>
          <MaterialIcons
            name="shopping-cart"
            size={22}
            color={appColors.danger}
            style={{ marginRight: 15 }}
          />
          <MaterialIcons name="chat" size={22} color={appColors.danger} />
        </View>
      </View>

      {/* Summary */}
      <View style={styles.summaryBox}>
        <Text style={styles.summaryTitle}>Đánh giá sản phẩm</Text>
        <Text style={styles.averageRating}>⭐ {averageRating.toFixed(1)} / 5 | ({reviews.length} đánh giá)</Text>
      </View>

      <FlatList
        data={reviews}
        keyExtractor={(item) => item._id}
        renderItem={renderReview}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', marginTop: 30 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#000' },
  headerIcons: { flexDirection: 'row', alignItems: 'center' },
  summaryBox: {
    backgroundColor: '#f9f9f9',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  summaryTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
  averageRating: { fontSize: 14, color: '#333' },
  reviewCard: {
    borderBottomWidth: 1,
    borderColor: '#eee',
    padding: 15,
  },
  userRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  avatar: { width: 36, height: 36, borderRadius: 18, marginRight: 10 },
  username: { fontWeight: 'bold', fontSize: 14 },
  stars: { flexDirection: 'row', marginTop: 2 },
  comment: { fontSize: 14, marginTop: 5, color: '#333' },
});

export default RatingScreen;