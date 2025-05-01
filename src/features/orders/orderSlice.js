import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/api';

// Lấy danh sách đơn hàng (có phân trang)
export const fetchOrders = createAsyncThunk(
  'orders/fetchOrders',
  async ({ index = 1, size = 10, orderStatus = '' }, { rejectWithValue }) => {
    try {
      const response = await api.get('/order', {
        params: { index, size, orderStatus },
      });
      if (response.status === 200) {
        return response.data.result;
      }
      return rejectWithValue('Không thể lấy danh sách đơn hàng!');
    } catch (error) {
      if (error.response?.status === 500) {
        return rejectWithValue('Lỗi server khi lấy danh sách đơn hàng!');
      }
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi lấy danh sách đơn hàng!');
    }
  }
);

// Lấy chi tiết đơn hàng
export const fetchOrderDetails = createAsyncThunk(
  'orders/fetchOrderDetails',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/order/${orderId}`);
      if (response.status === 200) {
        return { orderId, details: response.data.result };
      }
      return rejectWithValue('Không thể lấy chi tiết đơn hàng!');
    } catch (error) {
      if (error.response?.status === 404) {
        return rejectWithValue('Đơn hàng không tồn tại!');
      }
      if (error.response?.status === 403) {
        return rejectWithValue('Bạn không có quyền xem đơn hàng này!');
      }
      if (error.response?.status === 500) {
        return rejectWithValue('Lỗi server khi lấy chi tiết đơn hàng!');
      }
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi lấy chi tiết đơn hàng!');
    }
  }
);

// Thay đổi trạng thái đơn hàng
export const changeOrderStatus = createAsyncThunk(
  'orders/changeOrderStatus',
  async ({ orderId, fromStatus, toStatus }, { rejectWithValue }) => {
    try {
      const response = await api.put(
        `/order/change-order-status`,
        {},
        { params: { orderId, fromStatus, toStatus } }
      );
      if (response.status === 204) {
        return { orderId, toStatus };
      }
      return rejectWithValue('Không thể thay đổi trạng thái đơn hàng!');
    } catch (error) {
      if (error.response?.status === 403) {
        return rejectWithValue('Bạn không có quyền thay đổi trạng thái đơn hàng này!');
      }
      if (error.response?.status === 404) {
        return rejectWithValue('Đơn hàng không tồn tại!');
      }
      if (error.response?.status === 400) {
        return rejectWithValue('Trạng thái hiện tại của đơn hàng không khớp!');
      }
      if (error.response?.status === 500) {
        return rejectWithValue('Lỗi server khi thay đổi trạng thái đơn hàng!');
      }
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi thay đổi trạng thái đơn hàng!');
    }
  }
);

const orderSlice = createSlice({
  name: 'orders',
  initialState: {
    orders: [],
    orderDetails: {},
    pagination: {
      pageNumber: 0,
      pageSize: 10,
      totalElements: 0,
      totalPages: 1,
      last: true,
      first: true,
    },
    loading: false,
    error: null,
  },
  reducers: {
    clearOrders: (state) => {
      state.orders = [];
      state.orderDetails = {};
      state.pagination = {
        pageNumber: 0,
        pageSize: 10,
        totalElements: 0,
        totalPages: 1,
        last: true,
        first: true,
      };
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Orders
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.content || [];
        state.pagination = {
          pageNumber: action.payload.pageable.pageNumber,
          pageSize: action.payload.pageable.pageSize,
          totalElements: action.payload.totalElements,
          totalPages: action.payload.totalPages,
          last: action.payload.last,
          first: action.payload.first,
        };
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.orders = [];
      })
      // Fetch Order Details
      .addCase(fetchOrderDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.orderDetails[action.payload.orderId] = action.payload.details;
      })
      .addCase(fetchOrderDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Change Order Status
      .addCase(changeOrderStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(changeOrderStatus.fulfilled, (state, action) => {
        state.loading = false;
        const { orderId, toStatus } = action.payload;
        const order = state.orders.find((o) => o.orderId === orderId);
        if (order) {
          order.orderStatus = toStatus;
        }
      })
      .addCase(changeOrderStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearOrders } = orderSlice.actions;
export default orderSlice.reducer;