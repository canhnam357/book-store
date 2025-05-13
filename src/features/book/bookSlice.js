import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/api';
import { toast } from 'react-toastify';

export const fetchPriceRange = createAsyncThunk(
  'book/fetchPriceRange',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/books/price-range');
      console.log('Fetch price range response:', response.data);
      if (response.status === 200 && response.data.result) {
        return response.data.result;
      }
      throw new Error(response.data.message || 'Không thể lấy khoảng giá!');
    } catch (error) {
      console.error('Fetch price range error:', error.response?.data || error);
      return rejectWithValue(error.response?.data?.message || 'Không thể lấy khoảng giá!');
    }
  }
);

export const fetchCategories = createAsyncThunk(
  'book/fetchCategories',
  async (keyword = '', { dispatch, getState, rejectWithValue }) => {
    const state = getState().book;
    const newRequestId = state.currentCategoryRequestId + 1;
    dispatch(setCategoryRequestId(newRequestId));
    try {
      const response = await api.get('/categories', { params: { keyword } });
      console.log('Fetch categories response:', response.data);
      if (response.status === 200 && response.data.result) {
        return { data: response.data.result, requestId: newRequestId };
      }
      throw new Error(response.data.message || 'Không thể lấy danh sách danh mục!');
    } catch (error) {
      console.error('Fetch categories error:', error.response?.data || error);
      return rejectWithValue(error.response?.data?.message || 'Không thể lấy danh sách danh mục!');
    }
  }
);

export const fetchAuthors = createAsyncThunk(
  'book/fetchAuthors',
  async (keyword = '', { dispatch, getState, rejectWithValue }) => {
    const state = getState().book;
    const newRequestId = state.currentAuthorRequestId + 1;
    dispatch(setAuthorRequestId(newRequestId));
    try {
      const response = await api.get('/authors', { params: { keyword } });
      console.log('Fetch authors response:', response.data);
      if (response.status === 200 && response.data.result) {
        return { data: response.data.result, requestId: newRequestId };
      }
      throw new Error(response.data.message || 'Không thể lấy danh sách tác giả!');
    } catch (error) {
      console.error('Fetch authors error:', error.response?.data || error);
      return rejectWithValue(error.response?.data?.message || 'Không thể lấy danh sách tác giả!');
    }
  }
);

export const fetchPublishers = createAsyncThunk(
  'book/fetchPublishers',
  async (keyword = '', { dispatch, getState, rejectWithValue }) => {
    const state = getState().book;
    const newRequestId = state.currentPublisherRequestId + 1;
    dispatch(setPublisherRequestId(newRequestId));
    try {
      const response = await api.get('/publishers', { params: { keyword } });
      console.log('Fetch publishers response:', response.data);
      if (response.status === 200 && response.data.result) {
        return { data: response.data.result, requestId: newRequestId };
      }
      throw new Error(response.data.message || 'Không thể lấy danh sách nhà xuất bản!');
    } catch (error) {
      console.error('Fetch publishers error:', error.response?.data || error);
      return rejectWithValue(error.response?.data?.message || 'Không thể lấy danh sách nhà xuất bản!');
    }
  }
);

export const fetchDistributors = createAsyncThunk(
  'book/fetchDistributors',
  async (keyword = '', { dispatch, getState, rejectWithValue }) => {
    const state = getState().book;
    const newRequestId = state.currentDistributorRequestId + 1;
    dispatch(setDistributorRequestId(newRequestId));
    try {
      const response = await api.get('/distributors', { params: { keyword } });
      console.log('Fetch distributors response:', response.data);
      if (response.status === 200 && response.data.result) {
        return { data: response.data.result, requestId: newRequestId };
      }
      throw new Error(response.data.message || 'Không thể lấy danh sách nhà phát hành!');
    } catch (error) {
      console.error('Fetch distributors error:', error.response?.data || error);
      return rejectWithValue(error.response?.data?.message || 'Không thể lấy danh sách nhà phát hành!');
    }
  }
);

