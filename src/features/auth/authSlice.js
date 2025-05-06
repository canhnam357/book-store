import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/api';
import { toast } from 'react-toastify';

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data.success) {
        const { accessToken, refreshToken, username } = response.data.result;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        toast.dismiss();
        toast.success('Đăng nhập thành công');
        return { username };
      }
      return rejectWithValue(response.data.message);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Đăng nhập thất bại!');
    }
  }
);

export const handleGoogleCallback = createAsyncThunk(
  'auth/handleGoogleCallback',
  async ({ accessToken, refreshToken, username, error }, { rejectWithValue }) => {
    try {
      console.log(error);
      if (error) {
        if (error === 'account_locked') {
          toast.error('Đăng nhập bằng Google thất bại do tài khoản bị khóa!');
        } else {
          toast.error('Đăng nhập bằng Google thất bại!');
        }
        return rejectWithValue(error);
      }
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      toast.dismiss();
      toast.success('Đăng nhập bằng Google thành công!');
      return { username };
    } catch (error) {
      toast.error('Đăng nhập bằng Google thất bại!');
      return rejectWithValue(error.message);
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
      if (response.data.success) {
        toast.dismiss();
        toast.success('Đăng ký thành công , vui lòng kiểm tra email để nhận OTP xác thực tài khoản.');
        return email;
      }
      return rejectWithValue(response.data.message);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Đăng ký thất bại!');
    }
  }
);

export const verifyOTP = createAsyncThunk(
  'auth/verifyOTP',
  async ({ email, otp }, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/verify-otp', { email, otp });
      if (response.data.success) {
        toast.dismiss();
        toast.success('Xác thực tài khoản thành công, bây giờ bạn có thể tiến hành đăng nhập.');
        return true;
      }
      return rejectWithValue(response.data.message);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Xác nhận OTP thất bại!');
    }
  }
);

export const sendOTPResetPassword = createAsyncThunk(
  'auth/sendOTPResetPassword',
  async (email, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/send-otp-reset-password', null, { params: { email } });
      if (response.data.success) {
        toast.dismiss();
        toast.success('Gửi OTP qua email thành công, vui lòng kiểm tra email để lấy OTP đặt lại mật khẩu!');
        return email;
      }
      return rejectWithValue(response.data.message);
    } catch (error) {
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
      if (response.data.success) {
        toast.dismiss();
        toast.success('Đặt lại mật khẩu thành công!');
        return true;
      }
      return rejectWithValue(response.data.message);
    } catch (error) {
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
      if (response.data.success) {
        toast.dismiss();
        toast.success('Đăng xuất thành công!');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        return true;
      }
      return rejectWithValue(response.data.message);
    } catch (error) {
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
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(handleGoogleCallback.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.user = action.payload;
      })
      .addCase(handleGoogleCallback.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.registerEmail = action.payload;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(verifyOTP.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyOTP.fulfilled, (state) => {
        state.loading = false;
        state.registerEmail = null;
      })
      .addCase(verifyOTP.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(sendOTPResetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendOTPResetPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.resetPasswordEmail = action.payload;
      })
      .addCase(sendOTPResetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.loading = false;
        state.resetPasswordEmail = null;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.user = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.isAuthenticated = false;
        state.user = null;
        state.error = action.payload;
      });
  },
});

export const { clearRegisterEmail, clearResetPasswordEmail } = authSlice.actions;
export default authSlice.reducer;