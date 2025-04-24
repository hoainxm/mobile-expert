import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Product {
    _id: string;
    name: string;
    price: number;
    image: string;
}

interface FavoriteState {
    favorites: Product[]; // Lưu danh sách sản phẩm yêu thích
}

const initialState: FavoriteState = {
    favorites: [],
};

const favoritesSlice = createSlice({
    name: 'favorites',
    initialState,
    reducers: {
        addFavorite: (state, action: PayloadAction<Product>) => {
            // Kiểm tra nếu sản phẩm chưa có trong danh sách yêu thích
            if (!state.favorites.find((product) => product._id === action.payload._id)) {
                state.favorites.push(action.payload);
            }
        },
        removeFavorite: (state, action: PayloadAction<string>) => {
            // Xóa sản phẩm khỏi danh sách yêu thích dựa trên _id
            state.favorites = state.favorites.filter((product) => product._id !== action.payload);
        },
    },
});

export const { addFavorite, removeFavorite } = favoritesSlice.actions;
export default favoritesSlice.reducer;