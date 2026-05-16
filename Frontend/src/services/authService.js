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