import { createSlice } from "@reduxjs/toolkit";

// Hàm lấy dữ liệu từ localStorage
const loadWishlist = () => {
  try {
    const serializedState = localStorage.getItem("wishlist");
    if (serializedState === null) {
      return [];
    }
    return JSON.parse(serializedState);
  } catch (err) {
    return [];
  }
};

const initialState = {
  items: loadWishlist(),
};

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    toggleWishlist: (state, action) => {
      const product = action.payload;
      const existingIndex = state.items.findIndex(item => item.id === product.id);
      
      if (existingIndex >= 0) {
        // Đã có -> Xóa khỏi wishlist
        state.items.splice(existingIndex, 1);
      } else {
        // Chưa có -> Thêm vào wishlist
        state.items.push(product);
      }
      
      // Lưu xuống localStorage để giữ lại khi F5
      localStorage.setItem("wishlist", JSON.stringify(state.items));
    },
  },
});

export const { toggleWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;