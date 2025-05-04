import axiosClient from '../../apis/axiosClient';
import { useSelector } from 'react-redux';
import { authSelector } from '../../redux/reducers/authReducer';
import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const UserProfileStats = () => {
  const authData = useSelector(authSelector);
  const userId = authData.id;

  const [stats, setStats] = useState<{ completedOrdersCount: number; totalCompletedAmount: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setError("Không tìm thấy người dùng.");
      setLoading(false);
      return;
    }

    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      setStats({ completedOrdersCount: 0, totalCompletedAmount: 0 });

      try {
        const response = await axiosClient.get(`/order/status`);
        console.log('Response:', response);
        if (response && response.result) {
          setStats({
            completedOrdersCount: response.result.completedOrdersCount || 0,
            totalCompletedAmount: response.result.totalCompletedAmount || 0,
          });
        } else {
          setStats({ completedOrdersCount: 0, totalCompletedAmount: 0 });
        }
      } catch (err: any) {
        if (err.response?.status === 404) {
          setStats({ completedOrdersCount: 0, totalCompletedAmount: 0 });
        } else {
          const msg = err.response?.data?.message || 'Lỗi khi tải dữ liệu.';
          setError(msg);
          setStats(null);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [userId]);

  if (loading) return <ActivityIndicator size="large" color="#F44336" style={{ marginTop: 20 }} />;
  if (error) return <Text style={styles.errorText}>Lỗi: {error}</Text>;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>📦 Thống kê đơn hàng đã hoàn thành</Text>
      <View style={styles.row}>
        <MaterialIcons name="shopping-bag" size={28} color="#4CAF50" />
        <Text style={styles.label}>Tổng đơn:</Text>
        <Text style={styles.value}>{stats?.completedOrdersCount ?? 0}</Text>
      </View>
      <View style={styles.row}>
        <MaterialIcons name="attach-money" size={28} color="#FF9800" />
        <Text style={styles.label}>Tổng chi tiêu:</Text>
        <Text style={styles.value}>{(stats?.totalCompletedAmount ?? 0).toLocaleString()} đ</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',

    padding: 20,
    borderRadius: 12,
    marginTop:30,
    marginHorizontal: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 6,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
  },
  label: {
    fontSize: 14,
    marginLeft: 10,
    color: '#555',
    flex: 1,
  },
  value: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#222',
  },
  errorText: {
    textAlign: 'center',
    marginTop: 20,
    color: 'red',
    fontSize: 14,
  },
});

export default UserProfileStats;
