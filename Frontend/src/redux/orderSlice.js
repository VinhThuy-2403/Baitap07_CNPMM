import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  createOrderAPI,
  getOrdersAPI,
  getOrderByIdAPI,
  cancelOrderAPI,
} from "../services/authService";

export const createOrder = createAsyncThunk(
  "order/create",
  async (data, thunkAPI) => {
    try {
      return await createOrderAPI(data);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Đặt hàng thất bại"
      );
    }
  }
);

export const fetchOrders = createAsyncThunk(
  "order/fetchAll",
  async ({ page, limit, status }, thunkAPI) => {
    try {
      return await getOrdersAPI(page, limit, status);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  }
);

export const fetchOrderById = createAsyncThunk(
  "order/fetchOne",
  async (id, thunkAPI) => {
    try {
      return await getOrderByIdAPI(id);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  }
);

export const cancelOrder = createAsyncThunk(
  "order/cancel",
  async (id, thunkAPI) => {
    try {
      return await cancelOrderAPI(id);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Hủy đơn thất bại"
      );
    }
  }
);

const orderSlice = createSlice({
  name: "order",
  initialState: {
    orders: [],
    currentOrder: null,
    pagination: null,
    isLoading: false,
    error: null,
    successMsg: null,
  },
  reducers: {
    clearOrderMsg: (state) => {
      state.error = null;
      state.successMsg = null;
    },
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.successMsg = action.payload.message;
        state.currentOrder = action.payload.data;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchOrders.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchOrderById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentOrder = action.payload.data;
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(cancelOrder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.successMsg = action.payload.message;
        if (state.currentOrder) {
          state.currentOrder = action.payload.order;
        }
      })
      .addCase(cancelOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearOrderMsg, clearCurrentOrder } = orderSlice.actions;
export default orderSlice.reducer;