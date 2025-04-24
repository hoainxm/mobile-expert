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
import { useSelector } from 'react-redux';
import { authSelector } from '../../redux/reducers/authReducer';
import { appColors } from '../../constants/appColors';
import axiosClient from '../../apis/axiosClient';
import Carousel from 'react-native-snap-carousel';

const { width } = Dimensions.get('window');

interface Category {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  imageUrl?: string; // Optional property to avoid breaking existing code
}

const HomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const auth = useSelector(authSelector);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const carouselRef = useRef(null);

  // Fetch danh mục sản phẩm
  useEffect(() => {

    setTimeout(() => {
      setProducts(
        Array.from({ length: 10 }, (_, i) => ({
          id: i.toString(),
          name: `Sản phẩm ${i + 1}`,
          price: 0,
          image: 'https://example.com/default-image.png',
        }))
      );
    }, 1000);
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.slide}>
      <Image source={{ uri: item.url }} style={styles.image} />
    </View>
  );



  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const result = await axiosClient.get('products/categories');
        setCategories(result);
      } catch (error) {
        console.error('Lỗi tải danh mục:', error);
      }
    };
    const fetchAllProducts = async () => {
      try {
        const result = await axiosClient.get('/products'); // Gọi API lấy tất cả sản phẩm

        // Chuyển đổi dữ liệu giống handleSearch
        setProducts(result.data.map((item: any) => ({
          id: item._id,
          name: item.name,
          price: item.price,
          imageUrl: `https://your-image-url.com/${item.image}`, // Cập nhật đường dẫn ảnh
          categoryId: item.category,
        })));
      } catch (error) {
        console.error('Lỗi khi tải danh sách sản phẩm:', error);
      }
    };





    fetchCategories();
    fetchAllProducts();
  }, []);


  const handleSearch = async () => {
    try {
      const result = await axiosClient.get('/products/getvafiller', {
        params: {
          keyword: searchKeyword,
          minPrice: minPrice ? Number(minPrice) : undefined,
          maxPrice: maxPrice ? Number(maxPrice) : undefined,
        },
      });
      setProducts(result.data.map((item: any) => ({
        id: item._id,
        name: item.name,
        price: item.price,
        imageUrl: `https://your-image-url.com/${item.image}`, // Cập nhật URL ảnh nếu cần
        categoryId: item.category,
      })));
    } catch (error) {
      console.error('Lỗi khi tìm kiếm sản phẩm:', error);
    }
  };

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
          <Carousel
            ref={carouselRef} // 🔹 Đảm bảo truyền ref vào Carousel
            data={products}
            renderItem={renderItem}
            sliderWidth={width}
            itemWidth={width - 40}
            loop
            autoplay
            autoplayInterval={3000}
          />
        </View>

        <View style={styles.categoryContainer}>
          <Text style={styles.sectionTitle}>Danh mục</Text>
          <FlatList
            data={products}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.productCard}
                onPress={() => navigation.navigate('ProductDetail', { productId: item.id })} // Điều hướng đến trang chi tiết sản phẩm
              >
                <Image source={{ uri: item.imageUrl || item.image }} style={styles.productImage} />
                <Text style={styles.productName}>{item.name}</Text>
                <Text style={styles.productPrice}>{item.price} đ</Text>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item.id}
            numColumns={2}
            columnWrapperStyle={styles.row}
            showsVerticalScrollIndicator={false}
          />



        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 75,
    backgroundColor: '#fff', // Đảm bảo nền trắng để giao diện đồng nhất
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
  categoryContainer: {
    marginTop: 20,
    paddingHorizontal: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  categoryItem: {
    backgroundColor: appColors.gray,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 20,
    marginRight: 10,
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
    width: (width - 40) / 2, // Đảm bảo kích thước cân đối trong màn hình
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, // Hiệu ứng nổi trên Android
  },
  productImage: {
    width: '100%',
    height: 120, // Tăng chiều cao hình ảnh để hiển thị tốt hơn
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
