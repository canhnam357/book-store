import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/api';
import { toast } from 'react-toastify';

export const fetchOrders = createAsyncThunk(
  'orders/fetchOrders',
  async ({ index = 1, size = 10, orderStatus = '' }, { rejectWithValue }) => {
    try {
      const response = await api.get('/order', {
        params: { index, size, orderStatus },
      });
      console.log('Fetch orders response:', response.data);
      if (response.status === 200 && response.data.result) {
        return response.data.result;
      }
      throw new Error(response.data.message || 'Không thể lấy danh sách đơn hàng!');
    } catch (error) {
      console.error('Fetch orders error:', error.response?.data || error);
      const message = error.response?.data?.message || 'Lỗi khi lấy danh sách đơn hàng!';
      return rejectWithValue(message);
    }
  }
);

export const fetchOrderDetails = createAsyncThunk(
  'orders/fetchOrderDetails',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/order/${orderId}`);
      console.log('Fetch order details response:', response.data);
      if (response.status === 200 && response.data.result) {
        return { orderId, details: response.data.result };
      }
      throw new Error(response.data.message || 'Không thể lấy chi tiết đơn hàng!');
    } catch (error) {
      console.error('Fetch order details error:', error.response?.data || error);
      const message = error.response?.data?.message || 'Lỗi khi lấy chi tiết đơn hàng!';
      return rejectWithValue(message);
    }
  }
);

export const changeOrderStatus = createAsyncThunk(
  'orders/changeOrderStatus',
  async ({ orderId, fromStatus, toStatus, cause }, { rejectWithValue }) => {
    try {
      const response = await api.put('/order/change-order-status', {
        orderId,
        fromStatus,
        toStatus,
        cause: cause || null,
      });
      console.log('Change order status response:', response.data);
      if (response.status === 204) {
        return { orderId, toStatus };
      }
      throw new Error(response.data.message || 'Không thể thay đổi trạng thái đơn hàng!');
    } catch (error) {
      console.error('Change order status error:', error.response?.data || error);
      const message = error.response?.data?.message || 'Lỗi khi thay đổi trạng thái đơn hàng!';
      return rejectWithValue(message);
    }
  }
);

export const fetchPaymentDetail = createAsyncThunk(
  'orders/fetchPaymentDetail',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/order/payment-detail/${orderId}`);
      console.log('Fetch payment detail response:', response.data);
      if (response.status === 200 && response.data.result) {
        return response.data.result;
      }
      throw new Error(response.data.message || 'Không thể lấy chi tiết thanh toán!');
    } catch (error) {
      console.error('Fetch payment detail error:', error.response?.data || error);
      const message = error.response?.data?.message || 'Lỗi khi lấy chi tiết thanh toán!';
      return rejectWithValue(message);
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
    paymentDetail: null,
    paymentDetailLoading: false,
    paymentDetailError: null,
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
      state.paymentDetail = null;
      state.paymentDetailLoading = false;
      state.paymentDetailError = null;
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
        toast.error(action.payload);
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
        toast.error(action.payload);
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
        toast.dismiss();
        toast.success('Hủy đơn thành công!');
      })
      .addCase(changeOrderStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.dismiss();
        toast.error(action.payload);
      })
      // Fetch Payment Detail
      .addCase(fetchPaymentDetail.pending, (state) => {
        state.paymentDetailLoading = true;
        state.paymentDetailError = null;
        state.paymentDetail = null;
      })
      .addCase(fetchPaymentDetail.fulfilled, (state, action) => {
        state.paymentDetailLoading = false;
        state.paymentDetail = action.payload;
      })
      .addCase(fetchPaymentDetail.rejected, (state, action) => {
        state.paymentDetailLoading = false;
        state.paymentDetailError = action.payload;
        state.paymentDetail = null;
      });
  },
});

export const { clearOrders } = orderSlice.actions;
export default orderSlice.reducer;