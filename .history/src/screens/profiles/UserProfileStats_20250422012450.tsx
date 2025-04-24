import axiosClient from '../../apis/axiosClient'; // Your configured axios instance
import { useSelector } from 'react-redux';
import { authSelector } from '../../redux/reducers/authReducer'; // Adjust the import path as necessary
import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';

const UserProfileStats = () => {
  const authData = useSelector(authSelector);
  const userId = authData.id; // Get the logged-in user's ID

  const [stats, setStats] = useState<{ completedOrdersCount: number; totalCompletedAmount: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setError("User ID not found.");
      setLoading(false);
      return;
    }

    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      try {
        // Make sure the path matches your route definition, including any base path like '/api'
        const response = await axiosClient.get(`/order/status/${userId}`);
        if (response) {
          setStats(response);
        } else {
          // Handle cases where data might be unexpectedly empty
           setStats({ completedOrdersCount: 0, totalCompletedAmount: 0 });
        }
      } catch (err: any) {
        console.error("Error fetching user stats:", err);
        setError(err.response?.data?.message || "Failed to load statistics.");
        setStats(null); // Clear stats on error
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [userId]); // Re-run if userId changes

  if (loading) {
    return <ActivityIndicator size="large" />;
  }

  if (error) {
    return <Text style={{ color: 'red', textAlign: 'center' }}>Error: {error}</Text>;
  }

  return (
    <View style={{ padding: 15, alignItems: 'center' }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>Thống kê đơn hàng đã hoàn thành</Text>
      {stats ? (
        <>
          <Text>Tổng số đơn hàng: {stats.completedOrdersCount}</Text>
          <Text>Tổng chi tiêu: {stats.totalCompletedAmount.toLocaleString()} đ</Text>
        </>
      ) : (
        <Text>Không có dữ liệu thống kê.</Text>
      )}
    </View>
  );
};

export default UserProfileStats;
