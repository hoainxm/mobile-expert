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
        // Initialize stats, perhaps to zero or null depending on preference
        setStats({ completedOrdersCount: 0, totalCompletedAmount: 0 });

        try {
            // Call the API endpoint
            const response = await axiosClient.get(`/order/status/${userId}`);

            // Handle successful response with data
            console.log("User stats response (Success):", response);
            if (response && response.result) {
                setStats({
                    completedOrdersCount: response.result.completedOrdersCount || 0,
                    totalCompletedAmount: response.result.totalCompletedAmount || 0,
                });
            } else {
                // Handle successful response but missing 'result' data
                console.warn("User stats response received, but 'result' field is missing or invalid:", response);
                setStats({ completedOrdersCount: 0, totalCompletedAmount: 0 });
            }

        } catch (err: any) {
            console.error("Error fetching user stats:", err);

            // Check if the error has a response from the server
            if (err.response) {
                console.error("Error response data:", err.response.data);
                console.error("Error response status:", err.response.status);

                // --- Specifically handle the "Not Found" case ---
                // Assuming backend returns 404 and this specific message
                if (
                    err.response.status === 404 &&
                    err.response.data?.message === "Không tìm thấy đơn hàng của người dùng này" // Adjust message if needed
                ) {
                    // This is not a critical error, just means no orders found
                    console.log("User has no order history, setting stats to zero.");
                    setStats({ completedOrdersCount: 0, totalCompletedAmount: 0 });
                    setError(null); // Clear any potential error state
                } else {
                    // --- Handle other server errors (500, 403, 401, etc.) ---
                    const errorMessage = err.response.data?.message || "Failed to load statistics due to a server error.";
                    setError(errorMessage);
                    setStats(null); // Indicate an error state by setting stats to null
                }
            } else if (err.request) {
                // Handle network errors (no response received)
                console.error("Error request:", err.request);
                setError("Could not connect to the server.");
                setStats(null);
            } else {
                // Handle errors setting up the request
                console.error('Error message:', err.message);
                setError("An error occurred while making the request.");
                setStats(null);
            }
        } finally {
            setLoading(false); // Always stop loading indicator
        }
    };

    fetchStats();
  }, [userId]); // Dependency array remains the same


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
