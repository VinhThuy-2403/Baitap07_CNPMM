const reviewService = require("../services/review.service");

const addReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, rating, comment } = req.body;

    if (!productId || !rating) {
      return res.status(400).json({
        success: false,
        message: "Thông tin productId và số sao rating là bắt buộc.",
      });
    }

    const result = await reviewService.createReview(userId, productId, rating, comment);
    return res.status(201).json({
      success: true,
      message: `Đánh giá thành công! Bạn nhận được +${result.rewardPoints} điểm tích lũy vào tài khoản.`,
      data: result,
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      message: error.message,
    });
  }
};

const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const reviews = await reviewService.getReviewsByProduct(productId);
    return res.json({ success: true, data: reviews });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  addReview,
  getProductReviews,
};