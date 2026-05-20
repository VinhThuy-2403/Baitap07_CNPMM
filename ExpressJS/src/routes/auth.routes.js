const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth.controller");

const {
  registerLimiter,
  verifyOtpLimiter,
  loginLimiter,
  forgotPasswordLimiter,
} = require("../middlewares/rateLimit.middleware");

const {
  registerRules,
  verifyOtpRules,
  loginRules,
  forgotPasswordValidation,
  resetPasswordValidation,
  editProfileValidation,
  validate,
} = require("../middlewares/validate.middleware");

const { authMiddleware } = require("../middlewares/auth.middleware");

router.post(
  "/register",
  registerLimiter,
  registerRules,
  validate,
  authController.register
);

router.post(
  "/verify-otp",
  verifyOtpLimiter,
  verifyOtpRules,
  validate,
  authController.verifyOtp
);

router.post(
  "/login",
  loginLimiter,
  loginRules,
  validate,
  authController.login
);

router.post(
  "/forgot-password",
  forgotPasswordLimiter,
  forgotPasswordValidation,
  authController.forgotPassword
);

router.post(
  "/reset-password",
  resetPasswordValidation,
  authController.resetPassword
);

router.put(
  "/edit-profile",
  authMiddleware,
  editProfileValidation,
  authController.editProfile
);


router.get(
  "/profile",
  authMiddleware,
  authController.getProfile
);

module.exports = router;