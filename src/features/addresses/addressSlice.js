import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import api from '../../api/api';

// Lấy danh sách địa chỉ
export const fetchAddresses = createAsyncThunk(
  'addresses/fetchAddresses',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/addresses');
      console.log('Fetch addresses response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Fetch addresses error:', error.response?.data || error);
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi lấy danh sách địa chỉ');
    }
  }
);

// Tạo địa chỉ mới
export const createAddress = createAsyncThunk(
  'addresses/createAddress',
  async (addressData, { rejectWithValue }) => {
    try {
      const response = await api.post('/addresses', addressData);
      console.log('Create address response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Create address error:', error.response?.data || error);
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi tạo địa chỉ');
    }
  }
);

// Xóa địa chỉ
export const deleteAddress = createAsyncThunk(
  'addresses/deleteAddress',
  async (addressId, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/addresses/${addressId}`);
      console.log('Delete address response:', response.data);
      return { addressId, message: 'Xóa địa chỉ thành công!' };
    } catch (error) {
      console.error('Delete address error:', error.response?.data || error);
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi xóa địa chỉ');
    }
  }
);

// Cập nhật địa chỉ
export const updateAddress = createAsyncThunk(
  'addresses/updateAddress',
  async ({ addressId, addressData }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/addresses/${addressId}`, addressData);
      console.log('Update address response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Update address error:', error.response?.data || error);
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi cập nhật địa chỉ');
    }
  }
);

// Đặt địa chỉ làm mặc định
export const setDefaultAddress = createAsyncThunk(
  'addresses/setDefaultAddress',
  async (addressId, { rejectWithValue }) => {
    try {
      const response = await api.post(`/addresses/${addressId}/set-default`);
      console.log('Set default address response:', response.data);
      return { addressId, message: 'Đặt địa chỉ mặc định thành công!' };
    } catch (error) {
      console.error('Set default address error:', error.response?.data || error);
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi đặt địa chỉ mặc định');
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
        state.addresses = Array.isArray(action.payload.result) ? action.payload.result : [];
        // Sắp xếp để địa chỉ mặc định lên đầu
        state.addresses.sort((a, b) => (b.default ? 1 : 0) - (a.default ? 1 : 0));
      })
      .addCase(fetchAddresses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.addresses = [];
        toast.dismiss();
        toast.error(action.payload);
      })
      // Create Address
      .addCase(createAddress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAddress.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.result) {
          state.addresses.push(action.payload.result);
          // Sắp xếp lại để địa chỉ mặc định lên đầu
          state.addresses.sort((a, b) => (b.default ? 1 : 0) - (a.default ? 1 : 0));
          toast.dismiss();
          toast.success('Tạo địa chỉ thành công!');
        }
      })
      .addCase(createAddress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.dismiss();
        toast.error(action.payload);
      })
      // Delete Address
      .addCase(deleteAddress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAddress.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.addressId) {
          state.addresses = state.addresses.filter(
            (address) => address.addressId !== action.payload.addressId
          );
        }
        toast.dismiss();
        toast.success('Xoá địa chỉ thành công!');
      })
      .addCase(deleteAddress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.dismiss();
        toast.error(action.payload);
      })
      // Update Address
      .addCase(updateAddress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAddress.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.result) {
          const updatedAddress = action.payload.result;
          const index = state.addresses.findIndex(
            (addr) => addr.addressId === updatedAddress.addressId
          );
          if (index !== -1) {
            state.addresses[index] = updatedAddress;
          }
          // Sắp xếp lại để địa chỉ mặc định lên đầu
          state.addresses.sort((a, b) => (b.default ? 1 : 0) - (a.default ? 1 : 0));
        }
        toast.dismiss();
        toast.success('Thay đổi địa chỉ thành công!');
      })
      .addCase(updateAddress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.dismiss();
        toast.error(action.payload);
      })
      // Set Default Address
      .addCase(setDefaultAddress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(setDefaultAddress.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.addressId) {
          const addressId = action.payload.addressId;
          state.addresses = state.addresses.map((address) => ({
            ...address,
            default: address.addressId === addressId,
          }));
          // Sắp xếp lại để địa chỉ mặc định lên đầu
          state.addresses.sort((a, b) => (b.default ? 1 : 0) - (a.default ? 1 : 0));
        }
        toast.dismiss();
        toast.success('Đặt làm địa chỉ mặc định thành công!');
      })
      .addCase(setDefaultAddress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.dismiss();
        toast.error(action.payload);
      });
  },
});

export const { clearAddresses } = addressSlice.actions;
export default addressSlice.reducer;