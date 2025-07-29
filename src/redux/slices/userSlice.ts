// store/slices/profileSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '@/lib/api';

interface User {
  name: string;
  email: string;
  role: string;
  image?: string;
}

interface ProfileState {
  user: User | null;
  loading: boolean;
  error: string | null;
  updateSuccess: boolean; // 🔄 Added to track success state
}

// Thunk: Fetch profile
export const fetchProfile = createAsyncThunk<User>(
  'profile/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('bookbay_token');
      const res = await api.get('/users/viewProfile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data.data as User;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to load profile');
    }
  }
);

// ✅ Thunk: Edit profile
export const editProfile = createAsyncThunk<User, FormData>(
  'profile/editProfile',
  async (formData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('bookbay_token');
      const res = await api.patch('/users/editProfile', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      return res.data.data as User;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update profile');
    }
  }
);

const initialState: ProfileState = {
  user: null,
  loading: false,
  error: null,
  updateSuccess: false,
};

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    clearProfile: (state) => {
      state.user = null;
      state.error = null;
      state.loading = false;
      state.updateSuccess = false;
    },
    resetUpdateSuccess: (state) => {
      state.updateSuccess = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchProfile
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action: PayloadAction<User>) => {
        state.user = action.payload;
        state.loading = false;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // editProfile
      .addCase(editProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.updateSuccess = false;
      })
      .addCase(editProfile.fulfilled, (state, action: PayloadAction<User>) => {
        state.user = action.payload;
        state.loading = false;
        state.updateSuccess = true;
      })
      .addCase(editProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.updateSuccess = false;
      });
  },
});

export const { clearProfile, resetUpdateSuccess } = profileSlice.actions;
export default profileSlice.reducer;