export const fetchBooks = createAsyncThunk(
  'book/fetchBooks',
  async (filters, { dispatch, getState, rejectWithValue }) => {
    const state = getState().book;
    const newRequestId = state.currentBooksRequestId + 1;
    dispatch(setBooksRequestId(newRequestId));
    try {
      const response = await api.get('/books', { params: filters });
      console.log('Fetch books response:', response.data);
      if (response.status === 200 && response.data.result) {
        return { data: response.data.result, requestId: newRequestId };
      }
      throw new Error(response.data.message || 'Không thể lấy danh sách sách!');
    } catch (error) {
      console.error('Fetch books error:', error.response?.data || error);
      return rejectWithValue(error.response?.data?.message || 'Không thể lấy danh sách sách!');
    }
  }
);

export const fetchBookDetail = createAsyncThunk(
  'book/fetchBookDetail',
  async (bookId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/books/${bookId}`);
      console.log('Fetch book detail response:', response.data);
      if (response.status === 200 && response.data.result) {
        const bookData = response.data.result;
        bookData.rating = bookData.rating ?? 0;
        return bookData;
      }
      throw new Error(response.data.message || 'Không thể lấy chi tiết sách!');
    } catch (error) {
      console.error('Fetch book detail error:', error.response?.data || error);
      return rejectWithValue(error.response?.data?.message || 'Không thể lấy chi tiết sách!');
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
      console.log('Fetch reviews response:', response.data);
      if (response.status === 200 && response.data.result) {
        const reviewData = response.data.result;
        reviewData.content = reviewData.content.map((review) => ({
          ...review,
          rating: review.rating ?? 0,
        }));
        return reviewData;
      }
      throw new Error(response.data.message || 'Không thể lấy danh sách đánh giá!');
    } catch (error) {
      console.error('Fetch reviews error:', error.response?.data || error);
      return rejectWithValue(error.response?.data?.message || 'Không thể lấy danh sách đánh giá!');
    }
  }
);

export const createReview = createAsyncThunk(
  'book/createReview',
  async ({ bookId, content, rating }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/reviews/${bookId}`, { content, rating });
      console.log('Create review response:', response.data);
      if (response.status === 201 && response.data.result) {
        const reviewData = response.data.result;
        reviewData.rating = reviewData.rating ?? 0;
        return reviewData;
      }
      throw new Error(response.data.message || 'Không thể tạo đánh giá!');
    } catch (error) {
      console.error('Create review error:', error.response?.data || error);
      return rejectWithValue(error.response?.data?.message || 'Không thể tạo đánh giá!');
    }
  }
);

