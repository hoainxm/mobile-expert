import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React from 'react';
import TabNavigator from './TabNavigator';
import DrawerNavigator from './DrawerNavigator';
import OTPVerificationScreen from '../screens/auth/OTPVerificationScreen';
import ProductDetailScreen from '../screens/product/ProductDetailScreen';
import CartScreen from '../screens/product/CartScreen';
import FavoritesScreen from '../screens/product/FavoritesScreen';
import OrderHistoryScreen from '../screens/orders/OrderHistoryScreen';
import OrderDetailsScreen from '../screens/product/OrderDetailsScreen';
import PromoCodesScreen from '../screens/product/PromoCodesScreen';
import UserProfileStats from '../screens/profiles/UserProfileStats';
import {ProfileScreen} from '../screens';
import RatingScreen from '../screens/product/RatingScreen';
import OrderDetailScreen from '../screens/orders/OrderDetailScreen';
import CheckoutScreen from '../screens/product/CheckoutScreen';
import ProductScreen from '../screens/product/ProductScreen';

const MainNavigator = () => {
  const Stack = createNativeStackNavigator();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="Main" component={DrawerNavigator} />
      <Stack.Screen name="OTPVerification" component={OTPVerificationScreen} />
      <Stack.Screen
        name="ProductDetail"
        component={ProductDetailScreen}
        options={{title: 'Chi tiết sản phẩm'}}
      />
      <Stack.Screen name="Cart" component={CartScreen} />
      <Stack.Screen name="orderHist" component={OrderHistoryScreen} />
      <Stack.Screen name="Favorites" component={FavoritesScreen} />
      <Stack.Screen name="OrderHistory" component={OrderHistoryScreen} />
      <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
      <Stack.Screen name="PromoCodes" component={PromoCodesScreen} />
      <Stack.Screen
        name="UserStatusProfile"
        component={UserProfileStats}
        options={{title: 'Thống kê'}}
      />
      <Stack.Screen
        name="ProfileScreen"
        component={ProfileScreen}
        options={{title: 'Thông tin cá nhân'}}
      />
      <Stack.Screen name="RatingScreen" component={RatingScreen} />
      <Stack.Screen name="CheckoutScreen" component={CheckoutScreen} />
    </Stack.Navigator>
  );
};

export default MainNavigator;
