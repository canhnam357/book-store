import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/api';
import { toast } from 'react-toastify';

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      console.log('Login response:', response.data);
      if (response.status === 200 && response.data.result) {
        const { accessToken, refreshToken, username } = response.data.result;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        return { username };
      }
      throw new Error(response.data.message || 'Đăng nhập thất bại!');
    } catch (error) {
      console.error('Login error:', error.response?.data || error);
      return rejectWithValue(error.response?.data?.message || 'Đăng nhập thất bại!');
    }
  }
);

export const handleGoogleCallback = createAsyncThunk(
  'auth/handleGoogleCallback',
  async ({ accessToken, refreshToken, username, error }, { rejectWithValue }) => {
    try {
      if (error) {
        throw new Error(error);
      }
      console.log('Google callback params:', { accessToken, refreshToken, username });
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      return { username };
    } catch (error) {
      console.error('Google callback error:', error);
      return rejectWithValue(error.message || 'Đăng nhập bằng Google thất bại!');
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async ({ fullName, email, phoneNumber, password, confirmPassword }, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/register', {
        fullName,
        email,
        phoneNumber,
        password,
        confirmPassword,
      });
      console.log('Register response:', response.data);
      if (response.status === 200) {
        return email;
      }
      throw new Error(response.data.message || 'Đăng ký thất bại!');
    } catch (error) {
      console.error('Register error:', error.response?.data || error);
      return rejectWithValue(error.response?.data?.message || 'Đăng ký thất bại!');
    }
  }
);

export const verifyOTP = createAsyncThunk(
  'auth/verifyOTP',
  async ({ email, otp }, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/verify-otp', { email, otp });
      console.log('Verify OTP response:', response.data);
      if (response.status === 200) {
        return true;
      }
      throw new Error(response.data.message || 'Xác nhận OTP thất bại!');
    } catch (error) {
      console.error('Verify OTP error:', error.response?.data || error);
      return rejectWithValue(error.response?.data?.message || 'Xác nhận OTP thất bại!');
    }
  }
);

export const sendOTPResetPassword = createAsyncThunk(
  'auth/sendOTPResetPassword',
  async (email, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/send-otp-reset-password', null, { params: { email } });
      console.log('Send OTP response:', response.data);
      if (response.status === 200) {
        return email;
      }
      throw new Error(response.data.message || 'Gửi OTP thất bại!');
    } catch (error) {
      console.error('Send OTP error:', error.response?.data || error);
      return rejectWithValue(error.response?.data?.message || 'Gửi OTP thất bại!');
    }
  }
);

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async ({ otp, email, newPassword, confirmPassword }, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/reset-password', {
        otp,
        email,
        newPassword,
        confirmPassword,
      });
      console.log('Reset password response:', response.data);
      if (response.status === 200) {
        return true;
      }
      throw new Error(response.data.message || 'Reset mật khẩu thất bại!');
    } catch (error) {
      console.error('Reset password error:', error.response?.data || error);
      return rejectWithValue(error.response?.data?.message || 'Reset mật khẩu thất bại!');
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      const response = await api.post('/auth/logout', null, { params: { refreshToken } });
      console.log('Logout response:', response.data);
      if (response.status === 200) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        return true;
      }
      throw new Error(response.data.message || 'Đăng xuất thất bại!');
    } catch (error) {
      console.error('Logout error:', error.response?.data || error);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      return rejectWithValue(error.response?.data?.message || 'Đăng xuất thất bại!');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    registerEmail: null,
    resetPasswordEmail: null,
    isAuthenticated: !!localStorage.getItem('accessToken'),
    loading: false,
    error: null,
  },
  reducers: {
    clearRegisterEmail(state) {
      state.registerEmail = null;
    },
    clearResetPasswordEmail(state) {
      state.resetPasswordEmail = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login User
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
        toast.dismiss();
        toast.success('Đăng nhập thành công!');
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.dismiss();
        toast.error(action.payload);
      })
      // Google Callback
      .addCase(handleGoogleCallback.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.user = action.payload;
        toast.dismiss();
        toast.success('Đăng nhập bằng Google thành công!');
      })
      .addCase(handleGoogleCallback.rejected, (state, action) => {
        state.error = action.payload;
        const message = action.payload === 'account_locked'
          ? 'Đăng nhập bằng Google thất bại do tài khoản bị khóa!'
          : action.payload;
        toast.dismiss();
        toast.error(message);
      })
      // Register User
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.registerEmail = action.payload;
        toast.dismiss();
        toast.success('Đăng ký thành công, vui lòng kiểm tra email để nhận OTP xác thực tài khoản.');
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.dismiss();
        toast.error(action.payload);
      })
      // Verify OTP
      .addCase(verifyOTP.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyOTP.fulfilled, (state) => {
        state.loading = false;
        state.registerEmail = null;
        toast.dismiss();
        toast.success('Xác thực tài khoản thành công, bây giờ bạn có thể tiến hành đăng nhập.');
      })
      .addCase(verifyOTP.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.dismiss();
        toast.error(action.payload);
      })
      // Send OTP Reset Password
      .addCase(sendOTPResetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendOTPResetPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.resetPasswordEmail = action.payload;
        toast.dismiss();
        toast.success('Gửi OTP qua email thành công, vui lòng kiểm tra email để lấy OTP đặt lại mật khẩu!');
      })
      .addCase(sendOTPResetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.dismiss();
        toast.error(action.payload);
      })
      // Reset Password
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.loading = false;
        state.resetPasswordEmail = null;
        toast.dismiss();
        toast.success('Đặt lại mật khẩu thành công!');
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.dismiss();
        toast.error(action.payload);
      })
      // Logout User
      .addCase(logoutUser.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        toast.dismiss();
        toast.success('Đăng xuất thành công!');
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.isAuthenticated = false;
        state.user = null;
        state.error = action.payload;
        toast.dismiss();
        toast.error(action.payload);
      });
  },
});

export const { clearRegisterEmail, clearResetPasswordEmail } = authSlice.actions;
export default authSlice.reducer;