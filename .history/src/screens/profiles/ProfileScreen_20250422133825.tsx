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
  OrderHistory: undefined;
  PromoCodes: undefined;
};

type NavigationProp = StackNavigationProp<RootStackParamList, 'OTPVerification'>;

const ProfileScreen: React.FC = () => {
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

      setImage(uri);

      const formData = new FormData();
      formData.append('image', {
        uri: uri.startsWith('file://') ? uri : `file://${uri}`,
        name: 'profile.jpg',
        type: fileType,
      });
      formData.append('userId', userId);

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

        setImage(uploadResponse.data.data.photoUrl);
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
      <TouchableOpacity
        style={styles.promoCodeButton}
        onPress={() => navigation.navigate('PromoCodes')}
      >
        <Text style={styles.promoCodeText}>Xem mã khuyến mãi</Text>
      </TouchableOpacity>
    </ContainerComponent>
  );
};
const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 20,
    width: 100,
    objectFit: 'cover',
    height: 100,
    justifyContent: 'center',
    padding: 10,
  },
  image: {
    width: 100,
    height: 100,
    objectFit: 'cover',
    borderWidth: 1,
    borderRadius: 50,
    marginBottom: 10,
  },
  pickImageText: {
    color: appColors.primary,
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: appColors.danger,
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
    width: '80%',
    alignSelf: 'center',
  },
  orderHistoryButton: {
    backgroundColor: appColors.primary,
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  orderHistoryText: {
    color: '#fff',
    fontSize: 16,
  },
  promoCodeButton: {
    backgroundColor: appColors.danger,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  promoCodeText: {
    color: '#fff',
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: appColors.white,
  },
  errorText: {
    color: appColors.danger,
    textAlign: 'center',
    marginTop: 10,
  },
  errorContainer: {
    backgroundColor: appColors.danger,
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
  },
  errorMessage: {
    color: '#fff',
    fontSize: 16,
  },
  successText: {
    color: appColors.danger,
    textAlign: 'center',
    marginTop: 10,
  },
  successContainer: {
    backgroundColor: appColors.danger,
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
  },
  successMessage: {
    color: '#fff',
    fontSize: 16,
  },
  button: {
    backgroundColor: appColors.primary,
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  buttonDisabled: {
    backgroundColor: appColors.gray,
  },
  buttonTextDisabled: { 
    color: appColors.gray5,
  },
  buttonTextEnabled: {
    color: appColors.white,
  }
  },
)
export default ProfileScreen;