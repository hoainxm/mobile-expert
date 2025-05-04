import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ReactNode } from 'react';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface Props {
  title: string;
  onPress: () => void;
  icon?: ReactNode;
  iconName?: string;
}

const RectangleItem: React.FC<Props> = ({ title, onPress,iconName }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.leftSection}>
        {iconName ? (
          <Icon name={iconName} size={24} color="#0078D7" />
        ) : (
          <Icon name="info" size={24} color="#0078D7" /> // Default icon if none is provided
        )}
        {/* Default icon if none is provided */}
        <Text style={styles.title}>{title}</Text>
      </View>
      <Icon name="chevron-right" size={24} color="#888" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 50,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#0078D7',
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 5,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    marginLeft: 8,
    fontSize: 16,
    color: '#000',
  },
});

export default RectangleItem;
