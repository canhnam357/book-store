import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/auth/authSlice';
import bookReducer from './features/book/bookSlice';
import cartReducer from './features/cart/cartSlice';
import addressReducer from './features/addresses/addressSlice';
import orderReducer from './features/orders/orderSlice';
import homeReducer from './features/home/homeSlice';
import changePasswordReducer from './features/change-password/changePasswordSlice'; // Fixed path
import profileReducer from './features/profile/profileSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    book: bookReducer,
    cart: cartReducer,
    addresses: addressReducer,
    orders: orderReducer,
    home: homeReducer,
    changePassword: changePasswordReducer,
    profile: profileReducer,
  },
});