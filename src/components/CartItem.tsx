import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Picker,
} from 'react-native';

interface Props {
  name: string;
  price: number;
  imageUrl: string;
  variantOptions: string[];
  onQuantityChange?: (newQty: number) => void;
}

const CartItem: React.FC<Props> = ({
  name,
  price,
  imageUrl,
  variantOptions,
  onQuantityChange,
}) => {
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedVariant, setSelectedVariant] = useState<string>(variantOptions[0]);

  const handleQuantityChange = (val: number) => {
    if (val < 1) return;
    setQuantity(val);
    onQuantityChange?.(val);
  };

  return (
    <View style={styles.container}>
      <Image source={{ uri: imageUrl }} style={styles.image} />
      <View style={styles.info}>
        <Text numberOfLines={1} style={styles.name}>{name}</Text>
        <View style={styles.variantContainer}>
          <Text style={styles.label}>Phân loại:</Text>
          {/* <Picker
            selectedValue={selectedVariant}
            style={styles.picker}
            onValueChange={(itemValue) => setSelectedVariant(itemValue)}
          >
            {variantOptions.map((option, index) => (
              <Picker.Item key={index} label={option} value={option} />
            ))}
          </Picker> */}
        </View>

        <View style={styles.controls}>
          <TouchableOpacity style={styles.button} onPress={() => handleQuantityChange(quantity - 1)}>
            <Text style={styles.buttonText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.quantity}>{quantity}</Text>
          <TouchableOpacity style={styles.button} onPress={() => handleQuantityChange(quantity + 1)}>
            <Text style={styles.buttonText}>+</Text>
          </TouchableOpacity>
          <Text style={styles.price}>{`₫${(price * quantity).toLocaleString()}`}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff'
  },
  image: {
    width: 60,
    height: 60,
    marginRight: 10,
    borderRadius: 4,
  },
  info: {
    flex: 1,
    justifyContent: 'space-between',
  },
  name: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  variantContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
  },
  picker: {
    height: 30,
    flex: 1,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  button: {
    width: 30,
    height: 30,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    marginHorizontal: 5,
  },
  buttonText: {
    fontSize: 18,
  },
  quantity: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  price: {
    color: 'red',
    fontWeight: 'bold',
    marginLeft: 10,
  },
});

export default CartItem;
