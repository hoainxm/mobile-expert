import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import axiosClient from '../../apis/axiosClient';
import {useNavigation, useRoute} from '@react-navigation/native';

const tabs = ['Liên quan', 'Mới nhất', 'Bán chạy', 'Giá'];

const ProductScreen = () => {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedTab, setSelectedTab] = useState('Liên quan');
  const route = useRoute();
  const {categoryId} = (route.params as {categoryId: string}) || {};

  const [products, setProducts] = useState<any[]>([]);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const navigation = useNavigation();
  const handleFilter = () => {
    let filteredProducts = products;

    // Lọc theo từ khóa tìm kiếm
    if (searchKeyword) {
      filteredProducts = filteredProducts.filter(product =>
        product.name.toLowerCase().includes(searchKeyword.toLowerCase()),
      );
    }

    // Lọc theo giá
    if (minPrice) {
      filteredProducts = filteredProducts.filter(
        product => product.price >= parseInt(minPrice, 10),
      );
    }
    if (maxPrice) {
      filteredProducts = filteredProducts.filter(
        product => product.price <= parseInt(maxPrice, 10),
      );
    }

    // Cập nhật danh sách sản phẩm hiển thị
    setProducts(filteredProducts);
  };
  const fetchCategory = async () => {
    try {
      const res = await axiosClient.get(
        `/products/getproductbycategoryid/${categoryId}`,
      );
      if (res) {
        setProducts(res);
      }
    } catch (error) {
      console.error('Error fetching category:', error);
      Alert.alert('Lỗi', 'Không thể tải danh mục');
    }
  };
  const fetchAllproducts = async () => {
    try {
      const res = await axiosClient.get('/products/allproducts');
      console.log('res', res);
      if (res) {
        setProducts(res);
      }
    } catch (error) {
      console.error('Error fetching all products:', error);
      Alert.alert('Lỗi', 'Không thể tải sản phẩm');
    }
  };

  useEffect(() => {
    if (categoryId) {
      fetchCategory();
    } else {
      fetchAllproducts();
    }
  }, [categoryId]);
  const renderItem = ({item}) => (
    <View style={styles.card}>
      <TouchableOpacity
        onPress={() =>
          navigation.navigate('ProductDetail', {productId: item._id})
        }>
        <Image source={item.image} style={styles.image} />
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.price}>đ{item.price.toLocaleString()}</Text>
        <View style={styles.row}>
          <View style={styles.stars}>
            {[...Array(5)].map((_, index) => (
              <Icon key={index} name="star" size={14} color="#FFD700" />
            ))}
          </View>
          <Text style={styles.sold}>Đã bán 1k</Text>
        </View>
        <Text style={styles.location}>📍 TP. Hồ Chí Minh</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#F7472F" />
        </TouchableOpacity>
        <TextInput
          placeholder="Tìm kiếm..."
          value={searchKeyword}
          onChangeText={setSearchKeyword}
          style={styles.searchInput}
        />
        <TouchableOpacity onPress={() => setShowFilter(!showFilter)}>
          <Icon name="filter-list" size={24} color="#F7472F" />
        </TouchableOpacity>
      </View>
      {showFilter && (
        <View style={styles.filterContainer}>
          <TextInput
            placeholder="Giá từ"
            keyboardType="numeric"
            style={styles.filterInput}
            onChangeText={text => setMinPrice(text)}
          />
          <TextInput
            placeholder="Đến"
            keyboardType="numeric"
            style={styles.filterInput}
            onChangeText={text => setMaxPrice(text)}
          />
          <TouchableOpacity style={styles.searchButton} onPress={handleFilter}>
            <Text style={styles.searchButtonText}>Lọc</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Filter Button */}

      {/* Tabs */}
      <View style={styles.tabs}>
        {tabs.map(tab => (
          <TouchableOpacity key={tab} onPress={() => setSelectedTab(tab)}>
            <Text
              style={[
                styles.tabText,
                selectedTab === tab && styles.tabSelected,
              ]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Product Grid */}
      <FlatList
        data={products}
        keyExtractor={item => item.id}
        numColumns={2}
        columnWrapperStyle={{justifyContent: 'space-between'}}
        contentContainerStyle={{padding: 12}}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 30,
    flex: 1,
    backgroundColor: '#F2F2F2',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
  },
  searchInput: {
    flex: 1,
    marginHorizontal: 10,
    borderWidth: 1,
    borderColor: '#F7472F',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 5,
    fontSize: 14,
    backgroundColor: '#fff',
  },
  tabs: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    paddingVertical: 8,
  },
  tabText: {
    color: '#666',
    fontSize: 14,
  },
  tabSelected: {
    color: '#F7472F',
    fontWeight: 'bold',
  },
  card: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 12,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 120,
    resizeMode: 'contain',
  },
  name: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 6,
  },
  price: {
    color: '#F7472F',
    fontWeight: 'bold',
    fontSize: 14,
    marginVertical: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stars: {
    flexDirection: 'row',
  },
  sold: {
    fontSize: 12,
    color: '#666',
  },
  location: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  filterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
    margin: 10,
  },
  filterInput: {
    flex: 1,
    minWidth: '30%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 8,
    height: 40,
    backgroundColor: '#fff',
  },
  searchButton: {
    backgroundColor: '#F7472F',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    alignSelf: 'center',
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default ProductScreen;
