import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/api';

// Lấy danh sách địa chỉ
export const fetchAddresses = createAsyncThunk(
  'addresses/fetchAddresses',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/addresses');
      if (response.status === 200) {
        return response.data.result;
      }
      return rejectWithValue('Không thể lấy danh sách địa chỉ!');
    } catch (error) {
      if (error.response?.status === 500) {
        return rejectWithValue('Lỗi server khi lấy danh sách địa chỉ!');
      }
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi lấy danh sách địa chỉ!');
    }
  }
);

// Tạo địa chỉ mới
export const createAddress = createAsyncThunk(
  'addresses/createAddress',
  async (addressData, { rejectWithValue }) => {
    try {
      const response = await api.post('/addresses', addressData);
      if (response.status === 201) {
        return response.data.result;
      }
      return rejectWithValue('Không thể tạo địa chỉ mới!');
    } catch (error) {
      if (error.response?.status === 500) {
        return rejectWithValue('Lỗi server khi tạo địa chỉ!');
      }
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi tạo địa chỉ mới!');
    }
  }
);

// Xóa địa chỉ
export const deleteAddress = createAsyncThunk(
  'addresses/deleteAddress',
  async (addressId, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/addresses/${addressId}`);
      if (response.status === 204) {
        return addressId;
      }
      return rejectWithValue('Không thể xóa địa chỉ!');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi xóa địa chỉ!');
    }
  }
);

// Cập nhật địa chỉ
export const updateAddress = createAsyncThunk(
  'addresses/updateAddress',
  async ({ addressId, addressData }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/addresses/${addressId}`, addressData);
      if (response.status === 200) {
        return response.data.result;
      }
      return rejectWithValue('Không thể cập nhật địa chỉ!');
    } catch (error) {
      if (error.response?.status === 404) {
        return rejectWithValue('Địa chỉ không tồn tại!');
      }
      if (error.response?.status === 500) {
        return rejectWithValue('Lỗi server khi cập nhật địa chỉ!');
      }
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi cập nhật địa chỉ!');
    }
  }
);

// Đặt địa chỉ làm mặc định
export const setDefaultAddress = createAsyncThunk(
  'addresses/setDefaultAddress',
  async (addressId, { rejectWithValue }) => {
    try {
      const response = await api.post(`/addresses/${addressId}/set-default`);
      if (response.status === 204) {
        return addressId;
      }
      return rejectWithValue('Không thể đặt địa chỉ làm mặc định!');
    } catch (error) {
      if (error.response?.status === 404) {
        return rejectWithValue('Địa chỉ không tồn tại!');
      }
      if (error.response?.status === 409) {
        return rejectWithValue('Địa chỉ này đã là mặc định!');
      }
      if (error.response?.status === 500) {
        return rejectWithValue('Lỗi server khi đặt địa chỉ làm mặc định!');
      }
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi đặt địa chỉ làm mặc định!');
    }
  }
);

const addressSlice = createSlice({
  name: 'addresses',
  initialState: {
    addresses: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearAddresses: (state) => {
      state.addresses = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Addresses
      .addCase(fetchAddresses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAddresses.fulfilled, (state, action) => {
        state.loading = false;
        state.addresses = Array.isArray(action.payload) ? action.payload : [];
        // Sắp xếp để địa chỉ mặc định lên đầu
        state.addresses.sort((a, b) => (b.default ? 1 : 0) - (a.default ? 1 : 0));
      })
      .addCase(fetchAddresses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.addresses = [];
      })
      // Create Address
      .addCase(createAddress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAddress.fulfilled, (state, action) => {
        state.loading = false;
        state.addresses.push(action.payload);
        // Sắp xếp lại để địa chỉ mặc định lên đầu
        state.addresses.sort((a, b) => (b.default ? 1 : 0) - (a.default ? 1 : 0));
      })
      .addCase(createAddress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete Address
      .addCase(deleteAddress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAddress.fulfilled, (state, action) => {
        state.loading = false;
        state.addresses = state.addresses.filter((address) => address.addressId !== action.payload);
      })
      .addCase(deleteAddress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Address
      .addCase(updateAddress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAddress.fulfilled, (state, action) => {
        state.loading = false;
        const updatedAddress = action.payload;
        const index = state.addresses.findIndex((addr) => addr.addressId === updatedAddress.addressId);
        if (index !== -1) {
          state.addresses[index] = updatedAddress;
        }
        // Sắp xếp lại để địa chỉ mặc định lên đầu
        state.addresses.sort((a, b) => (b.default ? 1 : 0) - (a.default ? 1 : 0));
      })
      .addCase(updateAddress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Set Default Address
      .addCase(setDefaultAddress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(setDefaultAddress.fulfilled, (state, action) => {
        state.loading = false;
        const addressId = action.payload;
        state.addresses = state.addresses.map((address) => ({
          ...address,
          default: address.addressId === addressId,
        }));
        // Sắp xếp lại để địa chỉ mặc định lên đầu
        state.addresses.sort((a, b) => (b.default ? 1 : 0) - (a.default ? 1 : 0));
      })
      .addCase(setDefaultAddress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearAddresses } = addressSlice.actions;
export default addressSlice.reducer;