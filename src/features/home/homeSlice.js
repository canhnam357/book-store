import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/api';
import { toast } from 'react-toastify';

export const fetchNewArrivals = createAsyncThunk(
  'home/fetchNewArrivals',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/books/new_arrivals');
      console.log('Fetch new arrivals response:', response.data);
      if (response.status === 200 && response.data.result) {
        return response.data.result;
      }
      throw new Error(response.data.message || 'Không thể lấy sách mới!');
    } catch (error) {
      console.error('Fetch new arrivals error:', error.response?.data || error);
      if (error.response?.status === 500) {
        return rejectWithValue('Lỗi server khi lấy sách mới!');
      }
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi lấy sách mới!');
    }
  }
);

export const fetchHighRatedBooks = createAsyncThunk(
  'home/fetchHighRatedBooks',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/books/high_rating');
      console.log('Fetch high rated books response:', response.data);
      if (response.status === 200 && response.data.result) {
        return response.data.result;
      }
      throw new Error(response.data.message || 'Không thể lấy sách đánh giá cao!');
    } catch (error) {
      console.error('Fetch high rated books error:', error.response?.data || error);
      if (error.response?.status === 500) {
        return rejectWithValue('Lỗi server khi lấy sách đánh giá cao!');
      }
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi lấy sách đánh giá cao!');
    }
  }
);

export const fetchMostPopularBooks = createAsyncThunk(
  'home/fetchMostPopularBooks',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/books/most_popular');
      console.log('Fetch most popular books response:', response.data);
      if (response.status === 200 && response.data.result) {
        return response.data.result;
      }
      throw new Error(response.data.message || 'Không thể lấy sách bán chạy!');
    } catch (error) {
      console.error('Fetch most popular books error:', error.response?.data || error);
      if (error.response?.status === 500) {
        return rejectWithValue('Lỗi server khi lấy sách bán chạy!');
      }
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi lấy sách bán chạy!');
    }
  }
);

export const fetchDiscountBooks = createAsyncThunk(
  'home/fetchDiscountBooks',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/books/discount_books');
      console.log('Fetch discount books response:', response.data);
      if (response.status === 200 && response.data.result) {
        return response.data.result;
      }
      throw new Error(response.data.message || 'Không thể lấy sách khuyến mãi!');
    } catch (error) {
      console.error('Fetch discount books error:', error.response?.data || error);
      if (error.response?.status === 500) {
        return rejectWithValue('Lỗi server khi lấy sách khuyến mãi!');
      }
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi lấy sách khuyến mãi!');
    }
  }
);

export const fetchTopCategories = createAsyncThunk(
  'home/fetchTopCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/books/category_most_sold');
      console.log('Fetch top categories response:', response.data);
      if (response.status === 200 && response.data.result) {
        return response.data.result;
      }
      throw new Error(response.data.message || 'Không thể lấy danh mục hàng đầu!');
    } catch (error) {
      console.error('Fetch top categories error:', error.response?.data || error);
      if (error.response?.status === 500) {
        return rejectWithValue('Lỗi server khi lấy danh mục hàng đầu!');
      }
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi lấy danh mục hàng đầu!');
    }
  }
);

const homeSlice = createSlice({
  name: 'home',
  initialState: {
    newArrivals: [],
    highRated: [],
    mostPopular: [],
    discountBooks: [],
    topCategories: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch New Arrivals
      .addCase(fetchNewArrivals.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNewArrivals.fulfilled, (state, action) => {
        state.loading = false;
        state.newArrivals = action.payload || [];
      })
      .addCase(fetchNewArrivals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })
      // Fetch High Rated Books
      .addCase(fetchHighRatedBooks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHighRatedBooks.fulfilled, (state, action) => {
        state.loading = false;
        state.highRated = action.payload || [];
      })
      .addCase(fetchHighRatedBooks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })
      // Fetch Most Popular Books
      .addCase(fetchMostPopularBooks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMostPopularBooks.fulfilled, (state, action) => {
        state.loading = false;
        state.mostPopular = action.payload || [];
      })
      .addCase(fetchMostPopularBooks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })
      // Fetch Discount Books
      .addCase(fetchDiscountBooks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDiscountBooks.fulfilled, (state, action) => {
        state.loading = false;
        state.discountBooks = action.payload || [];
      })
      .addCase(fetchDiscountBooks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })
      // Fetch Top Categories
      .addCase(fetchTopCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTopCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.topCategories = action.payload || [];
      })
      .addCase(fetchTopCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      });
  },
});

export default homeSlice.reducer;