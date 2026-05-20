import api from "../api/axios";

// Đăng ký
export const registerAPI = async (data) => {
  const response = await api.post("/auth/register", data);
  return response.data;
};

// Xác thực OTP
export const verifyOtpAPI = async (data) => {
  const response = await api.post("/auth/verify-otp", data);
  return response.data;
};

// Đăng nhập
export const loginAPI = async (data) => {
  const response = await api.post("/auth/login", data);
  return response.data;
};

// Quên mật khẩu
export const forgotPasswordAPI = async (data) => {
  const response = await api.post("/auth/forgot-password", data);
  return response.data;
};

// Reset mật khẩu
export const resetPasswordAPI = async (data) => {
  const response = await api.post("/auth/reset-password", data);
  return response.data;
};

// Cập nhật profile
export const editProfileAPI = async (data) => {
  // Token sẽ được Interceptor tự động thêm vào Header
  const response = await api.put("/auth/edit-profile", data);
  return response.data;
};

export const getSaleProductsAPI = async (page = 1, limit = 6) => {
  const response = await api.get(`/products/sale?page=${page}&limit=${limit}`);
  return response.data;
};

export const getNewProductsAPI = async (page = 1, limit = 6) => {
  const response = await api.get(`/products/new?page=${page}&limit=${limit}`);
  return response.data;
};

export const getBestSellerProductsAPI = async (page = 1, limit = 6) => {
  const response = await api.get(`/products/best-seller?page=${page}&limit=${limit}`);
  return response.data;
};

export const getProductByIdAPI = async (id) => {
  const response = await api.get(`/products/${id}`);
  return response.data;
};

export const getRelatedProductsAPI = async (id) => {
  const response = await api.get(`/products/${id}/related`);
  return response.data;
};

export const searchProductsAPI = async (params) => {
  const query = new URLSearchParams(params).toString();
  const response = await api.get(`/products/search?${query}`);
  return response.data;
};

export const getTopBestSellerAPI = async (limit = 10) => {
  const response = await api.get(`/products/top-best-seller?limit=${limit}`);
  return response.data;
};

export const getTopMostViewedAPI = async (limit = 10) => {
  const response = await api.get(`/products/top-most-viewed?limit=${limit}`);
  return response.data;
};

export const getProductsByCategoryAPI = async (category = "all", page = 1, limit = 8) => {
  const response = await api.get(
    `/products/by-category?category=${category}&page=${page}&limit=${limit}`
  );
  return response.data;
};

// Cart APIs
export const getCartAPI = async () => {
  const response = await api.get("/cart");
  return response.data;
};

export const addToCartAPI = async (productId, quantity = 1) => {
  const response = await api.post("/cart", { productId, quantity });
  return response.data;
};

export const updateCartItemAPI = async (cartItemId, quantity) => {
  const response = await api.put(`/cart/${cartItemId}`, { quantity });
  return response.data;
};

export const removeFromCartAPI = async (cartItemId) => {
  const response = await api.delete(`/cart/${cartItemId}`);
  return response.data;
};

export const clearCartAPI = async () => {
  const response = await api.delete("/cart");
  return response.data;
};

// Thêm API lấy thông tin Profile này vào authService.js
export const getProfileAPI = async () => {
  const response = await api.get("/auth/profile");
  return response.data;
};

// Order APIs
export const createOrderAPI = async (data) => {
  const response = await api.post("/orders", data);
  return response.data;
};

export const getOrdersAPI = async (page = 1, limit = 10, status = "") => {
  const query = new URLSearchParams({ page, limit, ...(status && { status }) }).toString();
  const response = await api.get(`/orders?${query}`);
  return response.data;
};

export const getOrderByIdAPI = async (id) => {
  const response = await api.get(`/orders/${id}`);
  return response.data;
};

export const cancelOrderAPI = async (id) => {
  const response = await api.post(`/orders/${id}/cancel`);
  return response.data;
};