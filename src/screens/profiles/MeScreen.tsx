
import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import RectangleItem from '../../components/RectangleItem';
import { useNavigation } from '@react-navigation/native';
const MeScreen = () => {
  const navigation = useNavigation();
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.shopButton}>
          <Text style={styles.shopText}>Shop của tôi &gt;</Text>
        </TouchableOpacity>
        <View style={styles.userInfo}>
          <Image
            source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' }}
            style={styles.avatar}
          />
          <View>
            <Text style={styles.username}>Username</Text>
            <Text style={styles.followText}>Người theo dõi: 0</Text>
          </View>
        </View>
        <View style={styles.topIcons}>
          <Text style={styles.icon}>🛒</Text>
          <Text style={styles.icon}>🔔</Text>
        </View>
      </View>

      {/* Body */}
      <RectangleItem
        title="Quản lý đơn mua"
        iconName="receipt"
        onPress={() => navigation.navigate('OrderHistory')}
      />
      <RectangleItem
        title="Thông tin cá nhân"
        iconName="person"
        onPress={() => navigation.navigate('ProfileScreen')}
      />

      {/* Logout */}
      <TouchableOpacity style={styles.logoutButton} onPress={() => console.log('Đăng xuất')}>
        <Text style={styles.logoutText}>Đăng xuất</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f4f4' ,marginTop: 20},
  header: {
    backgroundColor: '#f44336',
    padding: 16,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  shopButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 10,
  },
  shopText: { color: '#f44336', fontWeight: 'bold' },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 10 },
  username: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  followText: { color: '#fff', fontSize: 12 },
  topIcons: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    gap: 10,
  },
  icon: { fontSize: 20, marginLeft: 10 },
  logoutButton: {
    backgroundColor: '#fff',
    marginTop: 12,
    alignItems: 'center',
    paddingVertical: 15,
  },
  logoutText: { color: '#f44336', fontWeight: 'bold' },
});

export default MeScreen;
