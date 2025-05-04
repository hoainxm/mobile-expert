import React, {useState, useEffect, useRef} from 'react';
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
  ImageBackground,
} from 'react-native';
import {HambergerMenu} from 'iconsax-react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {useDispatch, useSelector} from 'react-redux';
import {authSelector} from '../../redux/reducers/authReducer';
import {appColors} from '../../constants/appColors';
import axiosClient from '../../apis/axiosClient';
import Carousel from 'react-native-snap-carousel';
import {
  addFavorite,
  removeFavorite,
} from '../../redux/reducers/favoritesReducer';
import socketManager from '../../utils/NotificationSocket';

const {width} = Dimensions.get('window');

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

interface RootState {
  authReducer: {
    authData: {
      id: string;
      photoUrl: string;
    };
  };
  favorites: {
    favorites: Product[];
  };
}

const HomeScreen: React.FC<{navigation: any}> = ({navigation}) => {
  const auth = useSelector((state: RootState) => state.authReducer.authData);
  const favoriteProducts = useSelector(
    (state: RootState) => state.favorites.favorites,
  );

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [loadingCategories, setLoadingCategories] = useState<boolean>(true);
  const [loadingProducts, setLoadingProducts] = useState<boolean>(true);
  const [showNotificationDropdown, setShowNotificationDropdown] =
    useState(false);
  const [notifications, setNotifications] = useState([]);
  useEffect(() => {
    socketManager.setupNotificationListener(payload => {
      setNotifications(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          type: payload.type,
          data: payload.data,
        },
      ]);
    });
  }, []);

  const carouselRef = useRef<Carousel<Category>>(null);
  const dispatch = useDispatch();

  const toggleFavorite = (product: Product) => {
    if (favoriteProducts.find(fav => fav._id === product._id)) {
      dispatch(removeFavorite(product._id));
    } else {
      dispatch(addFavorite(product));
    }
  };

  // Fetch danh mục và sản phẩm
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const result = await axiosClient.get<Category[]>('products/categories');
        console.log('Danh mục:', result);

        setCategories(result || []);
      } catch (error: any) {
        console.error(
          'Lỗi tải danh mục:',
          error.response?.data || error.message,
        );
      } finally {
        setLoadingCategories(false);
      }
    };

    const fetchTopSellingProducts = async () => {
      try {
        setLoadingProducts(true);
        const result = await axiosClient.get<Product[]>(
          '/products/top-selling',
        );
        setProducts(result || []);
      } catch (error: any) {
        console.error(
          'Lỗi khi tải sản phẩm bán chạy:',
          error.response?.data || error.message,
        );
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
      const result = await axiosClient.get<Product[]>('/products/search', {
        params: {
          keyword: searchKeyword,
          minPrice: minPrice ? Number(minPrice) : undefined,
          maxPrice: maxPrice ? Number(maxPrice) : undefined,
        },
      });
      setProducts(result || []);
    } catch (error: any) {
      console.error(
        'Lỗi khi tìm kiếm sản phẩm:',
        error.response?.data || error.message,
      );
    } finally {
      setLoadingProducts(false);
    }
  };

  const renderItem = ({item}: {item: Product}) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() =>
        navigation.navigate('ProductDetail', {productId: item._id})
      }>
      <Image source={{uri: item.image}} style={styles.productImage} />
      <TouchableOpacity
        style={styles.favoriteButton}
        onPress={() => toggleFavorite(item)}>
        <MaterialIcons
          name={
            favoriteProducts.find(fav => fav._id === item._id)
              ? 'favorite'
              : 'favorite-border'
          }
          size={24}
          color={appColors.danger}
        />
      </TouchableOpacity>
      <Text style={styles.productName}>{item.name}</Text>
      <Text style={styles.productPrice}>{item.price.toLocaleString()} VNĐ</Text>
      <View
        style={{
          flexDirection: 'row',
          gap: 5,
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
        <View style={{flexDirection: 'row', alignItems: 'center', gap: 2}}>
          <MaterialIcons name="star" size={16} color="#FFD700" />
          <MaterialIcons name="star" size={16} color="#FFD700" />
          <MaterialIcons name="star" size={16} color="#FFD700" />
          <MaterialIcons name="star" size={16} color="#FFD700" />
        </View>
        <Text style={{fontSize: 12, color: '#666'}}>đã bán 1k</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ImageBackground
        source={require('../../assets/images/headerbanner.png')}
        style={{height: 180, width: '100%'}}
        resizeMode="cover"
        imageStyle={{resizeMode: 'cover'}}>
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
          <TouchableOpacity
            onPress={() => setShowNotificationDropdown(prev => !prev)}>
            <MaterialIcons
              name="notifications"
              size={20}
              color="#F2F2F2"
              style={styles.iconheader}
            />
          </TouchableOpacity>
          {showNotificationDropdown && (
            <View style={styles.dropdown}>
              {notifications.length === 0 ? (
                <Text style={styles.dropdownItem}>Không có thông báo</Text>
              ) : (
                notifications
                  .slice(-5)
                  .reverse()
                  .map((item, index) => (
                    <View key={index} style={styles.dropdownItem}>
                      <Text style={styles.dropdownText}>
                        📦{' '}
                        {item.type === 'order'
                          ? `Đơn hàng mới từ ${item.data.customerName}`
                          : `Thông báo mới`}
                      </Text>
                      <Text style={styles.dropdownTime}>Vừa nhận</Text>
                    </View>
                  ))
              )}
            </View>
          )}

          <TouchableOpacity onPress={() => navigation.navigate('Favorites')}>
            <MaterialIcons
              name="favorite"
              size={14}
              color="#F2F2F2"
              style={styles.iconheader}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Cart')}>
            <MaterialIcons
              name="shopping-cart"
              size={14}
              color="#F2F2F2"
              style={styles.iconheader}
            />
          </TouchableOpacity>
          <Image
            source={{
              uri: auth?.photoUrl || 'https://example.com/default-avatar.png',
            }}
            style={styles.avatar}
          />
        </View>
      </ImageBackground>

      <ScrollView>
        <View style={styles.carouselContainer}>
          {loadingCategories ? (
            <Text>Đang tải danh mục...</Text>
          ) : categories.length > 0 ? (
            <FlatList
              data={categories}
              keyExtractor={item => item._id}
              numColumns={4}
              columnWrapperStyle={{justifyContent: 'space-between'}}
              contentContainerStyle={{padding: 10}}
              renderItem={({item}) => (
                <View style={styles.categoryCardWrapper}>
                  <TouchableOpacity
                    style={styles.categoryCard}
                    onPress={() =>
                      navigation.navigate('Product', {
                        categoryId: item._id,
                      })
                    }>
                    <View style={styles.iconContainer}>
                      <Image
                        source={{uri: item.image}} // thay bằng ảnh của bạn
                        style={styles.iconImage}
                      />
                    </View>
                  </TouchableOpacity>
                  <Text style={styles.categoryName}>{item.name}</Text>
                </View>
              )}
            />
          ) : (
            <Text>Không có danh mục nào để hiển thị.</Text>
          )}
        </View>

        <View style={styles.productContainer}>
          <Text style={styles.sectionTitle}>GỢI Ý HÔM NAY</Text>
          {loadingProducts ? (
            <Text>Đang tải sản phẩm...</Text>
          ) : products.length > 0 ? (
            <FlatList
              data={products}
              renderItem={renderItem}
              keyExtractor={item => item._id}
              key={'2-columns'}
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
  categoryCardWrapper: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',

    marginHorizontal: 5,
    marginBottom: 10,
  },

  iconContainer: {},
  iconImage: {
    borderRadius: 3,
    marginBottom: 5,
    width: 45,
    height: 45,
    padding: 5,
    backgroundColor: '#fff',
    resizeMode: 'contain',
  },

  iconheader: {
    color: '#F2F2F2',
    zIndex: 10,
  },
  container: {
    flex: 1,
    marginTop: 50,
    backgroundColor: '#F2F2F2',
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
    borderColor: '#F7472F',
    borderRadius: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    height: 28,
    textAlignVertical: 'center',
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
  carouselContainer: {
    backgroundColor: '#F7472F',
  },

  categoryName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginVertical: 10,
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
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: 165,
    borderRadius: 0,
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
  sectionTitle: {
    backgroundColor: '#fff',
    padding: 5,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: appColors.danger,
  },
  dropdown: {
    position: 'absolute',
    zIndex: 100,
    top: 55,
    right: 10,
    width: 250,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 99,
  },

  dropdownItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 6,
  },

  dropdownText: {
    fontSize: 14,
    color: '#333',
  },

  dropdownTime: {
    fontSize: 12,
    color: '#999',
  },
});

export default HomeScreen;
