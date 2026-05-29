import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = "http://localhost:8080/api/reviews";

export const fetchReviews = createAsyncThunk(
  "review/fetchByProduct",
  async (productId, thunkAPI) => {
    try {
      const response = await axios.get(`${API_URL}/product/${productId}`);
      return response.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  }
);

export const addReview = createAsyncThunk(
  "review/add",
  async ({ productId, rating, comment }, thunkAPI) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        API_URL,
        { productId, rating, comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Gửi đánh giá thất bại.");
    }
  }
);

const reviewSlice = createSlice({
  name: "review",
  initialState: {
    items: [],
    isLoading: false,
    error: null,
    successMessage: null,
  },
  reducers: {
    clearReviewStatus: (state) => {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReviews.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchReviews.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchReviews.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(addReview.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addReview.fulfilled, (state, action) => {
        state.isLoading = false;
        state.successMessage = action.payload.message;
        // Đẩy đánh giá mới vừa tạo lên đầu danh sách hiển thị
        if (action.payload.data && action.payload.data.review) {
          state.items.unshift(action.payload.data.review);
        }
      })
      .addCase(addReview.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearReviewStatus } = reviewSlice.actions;
export default reviewSlice.reducer;