import {NavigationContainer} from '@react-navigation/native';
import React, {useEffect} from 'react';
import {Alert, StatusBar} from 'react-native';
import {Provider} from 'react-redux';
import AppRouters from './src/navigators/AppRouters';
import store from './src/redux/store';
import socketManager from './src/utils/NotificationSocket';

const App = () => {
  useEffect(() => {
    socketManager.setupNotificationListener(payload => {
      console.log('Notification received:', payload);
      Alert.alert(
        '🛒 Đơn hàng mới',
        `Khách hàng: ${
          payload.data.customerName
        }\nTổng tiền: ${payload.data.totalAmount.toLocaleString()} đ\nSố sản phẩm: ${
          payload.data.quantity
        }`,
        [
          {
            text: 'Xem chi tiết',
            onPress: () => {
              // Điều hướng hoặc xử lý hành động khi nhấn
              console.log('View details pressed');
            },
          },
          {text: 'Đóng', style: 'cancel'},
        ],
      );
    });
  }, []); // chỉ gọi 1 lần

  return (
    <>
      <Provider store={store}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor="transparent"
          translucent
        />

        <NavigationContainer>
          <AppRouters />
        </NavigationContainer>
      </Provider>
    </>
  );
};

export default App;
