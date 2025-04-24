import {NavigationContainer} from '@react-navigation/native';
import React, { useEffect } from 'react';
import {Alert, StatusBar} from 'react-native';
import {Provider} from 'react-redux';
import AppRouters from './src/navigators/AppRouters';
import store from './src/redux/store';
import { setupSocketListeners } from './src/utils/NotificationSocket';


const App = () => {
  // Thiết lập socket khi ứng dụng khởi động
  useEffect(() => {
    setupSocketListeners((payload) => {
      // Hiển thị notification hoặc thêm vào danh sách
      Alert.alert("Thông báo", `Có ${payload.type} mới!`);
    });
  }, []);
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
