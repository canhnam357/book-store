import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/api';
import { toast } from 'react-toastify';

export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/cart');
      console.log('Fetch cart response:', response.data);
      if (response.status === 200 && response.data.result) {
        return response.data.result.cartItemList || [];
      }
      throw new Error(response.data.message || 'Không thể lấy thông tin giỏ hàng!');
    } catch (error) {
      console.error('Fetch cart error:', error.response?.data || error);
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi lấy thông tin giỏ hàng!');
    }
  }
);

export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async ({ bookId, quantity }, { rejectWithValue }) => {
    try {
      const response = await api.post('/cart/add-to-cart', { bookId, quantity });
      console.log('Add to cart response:', response.data);
      if (response.status === 200 && response.data.result) {
        return response.data.result.cartItemList || [];
      }
      throw new Error(response.data.message || 'Không thể thêm vào giỏ hàng!');
    } catch (error) {
      console.error('Add to cart error:', error.response?.data || error);
      if (error.response?.status === 422) {
        if (error.response.data.message.includes('quantity <= 0')) {
          return rejectWithValue('Số lượng phải lớn hơn 0!');
        } else if (error.response.data.message.includes('quantity > instock')) {
          return rejectWithValue('Số lượng vượt quá hàng tồn kho!');
        }
      }
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi thêm vào giỏ hàng!');
    }
  }
);

export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart',
  async (bookId, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/cart/${bookId}`);
      console.log('Remove from cart response:', response.data);
      if (response.status === 200) {
        return bookId;
      }
      throw new Error(response.data.message || 'Không thể xóa sản phẩm khỏi giỏ hàng!');
    } catch (error) {
      console.error('Remove from cart error:', error.response?.data || error);
      if (error.response?.status === 404) {
        return rejectWithValue('Sản phẩm không có trong giỏ hàng!');
      }
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi xóa sản phẩm khỏi giỏ hàng!');
    }
  }
);

export const changeQuantity = createAsyncThunk(
  'cart/changeQuantity',
  async ({ bookId, delta }, { rejectWithValue }) => {
    try {
      const response = await api.post('/cart/change-quantity', { bookId, quantity: delta });
      console.log('Change quantity response:', response.data);
      if (response.status === 200 && response.data.result) {
        return response.data.result;
      }
      throw new Error(response.data.message || 'Không thể thay đổi số lượng!');
    } catch (error) {
      console.error('Change quantity error:', error.response?.data || error);
      if (error.response?.status === 404) {
        return rejectWithValue('Sản phẩm không có trong giỏ hàng!');
      }
      if (error.response?.status === 422) {
        return rejectWithValue('Số lượng không hợp lệ!');
      }
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi thay đổi số lượng!');
    }
  }
);

export const updateQuantity = createAsyncThunk(
  'cart/updateQuantity',
  async ({ bookId, quantity }, { rejectWithValue }) => {
    try {
      const response = await api.post('/cart/update-quantity', { bookId, quantity });
      console.log('Update quantity response:', response.data);
      if (response.status === 200 && response.data.result) {
        return response.data.result;
      }
      throw new Error(response.data.message || 'Không thể cập nhật số lượng!');
    } catch (error) {
      console.error('Update quantity error:', error.response?.data || error);
      if (error.response?.status === 404) {
        return rejectWithValue('Sản phẩm không có trong giỏ hàng!');
      }
      if (error.response?.status === 422) {
        return rejectWithValue('Số lượng không hợp lệ!');
      }
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi cập nhật số lượng!');
    }
  }
);

export const createOrder = createAsyncThunk(
  'cart/createOrder',
  async ({ bookIds, addressId, paymentMethod }, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.post('/create-order', { bookIds, addressId, paymentMethod });
      console.log('Create order response:', response.data);
      if (response.status === 201 && response.data.result) {
        return response.data.result; // Nếu paymentMethod là CARD, result sẽ là URL VNPAY
      }
      throw new Error(response.data.message || 'Không thể tạo đơn hàng!');
    } catch (error) {
      console.error('Create order error:', error.response?.data || error);
      if (error.response?.status === 403) {
        return rejectWithValue('Tài khoản của bạn bị khóa hoặc chưa xác thực!');
      }
      if (error.response?.status === 404 && error.response?.data?.message?.includes('addressId')) {
        return rejectWithValue('Địa chỉ không tồn tại!');
      }
      if (error.response?.status === 404 && error.response?.data?.message?.includes('paymentMethod')) {
        return rejectWithValue('Phương thức thanh toán không hợp lệ!');
      }
      if (error.response?.status === 422 && error.response?.data?.message?.includes('cart is empty')) {
        return rejectWithValue('Giỏ hàng của bạn đang rỗng!');
      }
      if (error.response?.status === 409) {
        await dispatch(fetchCart());
        return rejectWithValue(error.response?.data?.message);
      }
      if (error.response?.status === 422 && error.response?.data?.message?.includes('at least 1 product')) {
        return rejectWithValue('Vui lòng chọn ít nhất một sản phẩm để thanh toán!');
      }
      if (error.response?.status === 500) {
        return rejectWithValue('Lỗi server khi tạo đơn hàng!');
      }
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi tạo đơn hàng!');
    }
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    cartItems: [],
    totalCartPrice: 0,
    loading: false,
    error: null,
  },
  reducers: {
    clearCart: (state) => {
      state.cartItems = [];
      state.totalCartPrice = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Cart
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cartItems = Array.isArray(action.payload) ? action.payload : [];
        state.totalCartPrice = state.cartItems.reduce((total, item) => total + (item.totalPrice || 0), 0);
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.cartItems = [];
        state.totalCartPrice = 0;
        toast.error(action.payload);
      })
      // Add to Cart
      .addCase(addToCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cartItems = Array.isArray(action.payload) ? action.payload : [];
        state.totalCartPrice = state.cartItems.reduce((total, item) => total + (item.totalPrice || 0), 0);
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })
      // Remove from Cart
      .addCase(removeFromCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.loading = false;
        const bookId = action.payload;
        state.cartItems = state.cartItems.filter((item) => item.bookId !== bookId);
        state.totalCartPrice = state.cartItems.reduce((total, item) => total + (item.totalPrice || 0), 0);
        toast.success('Đã xóa sản phẩm khỏi giỏ hàng!');
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })
      // Change Quantity
      .addCase(changeQuantity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(changeQuantity.fulfilled, (state, action) => {
        state.loading = false;
        const updatedItem = action.payload;
        const itemIndex = state.cartItems.findIndex((item) => item.bookId === updatedItem.bookId);
        if (itemIndex !== -1) {
          state.cartItems[itemIndex] = updatedItem;
        }
        state.totalCartPrice = state.cartItems.reduce((total, item) => total + (item.totalPrice || 0), 0);
      })
      .addCase(changeQuantity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })
      // Update Quantity
      .addCase(updateQuantity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateQuantity.fulfilled, (state, action) => {
        state.loading = false;
        const updatedItem = action.payload;
        const itemIndex = state.cartItems.findIndex((item) => item.bookId === updatedItem.bookId);
        if (itemIndex !== -1) {
          state.cartItems[itemIndex] = updatedItem;
        }
        state.totalCartPrice = state.cartItems.reduce((total, item) => total + (item.totalPrice || 0), 0);
      })
      .addCase(updateQuantity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })
      // Create Order
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.cartItems = [];
        state.totalCartPrice = 0;
        toast.success('Đặt hàng thành công!');
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      });
  },
});

export const { clearCart } = cartSlice.actions;
export default cartSlice.reducer;