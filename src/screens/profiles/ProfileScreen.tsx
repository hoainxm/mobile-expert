import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  TextInput,
  ScrollView,
  Modal,
} from 'react-native';
import {useSelector} from 'react-redux';
import {launchImageLibrary} from 'react-native-image-picker';
import {useNavigation, useRoute} from '@react-navigation/native';
import {Icon} from 'iconsax-react-native';
import {authSelector} from '../../redux/reducers/authReducer';
import axios from 'axios';
import {appColors} from '../../constants/appColors';
import axiosClient from '../../apis/axiosClient';

const EditProfileScreen = () => {
  const authData = useSelector(authSelector);
  const navigation = useNavigation();
  const userId = authData.id;
  const token = authData.accesstoken;

  const [profile, setProfile] = useState<any>({});
  const [image, setImage] = useState<string>('');
  const [modalField, setModalField] = useState<string>('');
  const [modalValue, setModalValue] = useState<string>('');
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(
          `http://10.0.2.2:3001/users/get-profile?uid=${userId}`,
          {
            headers: {Authorization: `Bearer ${token}`},
          },
        );
        setProfile(res.data.data);
        setImage(res.data.data.photoUrl);
      } catch (err) {
        Alert.alert('Lỗi', 'Không thể tải hồ sơ người dùng');
      }
    };
    fetchProfile();
  }, [userId]);

  const handleEdit = (field: string, value: string) => {
    setModalField(field);
    setModalValue(value);
    setModalVisible(true);
  };

  const handleSaveField = async () => {
    try {
      const updatedProfile = {...profile, [modalField]: modalValue};

      // Gửi PUT request lên server
      const res = await axiosClient.put('/users/update-profile', {
        userId: userId,
        ...updatedProfile,
      });

      if (res?.data) {
        setProfile(updatedProfile);
        Alert.alert('Thành công', 'Thông tin đã được cập nhật.');
      } else {
        Alert.alert('Thất bại', 'Không thể cập nhật thông tin.');
      }
    } catch (error) {
      console.error('Lỗi khi cập nhật hồ sơ:', error);
      Alert.alert('Lỗi', 'Không thể cập nhật thông tin.');
    } finally {
      setModalVisible(false);
    }
  };

  const handleImagePick = () => {
    launchImageLibrary({mediaType: 'photo'}, async res => {
      if (!res.didCancel && res.assets && res.assets.length > 0) {
        const asset = res.assets[0];

        const formData = new FormData();
        formData.append('photo', {
          uri: asset.uri,
          type: asset.type ?? 'image/jpeg',
          name: asset.fileName ?? 'photo.jpg',
        } as any);

        formData.append('userId', authData.id);

        try {
          const response = await axios.post(
            'http://10.0.2.2:3001/users/upload-photo',
            formData,
            {
              headers: {
                'Content-Type': 'multipart/form-data',
                // Không thêm Authorization nếu bạn chưa xác nhận backend đang kiểm tra token
              },
            },
          );
          console.log('Upload success:', response.data);
        } catch (err: any) {
          console.error('Upload error:', err);
          Alert.alert('Lỗi', 'Không thể tải ảnh lên');
        }
      }
    });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sửa hồ sơ</Text>
        <TouchableOpacity onPress={() => Alert.alert('Lưu thay đổi')}>
          <Icon name="tick-circle" size={24} color={appColors.primary} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.avatarSection} onPress={handleImagePick}>
        <Image
          source={{uri: image || 'https://via.placeholder.com/100'}}
          style={styles.avatar}
        />
        <Text style={styles.changePhotoText}>Đổi ảnh</Text>
      </TouchableOpacity>

      {[
        {label: 'Tên', key: 'name'},
        {label: 'Ngày sinh', key: 'birthdate'},
        {label: 'Giới tính', key: 'gender'},
        {label: 'Email', key: 'email'},
        {label: 'Mật khẩu', key: 'password'},
        {label: 'Số điện thoại', key: 'phone'},
        {label: 'Địa chỉ', key: 'address'},
      ].map((item, index) => (
        <TouchableOpacity
          key={index}
          style={styles.itemRow}
          onPress={() => handleEdit(item.key, profile[item.key] || '')}>
          <Text style={styles.itemLabel}>{item.label}</Text>
          <Icon name="arrow-right" size={18} color="#888" />
        </TouchableOpacity>
      ))}

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Sửa {modalField}</Text>
            <TextInput
              style={styles.input}
              value={modalValue}
              onChangeText={setModalValue}
              placeholder={`Nhập ${modalField}`}
            />
            <TouchableOpacity
              style={styles.modalSaveButton}
              onPress={handleSaveField}>
              <Text style={styles.modalSaveText}>Lưu</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {backgroundColor: '#f8f8f8', flex: 1, marginTop: 30},
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  headerTitle: {fontSize: 18, fontWeight: 'bold'},
  avatarSection: {
    backgroundColor: '#F7472F',
    paddingVertical: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 8,
    backgroundColor: '#eee',
  },
  changePhotoText: {color: '#fff', fontWeight: 'bold'},
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  itemLabel: {fontSize: 14, color: '#333'},
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    width: '80%',
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: {fontSize: 16, fontWeight: 'bold', marginBottom: 10},
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  modalSaveButton: {
    backgroundColor: '#F7472F',
    padding: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  modalSaveText: {color: '#fff', fontWeight: 'bold'},
});

export default EditProfileScreen;