export const updateReview = createAsyncThunk(
  'book/updateReview',
  async ({ reviewId, content, rating }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/reviews/${reviewId}`, { content, rating });
      console.log('Update review response:', response.data);
      if (response.status === 200 && response.data.result) {
        const updatedReview = response.data.result;
        updatedReview.rating = updatedReview.rating ?? 0;
        return updatedReview;
      }
      throw new Error(response.data.message || 'Không thể cập nhật đánh giá!');
    } catch (error) {
      console.error('Update review error:', error.response?.data || error);
      return rejectWithValue(error.response?.data?.message || 'Không thể cập nhật đánh giá!');
    }
  }
);

export const deleteReview = createAsyncThunk(
  'book/deleteReview',
  async (reviewId, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/reviews/${reviewId}`);
      console.log('Delete review response:', response.data);
      if (response.status === 200) {
        return reviewId;
      }
      throw new Error(response.data.message || 'Không thể xóa đánh giá!');
    } catch (error) {
      console.error('Delete review error:', error.response?.data || error);
      return rejectWithValue(error.response?.data?.message || 'Không thể xóa đánh giá!');
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
    currentCategoryRequestId: 0,
    currentAuthorRequestId: 0,
    currentPublisherRequestId: 0,
    currentDistributorRequestId: 0,
    currentBooksRequestId: 0,
    categoryLoading: false,
    authorLoading: false,
    publisherLoading: false,
    distributorLoading: false,
    booksLoading: false,
  },
  reducers: {
    clearFilters: (state) => {
      state.books = [];
      state.totalPages = 1;
      state.currentPage = 1;
      state.totalElements = 0;
    },
    setCategoryRequestId: (state, action) => {
      state.currentCategoryRequestId = action.payload;
    },
    setAuthorRequestId: (state, action) => {
      state.currentAuthorRequestId = action.payload;
    },
    setPublisherRequestId: (state, action) => {
      state.currentPublisherRequestId = action.payload;
    },
    setDistributorRequestId: (state, action) => {
      state.currentDistributorRequestId = action.payload;
    },
    setBooksRequestId: (state, action) => {
      state.currentBooksRequestId = action.payload;
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
        toast.error(action.payload);
      })
      // Fetch Categories
      .addCase(fetchCategories.pending, (state) => {
        state.categoryLoading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        const { data, requestId } = action.payload;
        if (requestId === state.currentCategoryRequestId) {
          state.categories = data;
        }
        state.categoryLoading = false;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.categoryLoading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })
      // Fetch Authors
      .addCase(fetchAuthors.pending, (state) => {
        state.authorLoading = true;
        state.error = null;
      })
      .addCase(fetchAuthors.fulfilled, (state, action) => {
        const { data, requestId } = action.payload;
        if (requestId === state.currentAuthorRequestId) {
          state.authors = data;
        }
        state.authorLoading = false;
      })
      .addCase(fetchAuthors.rejected, (state, action) => {
        state.authorLoading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })
      // Fetch Publishers
      .addCase(fetchPublishers.pending, (state) => {
        state.publisherLoading = true;
        state.error = null;
      })
      .addCase(fetchPublishers.fulfilled, (state, action) => {
        const { data, requestId } = action.payload;
        if (requestId === state.currentPublisherRequestId) {
          state.publishers = data;
        }
        state.publisherLoading = false;
      })
      .addCase(fetchPublishers.rejected, (state, action) => {
        state.publisherLoading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })
      // Fetch Distributors
      .addCase(fetchDistributors.pending, (state) => {
        state.distributorLoading = true;
        state.error = null;
      })
      .addCase(fetchDistributors.fulfilled, (state, action) => {
        const { data, requestId } = action.payload;
        if (requestId === state.currentDistributorRequestId) {
          state.distributors = data;
        }
        state.distributorLoading = false;
      })
      .addCase(fetchDistributors.rejected, (state, action) => {
        state.distributorLoading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })
      // Fetch Books
      .addCase(fetchBooks.pending, (state) => {
        state.booksLoading = true;
        state.error = null;
      })
      .addCase(fetchBooks.fulfilled, (state, action) => {
        const { data, requestId } = action.payload;
        if (requestId === state.currentBooksRequestId) {
          state.books = data.content;
          state.totalPages = data.totalPages;
          state.currentPage = data.number + 1;
          state.totalElements = data.totalElements;
        }
        state.booksLoading = false;
      })
      .addCase(fetchBooks.rejected, (state, action) => {
        state.booksLoading = false;
        state.error = action.payload;
        toast.error(action.payload);
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
        toast.error(action.payload);
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
        toast.error(action.payload);
      })
      // Create Review
      .addCase(createReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createReview.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews.unshift(action.payload);
        state.totalReviews += 1;
        toast.success('Tạo đánh giá thành công!');
      })
      .addCase(createReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
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
        toast.success('Cập nhật đánh giá thành công!');
      })
      .addCase(updateReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
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
        toast.success('Xóa đánh giá thành công!');
      })
      .addCase(deleteReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      });
  },
});

export const {
  clearFilters,
  setCategoryRequestId,
  setAuthorRequestId,
  setPublisherRequestId,
  setDistributorRequestId,
  setBooksRequestId,
} = bookSlice.actions;
export default bookSlice.reducer;