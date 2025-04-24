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
import axiosClient from '../../apis/axiosClient';

interface ProfileData {
  email?: string;
  name?: string;
  photoUrl?: string;
  password?: string;
  phone?: string;
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
  const [phone, setPhone] = useState<string>('');
  const [password, setPassword] = useState<string>('');

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
    });

      
  };

  const sendOTPAndNavigate = async () => {
    if (!email) {
      Alert.alert('Lỗi', 'Vui lòng nhập email để xác thực.');
      return;
    }

    try {
      const response = await axiosClient.post('/auth/verification', {
        email,
      }
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
      </TouchableOpacity>

      <View style={styles.wrapper}>
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
      <Text>Số điện thoại</Text>
      <TextInput
        style={styles.input}
        value={phone}
        onChangeText={setPhone}
        placeholder="Nhập số điện thoại mới"
        keyboardType="phone-pad"
      />
      <Text>Mật khẩu</Text>
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        placeholder="Nhập mật khẩu mới"
        secureTextEntry
      />
      <ButtonComponent  onPress={sendOTPAndNavigate} type='primary' text="Lưu thay đổi" />
      </View>

      
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
  wrapper: {
    marginBottom: 20,
    marginTop: 20,
  },

  imageContainer: {
    marginBottom: 20,
    width: "100%",
    height: 100,
    padding: 10,
    
  },
  image: {
    width: 100,
    height: 100,
    backgroundColor: appColors.gray,
    objectFit: 'cover',
    borderWidth: 1,
    borderRadius: 50,
    alignSelf: 'center',
  },
  pickImageText: {
    color: appColors.primary,
    fontSize: 16,
  },
  input: {
    
    width: '90%',
    height: 50,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: appColors.gray, // hoặc appColors.primary nếu không báo lỗi
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    color: appColors.text ?? '#000', // fallback nếu appColors.text bị undefined
    backgroundColor: '#fff', // đảm bảo không bị trắng chữ trên trắng nền
    marginBottom: 15,
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