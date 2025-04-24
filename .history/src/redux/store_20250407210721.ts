import { configureStore } from '@reduxjs/toolkit';
import { authReducer } from './reducers/authReducer';
import favoritesReducer from './reducers/favoritesReducer';

const store = configureStore({
  reducer: {
    authReducer,
    favorites: favoritesReducer,
  },
});

export default store;
