import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { ButtonComponent, ContainerComponent } from '../../components';
import { appColors } from '../../constants/appColors';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

interface ProfileData {
  email?: string;
  name?: string;
  photoUrl?: string;
}

type RootStackParamList = {
  OTPVerification: {
    code: string;
    email: string;
    userId: string | null;
    name: string;
    image: string | null;
    token: string;
  };
};

type NavigationProp = StackNavigationProp<RootStackParamList, 'OTPVerification'>;

const ProfileScreen: React.FC = () => {
  // Lấy userId và token từ Redux
  const userId = useSelector((state: any) => state.authReducer.authData.id);
  const token = useSelector((state: any) => state.authReducer.authData.accesstoken);

  const navigation = useNavigation<NavigationProp>();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [image, setImage] = useState<string | null>(null);
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');

  useEffect(() => {
    if (!userId || !token) {
      Alert.alert('Lỗi', 'Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.');
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await axios.get<{ data: ProfileData }>(
          `http://10.0.2.2:3001/users/get-profile?uid=${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setProfile(response.data.data);
        setEmail(response.data.data.email || '');
        setName(response.data.data.name || '');
      } catch (error) {
        console.error('❌ Lỗi khi lấy thông tin người dùng:', error);
        Alert.alert('Lỗi', 'Không thể lấy thông tin người dùng!');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId, token]);

  const pickImage = () => {
    launchImageLibrary({ mediaType: 'photo' }, async (response) => {
      if (response.didCancel || !response.assets || response.assets.length === 0) return;

      const asset = response.assets[0];
      const uri = asset.uri;
      const fileType = asset.type || 'image/jpeg';

      if (!uri) {
        Alert.alert('Lỗi', 'Không thể lấy đường dẫn ảnh!');
        return;
      }

      setImage(uri);  // Hiển thị ảnh trước khi upload

      // Chuẩn bị FormData để gửi lên API
      const formData = new FormData();
      formData.append('image', {
        uri: uri.startsWith('file://') ? uri : `file://${uri}`,  // Đảm bảo URI đúng định dạng
        name: 'profile.jpg',
        type: fileType,
      });
      formData.append('userId', userId);  // Gửi userId để server cập nhật đúng user

      try {
        const uploadResponse = await axios.post(
          'http://10.0.2.2:3001/users/upload-photo',
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );

        setImage(uploadResponse.data.data.photoUrl);  // Cập nhật ảnh mới từ server
        Alert.alert('Thành công', 'Ảnh đã được tải lên thành công!');
      } catch (error) {
        console.error('❌ Lỗi khi upload ảnh:', error);
        Alert.alert('Lỗi', 'Không thể tải ảnh lên. Hãy kiểm tra lại API.');
      }
    });
  };

  const sendOTPAndNavigate = async () => {
    if (!email) {
      Alert.alert('Lỗi', 'Vui lòng nhập email để xác thực.');
      return;
    }

    try {
      const response = await axios.post<{ data: { code: string } }>(
        'http://10.0.2.2:3001/auth/verification',
        { email }
      );

      if (response.status === 200) {
        Alert.alert('Thông báo', 'Mã OTP đã được gửi đến email của bạn!');
        navigation.navigate('OTPVerification', {
          code: response.data.data.code.toString(),
          email,
          userId,
          name,
          image: image ?? profile?.photoUrl ?? null,
          token,
        });
      } else {
        Alert.alert('Lỗi', 'Không thể gửi mã OTP!');
      }
    } catch (error: any) {
      console.error('❌ Lỗi khi gửi OTP:', error);
      Alert.alert('Lỗi', error.response?.data?.message || 'Không thể gửi mã OTP!');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={appColors.primary} />
      </View>
    );
  }

  return (
    <ContainerComponent back>
      <Text style={styles.title}>Chỉnh sửa hồ sơ</Text>

      <TouchableOpacity onPress={pickImage} style={styles.imageContainer}>
        <Image
          source={{ uri: image ?? profile?.photoUrl ?? 'https://via.placeholder.com/100' }}
          style={styles.image}
        />
        <Text style={styles.pickImageText}>Chọn ảnh</Text>
      </TouchableOpacity>

      <Text>Email</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="Nhập email mới"
        keyboardType="email-address"
      />

      <Text>Tên người dùng</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Nhập tên mới" />

      <ButtonComponent type="primary" onPress={sendOTPAndNavigate} text="Lưu thay đổi" />

      <TouchableOpacity
        style={styles.orderHistoryButton}
        onPress={() => navigation.navigate('OrderHistory')}
      >
        <Text style={styles.orderHistoryText}>Xem lịch sử đơn hàng</Text>
      </TouchableOpacity>
    </ContainerComponent>
  );
};

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  imageContainer: { alignItems: 'center', marginBottom: 20 },
  image: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#ddd' },
  pickImageText: { color: appColors.primary, marginTop: 5 },
  input: {
    borderWidth: 1,
    borderColor: appColors.gray,
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 40,
    marginBottom: 10,
  },
  orderHistoryButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: appColors.primary,
    borderRadius: 10,
    alignItems: 'center',
  },
  orderHistoryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProfileScreen;
