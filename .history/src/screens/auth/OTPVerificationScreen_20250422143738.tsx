import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { ButtonComponent } from '../../components';

const OTPVerificationScreen = ({ navigation, route }: any) => {
    const { email } = route.params; // Nhận email từ màn hình trước
    const [codeValues, setCodeValues] = useState<string[]>(['', '', '', '']);
    const [serverOtp, setServerOtp] = useState('');
    const [limit, setLimit] = useState(120); // Đếm ngược thời gian OTP

    const refs = Array.from({ length: 4 }, () => useRef<TextInput>(null));

    useEffect(() => {
        sendOtpToEmail(); // Gửi OTP ngay khi vào màn hình
    }, []);
    const handleupdateProfile = async (profile: any) => {
        try {
            const response = await axios.post('http://10.0.2.2:3001/users/update-profile', profile);
            if (response.status === 200) {
                Alert.alert('Thành công', 'Cập nhật thông tin thành công!');
                navigation.navigate('ProfileScreen'); //
            } else {
                Alert.alert('Lỗi', 'Không thể cập nhật thông tin!');

            }
        } catch (error) {
            console.error('❌ Lỗi khi cập nhật thông tin:', error);
            Alert.alert('Lỗi', 'Không thể cập nhật thông tin!');
        }
    }
    
    
    // Gửi OTP đến email
    const sendOtpToEmail = async () => {
        try {
            const response = await axios.post('http://10.0.2.2:3001/auth/verification', { email });

            if (response.status === 200) {
                setServerOtp(response.data.data.code.toString());
                Alert.alert('Thông báo', 'Mã OTP đã được gửi đến email của bạn!');
                setLimit(120); // Reset lại thời gian đếm ngược
            } else {
                Alert.alert('Lỗi', 'Không thể gửi mã OTP!');
            }
        } catch (error) {
            console.error('❌ Lỗi khi gửi OTP:', error);
            Alert.alert('Lỗi', 'Không thể gửi mã OTP!');
        }
    };

    // Đếm ngược thời gian gửi lại OTP
    useEffect(() => {
        if (limit > 0) {
            const timer = setInterval(() => {
                setLimit((prev) => prev - 1);
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [limit]);

    // Xử lý nhập mã OTP
    const handleChangeCode = (val: string, index: number) => {
        const data = [...codeValues];

        if (val.length > 1) {
            return; // Chặn nhập nhiều ký tự
        }

        data[index] = val;
        setCodeValues(data);

        // Chuyển focus sang ô tiếp theo
        if (val !== '' && index < 3) {
            refs[index + 1].current?.focus();
        }

        // Nếu nhập đủ 4 số, kiểm tra ngay
        if (data.join('').length === 4) {
            handleVerification(data.join(''));
        }
    };

    // Xử lý khi nhấn Backspace
    const handleKeyPress = (e: any, index: number) => {
        if (e.nativeEvent.key === 'Backspace' && codeValues[index] === '') {
            if (index > 0) {
                refs[index - 1].current?.focus();
            }
        }
    };

    // Xác nhận OTP
    const handleVerification = (otp: string) => {
        if (otp.length !== 4) {
            Alert.alert('Lỗi', 'Bạn phải nhập đủ 4 chữ số!');
            return;
        }

        if (otp === serverOtp) {
            Alert.alert('Thành công', 'Mã OTP hợp lệ!');
            if (route.params?.updateProfile) {
                handleupdateProfile(route.params);
                navigation.navigate('ProfileScreen'); // Chuyển sang màn hình ProfileScreen
            }
            navigation.goBack(); // Quay lại màn hình trước
        } else {
            Alert.alert('Lỗi', 'Mã OTP không chính xác!');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Xác nhận OTP</Text>
            <Text style={styles.description}>Nhập mã OTP đã gửi đến email {email}</Text>

            <View style={styles.otpContainer}>
                {codeValues.map((val, index) => (
                    <TextInput
                        key={index}
                        ref={refs[index]}
                        keyboardType="number-pad"
                        value={val}
                        style={styles.input}
                        maxLength={1}
                        onChangeText={(text) => handleChangeCode(text, index)}
                        onKeyPress={(e) => handleKeyPress(e, index)}
                        placeholder="-"
                    />
                ))}
            </View>

            <ButtonComponent text='Xác nhận' onPress={() => handleVerification(codeValues.join(''))} type='primary' />

            {limit > 0 ? (
                <Text style={styles.timer}>Gửi lại OTP sau: {limit}s</Text>
            ) : (
                <ButtonComponent text='Gửi lại mã OTP' onPress={sendOtpToEmail} type='primary' />
            )}
        </View>
    );
};

export default OTPVerificationScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    description: {
        fontSize: 16,
        color: '#666',
        marginBottom: 20,
        textAlign: 'center',
    },
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 20,
    },
    input: {
        width: 50,
        height: 50,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        fontSize: 22,
        textAlign: 'center',
        marginHorizontal: 5,
        color: '#333',
        fontWeight: 'bold',
    },
    timer: {
        marginTop: 10,
        color: 'red',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
