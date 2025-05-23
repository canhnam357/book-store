import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/api';
import { toast } from 'react-toastify';

export const sendOtpResetPassword = createAsyncThunk(
  'changePassword/sendOtpResetPassword',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.post('/user/send-otp-reset-password');
      console.log('Send OTP response:', response.data);
      if (response.status === 200) {
        return true;
      }
      throw new Error(response.data.message || 'Không thể gửi OTP!');
    } catch (error) {
      console.error('Send OTP error:', error.response?.data || error);
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi gửi OTP!');
    }
  }
);

export const changePassword = createAsyncThunk(
  'changePassword/changePassword',
  async ({ otp, password, newPassword }, { rejectWithValue }) => {
    try {
      const response = await api.post('/user/change-password', {
        otp,
        password,
        newPassword,
      });
      console.log('Change password response:', response.data);
      if (response.status === 200) {
        return true;
      }
      throw new Error(response.data.message || 'Không thể đổi mật khẩu!');
    } catch (error) {
      console.error('Change password error:', error.response?.data || error);
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi đổi mật khẩu!');
    }
  }
);

const changePasswordSlice = createSlice({
  name: 'changePassword',
  initialState: {
    otpSent: false,
    loading: false,
    error: null,
  },
  reducers: {
    resetOtpSent: (state) => {
      state.otpSent = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Send OTP
      .addCase(sendOtpResetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendOtpResetPassword.fulfilled, (state) => {
        state.loading = false;
        state.otpSent = true;
        toast.success('OTP đã được gửi đến email của bạn!');
      })
      .addCase(sendOtpResetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })
      // Change Password
      .addCase(changePassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.loading = false;
        state.otpSent = false;
        toast.success('Đổi mật khẩu thành công!');
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      });
  },
});

export const { resetOtpSent } = changePasswordSlice.actions;
export default changePasswordSlice.reducer;