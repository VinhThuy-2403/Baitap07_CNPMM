const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

const {
  sendOTPEmail,
  sendForgotPasswordOTPEmail,
} = require("../utils/mail.util");

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const register = async ({ name, email, password }) => {
  const existingUser = await User.findOne({
    where: { email },
  });

  if (existingUser) {
    throw new Error("Email đã tồn tại");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const otpCode = generateOTP();
  const otpExpires = new Date(Date.now() + 5 * 60 * 1000);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role: "user",
    isVerified: false,
    otpCode,
    otpExpires,
  });

  await sendOTPEmail(email, otpCode);

  return {
    userId: user.id,
    email: user.email,
    message: "Đăng ký thành công. Vui lòng kiểm tra email để lấy OTP.",
  };
};

const verifyOtp = async ({ email, otp }) => {
  const user = await User.findOne({
    where: { email },
  });

  if (!user) {
    throw new Error("Email không tồn tại");
  }

  if (user.isVerified) {
    throw new Error("Tài khoản đã được kích hoạt");
  }

  if (user.otpCode !== otp) {
    throw new Error("OTP không chính xác");
  }

  if (!user.otpExpires || user.otpExpires < new Date()) {
    throw new Error("OTP đã hết hạn");
  }

  user.isVerified = true;
  user.otpCode = null;
  user.otpExpires = null;

  await user.save();

  return {
    message: "Kích hoạt tài khoản thành công",
  };
};

const login = async ({ email, password }) => {
  const user = await User.findOne({
    where: { email },
  });

  if (!user) {
    throw new Error("Email hoặc mật khẩu không đúng");
  }

  if (!user.isVerified) {
    throw new Error("Tài khoản chưa xác thực OTP");
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error("Email hoặc mật khẩu không đúng");
  }

  const token = jwt.sign(
    {
      id: user.id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "1h",
    }
  );

  const redirectUrl =
    user.role === "admin"
      ? "/admin/profile"
      : "/user/profile";

  return {
    token,
    redirectUrl,
    role: user.role,
  };
};

const forgotPassword = async ({ email }) => {
  const user = await User.findOne({
    where: { email },
  });

  if (!user) {
    throw new Error("Email không tồn tại");
  }

  const otpCode = generateOTP();
  const otpExpires = new Date(Date.now() + 5 * 60 * 1000);

  user.otpCode = otpCode;
  user.otpExpires = otpExpires;

  await user.save();

  await sendForgotPasswordOTPEmail(email, otpCode);

  return {
    email,
    message: "OTP đặt lại mật khẩu đã được gửi về email.",
  };
};

const resetPassword = async ({
  email,
  otpCode,
  newPassword,
}) => {
  const user = await User.findOne({
    where: { email },
  });

  if (!user) {
    throw new Error("Email không tồn tại");
  }

  if (user.otpCode !== otpCode) {
    throw new Error("OTP không chính xác");
  }

  if (!user.otpExpires || user.otpExpires < new Date()) {
    throw new Error("OTP đã hết hạn");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  user.password = hashedPassword;
  user.otpCode = null;
  user.otpExpires = null;

  await user.save();

  return {
    message: "Đặt lại mật khẩu thành công",
  };
};

const editProfile = async (userId, data) => {
  const user = await User.findByPk(userId);

  if (!user) {
    throw new Error("User không tồn tại");
  }

  const allowedFields = [
    "name",
    "phone",
    "address",
    "avatar",
  ];

  allowedFields.forEach((field) => {
    if (data[field] !== undefined) {
      user[field] = data[field];
    }
  });

  await user.save();

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    address: user.address,
    avatar: user.avatar,
    role: user.role,
  };
};

const getProfile = async (userId) => {
  const user = await User.findByPk(userId, {
    // Ẩn các trường nhạy cảm không trả về FE
    attributes: { exclude: ["password", "otpCode", "otpExpires"] } 
  });

  if (!user) {
    throw new Error("User không tồn tại");
  }

  return user;
};

module.exports = {
  register,
  verifyOtp,
  login,
  forgotPassword,
  resetPassword,
  editProfile,
  getProfile,
};