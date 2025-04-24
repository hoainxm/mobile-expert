import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  ScrollView,
  TouchableOpacity,
  FlatList,
  StatusBar,
  Dimensions,
  StyleSheet,
} from 'react-native';
import { HambergerMenu } from 'iconsax-react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useDispatch, useSelector } from 'react-redux';
import { authSelector } from '../../redux/reducers/authReducer';
import { appColors } from '../../constants/appColors';
import axiosClient from '../../apis/axiosClient';
import Carousel from 'react-native-snap-carousel';
import { addFavorite, removeFavorite } from '../../redux/reducers/favoritesReducer';

const { width } = Dimensions.get('window');

interface Category {
  _id: string;
  name: string;
}

interface Product {
  _id: string;
  name: string;
  price: number;
  image: string;
  category: Category;
}

const HomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const auth = useSelector(authSelector);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [loadingCategories, setLoadingCategories] = useState<boolean>(true);
  const [loadingProducts, setLoadingProducts] = useState<boolean>(true);
  const carouselRef = useRef(null);
  const dispatch = useDispatch();
  const favoriteProducts = useSelector((state: RootState) => state.favorites.favorites);

  const toggleFavorite = (productId: string) => {
    if (favoriteProducts.includes(productId)) {
      dispatch(removeFavorite(productId));
    } else {
      dispatch(addFavorite(productId));
    }
  };

  // Fetch danh mục và sản phẩm
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const result = await axiosClient.get('products/categories');
        setCategories(result || []);
      } catch (error) {
        console.error('Lỗi tải danh mục:', error.response?.data || error.message);
      } finally {
        setLoadingCategories(false);
      }
    };

    const fetchTopSellingProducts = async () => {
      try {
        setLoadingProducts(true);
        const result = await axiosClient.get('/products/top-selling');
        setProducts(result || []);
      } catch (error) {
        console.error('Lỗi khi tải sản phẩm bán chạy:', error.response?.data || error.message);
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchCategories();
    fetchTopSellingProducts();
  }, []);

  // Xử lý tìm kiếm và lọc sản phẩm
  const handleSearch = async () => {
    try {
      setLoadingProducts(true);
      const result = await axiosClient.get('/products/search', {
        params: {
          keyword: searchKeyword,
          minPrice: minPrice ? Number(minPrice) : undefined,
          maxPrice: maxPrice ? Number(maxPrice) : undefined,
        },
      });
      setProducts(result.data || []);
    } catch (error) {
      console.error('Lỗi khi tìm kiếm sản phẩm:', error.response?.data || error.message);
    } finally {
      setLoadingProducts(false);
    }
  };

  const renderItem = ({ item }: { item: Product }) => (
    <View style={styles.productCard}>
      <Image source={{ uri: item.image }} style={styles.productImage} />
      <TouchableOpacity
        style={styles.favoriteButton}
        onPress={() => toggleFavorite(item._id)}
      >
        <MaterialIcons
          name={favoriteProducts.includes(item._id) ? 'favorite' : 'favorite-border'}
          size={24}
          color={appColors.danger}
        />
      </TouchableOpacity>
      <Text style={styles.productName}>{item.name}</Text>
      <Text style={styles.productPrice}>{item.price.toLocaleString()} đ</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <HambergerMenu size={24} color={appColors.danger} />
        </TouchableOpacity>
        <TextInput
          placeholder="Tìm sản phẩm..."
          style={styles.searchInput}
          value={searchKeyword}
          onChangeText={setSearchKeyword}
        />
        <TouchableOpacity>
          <MaterialIcons name="notifications" size={24} color={appColors.danger} />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Cart')}>
          <MaterialIcons name="shopping-cart" size={28} color="black" />
        </TouchableOpacity>
        <Image
          source={{ uri: auth?.photoUrl || 'https://example.com/default-avatar.png' }}
          style={styles.avatar}
        />
      </View>

      <View style={styles.filterContainer}>
        <TextInput
          placeholder="Giá từ (VND)"
          keyboardType="numeric"
          style={styles.priceInput}
          value={minPrice}
          onChangeText={setMinPrice}
        />
        <TextInput
          placeholder="Đến (VND)"
          keyboardType="numeric"
          style={styles.priceInput}
          value={maxPrice}
          onChangeText={setMaxPrice}
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>Tìm kiếm</Text>
        </TouchableOpacity>
      </View>

      <ScrollView>
        <View style={styles.carouselContainer}>
          {loadingProducts ? (
            <Text>Đang tải sản phẩm...</Text>
          ) : products.length > 0 ? (
            <Carousel
              ref={carouselRef}
              data={products}
              renderItem={renderItem}
              sliderWidth={width}
              itemWidth={width - 40}
              loop
              autoplay
              autoplayInterval={3000}
            />
          ) : (
            <Text>Không có sản phẩm nào để hiển thị.</Text>
          )}
        </View>

        <View style={styles.productContainer}>
          <Text style={styles.sectionTitle}>Sản phẩm</Text>
          {loadingProducts ? (
            <Text>Đang tải sản phẩm...</Text>
          ) : products.length > 0 ? (
            <FlatList
              data={products}
              renderItem={renderItem}
              keyExtractor={(item) => item._id}
              numColumns={2}
              columnWrapperStyle={styles.row}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <Text>Không có sản phẩm nào để hiển thị.</Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 75,
    backgroundColor: '#fff',
  },
  carouselContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  searchInput: {
    flex: 1,
    marginHorizontal: 10,
    borderWidth: 1,
    borderColor: appColors.gray,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    backgroundColor: '#f9f9f9',
  },
  favoriteButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 5,
    elevation: 3,
    zIndex: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginLeft: 10,
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
    marginTop: 10,
    justifyContent: 'space-between',
  },
  priceInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: appColors.gray,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginHorizontal: 5,
    fontSize: 14,
    backgroundColor: '#f9f9f9',
  },
  searchButton: {
    backgroundColor: appColors.danger,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  productContainer: {
    paddingHorizontal: 12,
    marginTop: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  productCard: {
    width: (width - 40) / 2,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: 120,
    borderRadius: 10,
    resizeMode: 'cover',
  },
  productName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 6,
    textAlign: 'center',
  },
  productPrice: {
    fontSize: 14,
    color: appColors.danger,
    marginTop: 4,
    fontWeight: 'bold',
  },
});

export default HomeScreen;