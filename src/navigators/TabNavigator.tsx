import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React, { ReactNode } from 'react';
import ExploreNavigator from './ExploreNavigator';
import { AddNewScreen, HomeScreen } from '../screens';
import MapNavigator from './MapNavigator';
import ProfileNavigator from './ProfileNavigator';
import { appColors } from '../constants/appColors';
import {
  AddSquare,
  Calendar,
  Home2,
  Iost,
  Location,
  ShoppingBag,
  User,
} from 'iconsax-react-native';
import { CircleComponent, TextComponent } from '../components';
import { Platform, View } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { globalStyles } from '../styles/globalStyles';
import DrawerNavigator from './DrawerNavigator';
import UserProfileStats from '../screens/profiles/UserProfileStats';
import MeScreen from '../screens/profiles/MeScreen';
import ProductScreen from '../screens/product/ProductScreen';

const TabNavigator = () => {
  const Tab = createBottomTabNavigator();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          height: Platform.OS === 'ios' ? 88 : 68,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: appColors.white,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let icon: ReactNode;
          color = focused ? appColors.primary : appColors.gray5;
          size = 24;
          switch (route.name) {
            case 'Home':
              icon = <MaterialIcons name="home" size={size} color={color} />;
              break;

              case 'Product':
                icon = (
                  <CircleComponent
                    size={52}
                    styles={[
                      globalStyles.shadow,
                      { marginTop: Platform.OS === 'ios' ? -50 : -60 },
                    ]}>
                    <ShoppingBag size={24} color={appColors.white} variant="Bold" />
                  </CircleComponent>
                );
                break;
            
            case 'Me':
              icon = <User size={size} variant="Bold" color={color} />;
              break;

            
          }
          return icon;
        },
        tabBarIconStyle: {
          marginTop: 8,
        },
        tabBarLabel({ focused }) {
          return route.name === 'Add' ? null : (
            <TextComponent
              text={route.name}
              flex={0}
              size={12}
              color={focused ? appColors.primary : appColors.gray5}
              styles={{
                marginBottom: Platform.OS === 'android' ? 12 : 0,
              }}
            />
          );
        },
      })}>

      <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Product" component={ProductScreen} />
      <Tab.Screen name="Me" component={MeScreen} />
    </Tab.Navigator>
  );
};

export default TabNavigator;
