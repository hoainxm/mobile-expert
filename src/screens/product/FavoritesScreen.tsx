import React from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    Image,
    StyleSheet,
    Dimensions,
} from 'react-native';
import { useSelector } from 'react-redux';
import { appColors } from '../../constants/appColors';

const { width } = Dimensions.get('window');

const FavoritesScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
    const favoriteProducts = useSelector((state: any) => state.favorites.favorites);

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.productCard}
            onPress={() => navigation.navigate('ProductDetail', { productId: item._id })}
        >
            <Image source={{ uri: item.image }} style={styles.productImage} />
            <Text style={styles.productName}>{item.name}</Text>
            <Text style={styles.productPrice}>{item.price} VNĐ</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Sản phẩm yêu thích</Text>
            {favoriteProducts.length > 0 ? (
                <FlatList
                    data={favoriteProducts}
                    renderItem={renderItem}
                    keyExtractor={(item) => item._id}
                    numColumns={2}
                    columnWrapperStyle={styles.row}
                    showsVerticalScrollIndicator={false}
                />
            ) : (
                <Text style={styles.emptyText}>Không có sản phẩm yêu thích</Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
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
    emptyText: {
        fontSize: 16,
        color: '#888',
        textAlign: 'center',
        marginTop: 20,
    },
});

export default FavoritesScreen;