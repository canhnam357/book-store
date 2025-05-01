import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/api';

export const fetchPriceRange = createAsyncThunk(
  'book/fetchPriceRange',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/books/price-range');
      if (response.status === 200) {
        return response.data.result;
      }
      return rejectWithValue('Không thể lấy khoảng giá!');
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchCategories = createAsyncThunk(
  'book/fetchCategories',
  async (keyword = '', { rejectWithValue }) => {
    try {
      const response = await api.get('/categories', { params: { keyword } });
      if (response.status === 200) {
        return response.data.result;
      }
      return rejectWithValue('Không thể lấy danh sách danh mục!');
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchAuthors = createAsyncThunk(
  'book/fetchAuthors',
  async (keyword = '', { rejectWithValue }) => {
    try {
      const response = await api.get('/authors', { params: { keyword } });
      if (response.status === 200) {
        return response.data.result;
      }
      return rejectWithValue('Không thể lấy danh sách tác giả!');
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchPublishers = createAsyncThunk(
  'book/fetchPublishers',
  async (keyword = '', { rejectWithValue }) => {
    try {
      const response = await api.get('/publishers', { params: { keyword } });
      if (response.status === 200) {
        return response.data.result;
      }
      return rejectWithValue('Không thể lấy danh sách nhà xuất bản!');
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchDistributors = createAsyncThunk(
  'book/fetchDistributors',
  async (keyword = '', { rejectWithValue }) => {
    try {
      const response = await api.get('/distributors', { params: { keyword } });
      if (response.status === 200) {
        return response.data.result;
      }
      return rejectWithValue('Không thể lấy danh sách nhà phát hành!');
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchBooks = createAsyncThunk(
  'book/fetchBooks',
  async (filters, { rejectWithValue }) => {
    try {
      const response = await api.get('/books', { params: filters });
      if (response.status === 200) {
        return response.data.result;
      }
      return rejectWithValue('Không thể lấy danh sách sách!');
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchBookDetail = createAsyncThunk(
  'book/fetchBookDetail',
  async (bookId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/books/${bookId}`);
      if (response.status === 200) {
        const bookData = response.data.result;
        bookData.rating = bookData.rating ?? 0;
        return bookData;
      }
      return rejectWithValue('Không thể lấy chi tiết sách!');
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchReviews = createAsyncThunk(
  'book/fetchReviews',
  async ({ bookId, index = 1, size = 10, rating = 0 }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/reviews/${bookId}`, {
        params: { index, size, rating },
      });
      if (response.status === 200) {
        const reviewData = response.data.result;
        reviewData.content = reviewData.content.map((review) => ({
          ...review,
          rating: review.rating ?? 0,
        }));
        return reviewData;
      }
      return rejectWithValue('Không thể lấy danh sách đánh giá!');
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createReview = createAsyncThunk(
  'book/createReview',
  async ({ bookId, content, rating }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/reviews/${bookId}`, { content, rating });
      if (response.status === 200 || response.status === 201) {
        const reviewData = response.data.result;
        reviewData.rating = reviewData.rating ?? 0;
        return reviewData;
      }
      return rejectWithValue('Không thể tạo đánh giá!');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi tạo đánh giá!');
    }
  }
);

export const updateReview = createAsyncThunk(
  'book/updateReview',
  async ({ reviewId, content, rating }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/reviews/${reviewId}`, { content, rating });
      if (response.status === 200) {
        const updatedReview = response.data.result;
        updatedReview.rating = updatedReview.rating ?? 0;
        return updatedReview;
      }
      return rejectWithValue('Không thể cập nhật đánh giá!');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi cập nhật đánh giá!');
    }
  }
);

export const deleteReview = createAsyncThunk(
  'book/deleteReview',
  async (reviewId, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/reviews/${reviewId}`);
      if (response.status === 200) {
        return reviewId;
      }
      return rejectWithValue('Không thể xóa đánh giá!');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi xóa đánh giá!');
    }
  }
);

const bookSlice = createSlice({
  name: 'book',
  initialState: {
    priceRange: [],
    categories: [],
    authors: [],
    publishers: [],
    distributors: [],
    books: [],
    bookDetail: null,
    reviews: [],
    totalPages: 1,
    currentPage: 1,
    totalElements: 0,
    totalReviewPages: 1,
    currentReviewPage: 1,
    totalReviews: 0,
    loading: false,
    error: null,
  },
  reducers: {
    clearFilters: (state) => {
      state.books = [];
      state.totalPages = 1;
      state.currentPage = 1;
      state.totalElements = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Price Range
      .addCase(fetchPriceRange.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPriceRange.fulfilled, (state, action) => {
        state.loading = false;
        state.priceRange = action.payload;
      })
      .addCase(fetchPriceRange.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Categories
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Authors
      .addCase(fetchAuthors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAuthors.fulfilled, (state, action) => {
        state.loading = false;
        state.authors = action.payload;
      })
      .addCase(fetchAuthors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Publishers
      .addCase(fetchPublishers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPublishers.fulfilled, (state, action) => {
        state.loading = false;
        state.publishers = action.payload;
      })
      .addCase(fetchPublishers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Distributors
      .addCase(fetchDistributors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDistributors.fulfilled, (state, action) => {
        state.loading = false;
        state.distributors = action.payload;
      })
      .addCase(fetchDistributors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Books
      .addCase(fetchBooks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBooks.fulfilled, (state, action) => {
        state.loading = false;
        state.books = action.payload.content;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.number + 1;
        state.totalElements = action.payload.totalElements;
      })
      .addCase(fetchBooks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Book Detail
      .addCase(fetchBookDetail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBookDetail.fulfilled, (state, action) => {
        state.loading = false;
        state.bookDetail = action.payload;
      })
      .addCase(fetchBookDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Reviews
      .addCase(fetchReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews = action.payload.content;
        state.totalReviewPages = action.payload.totalPages;
        state.currentReviewPage = action.payload.number + 1;
        state.totalReviews = action.payload.totalElements;
      })
      .addCase(fetchReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Review
      .addCase(createReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createReview.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews.unshift(action.payload); // Thêm review mới vào đầu danh sách
        state.totalReviews += 1;
      })
      .addCase(createReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Review
      .addCase(updateReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateReview.fulfilled, (state, action) => {
        state.loading = false;
        const updatedReview = action.payload;
        const reviewIndex = state.reviews.findIndex((review) => review.reviewId === updatedReview.reviewId);
        if (reviewIndex !== -1) {
          state.reviews[reviewIndex] = updatedReview;
        }
      })
      .addCase(updateReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete Review
      .addCase(deleteReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteReview.fulfilled, (state, action) => {
        state.loading = false;
        const reviewId = action.payload;
        state.reviews = state.reviews.filter((review) => review.reviewId !== reviewId);
        state.totalReviews -= 1;
      })
      .addCase(deleteReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearFilters } = bookSlice.actions;
export default bookSlice.reducer;