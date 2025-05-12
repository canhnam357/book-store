import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/api';
import { toast } from 'react-toastify';

export const fetchProfile = createAsyncThunk(
  'profile/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/user/profile');
      console.log('Fetch profile response:', response.data);
      if (response.status === 200 && response.data.result) {
        return response.data.result;
      }
      throw new Error(response.data.message || 'Không thể lấy thông tin hồ sơ!');
    } catch (error) {
      console.error('Fetch profile error:', error.response?.data || error);
      if (error.response?.status === 500) {
        return rejectWithValue('Lỗi server khi lấy thông tin hồ sơ!');
      }
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi lấy thông tin hồ sơ!');
    }
  }
);

export const changeAvatar = createAsyncThunk(
  'profile/changeAvatar',
  async (file, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      const response = await api.post('/user/change-avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        params: { image: file.name },
      });
      console.log('Change avatar response:', response.data);
      if (response.status === 200 && response.data.result) {
        return response.data.result;
      }
      throw new Error(response.data.message || 'Không thể thay đổi avatar!');
    } catch (error) {
      console.error('Change avatar error:', error.response?.data || error);
      if (error.response?.status === 400) {
        return rejectWithValue('File ảnh không hợp lệ!');
      }
      if (error.response?.status === 500) {
        return rejectWithValue('Lỗi server khi thay đổi avatar!');
      }
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi thay đổi avatar!');
    }
  }
);

export const changeProfile = createAsyncThunk(
  'profile/changeProfile',
  async ({ fullName, phoneNumber, gender, dateOfBirth }, { rejectWithValue }) => {
    try {
      const response = await api.post('/user/change-profile', {
        fullName,
        phoneNumber: phoneNumber || null,
        gender,
        dateOfBirth: dateOfBirth || null,
      });
      console.log('Change profile response:', response.data);
      if (response.status === 200 && response.data.result) {
        return response.data.result;
      }
      throw new Error(response.data.message || 'Không thể cập nhật thông tin!');
    } catch (error) {
      console.error('Change profile error:', error.response?.data || error);
      if (error.response?.status === 422) {
        return rejectWithValue('Thông tin không hợp lệ!');
      }
      if (error.response?.status === 500) {
        return rejectWithValue('Lỗi server khi cập nhật thông tin!');
      }
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi cập nhật thông tin!');
    }
  }
);

const profileSlice = createSlice({
  name: 'profile',
  initialState: {
    profile: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Profile
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })
      // Change Avatar
      .addCase(changeAvatar.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(changeAvatar.fulfilled, (state, action) => {
        state.loading = false;
        if (state.profile) {
          state.profile.avatar = action.payload;
        }
        toast.success('Thay đổi avatar thành công!');
      })
      .addCase(changeAvatar.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })
      // Change Profile
      .addCase(changeProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(changeProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
        toast.success('Cập nhật thông tin thành công!');
      })
      .addCase(changeProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      });
  },
});

export default profileSlice.reducer;