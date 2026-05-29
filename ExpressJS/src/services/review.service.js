const { Review, Order, OrderItem, User } = require("../models/index");

const createReview = async (userId, productId, rating, comment) => {
  // 1. Kiểm tra xem user đã có đơn hàng nào ở trạng thái "confirmed" chưa
  const confirmedOrders = await Order.findAll({
    where: { userId, status: "confirmed" },
  });

  if (!confirmedOrders || confirmedOrders.length === 0) {
    const error = new Error("Bạn chỉ có thể đánh giá sản phẩm từ đơn hàng đã xác nhận thành công.");
    error.status = 400;
    throw error;
  }

  // 2. Kiểm tra xem trong các đơn hàng 'confirmed' đó có chứa sản phẩm này không
  const orderIds = confirmedOrders.map((order) => order.id);
  const hasBoughtProduct = await OrderItem.findOne({
    where: { orderId: orderIds, productId },
  });

  if (!hasBoughtProduct) {
    const error = new Error("Bạn chưa mua sản phẩm này hoặc đơn hàng chưa được xác nhận.");
    error.status = 400;
    throw error;
  }

  // 3. Kiểm tra xem user đã từng đánh giá sản phẩm này chưa (tránh spam tích lũy điểm)
  const existingReview = await Review.findOne({ where: { userId, productId } });
  if (existingReview) {
    const error = new Error("Sản phẩm này đã được bạn đánh giá trước đó.");
    error.status = 400;
    throw error;
  }

  // 4. Tiến hành lưu bài đánh giá
  const review = await Review.create({ userId, productId, rating, comment });

  // 5. Cộng điểm tích lũy thưởng cho tài khoản (Ví dụ: +50 điểm)
  const rewardPoints = 50;
  const user = await User.findByPk(userId);
  if (user) {
    await user.update({ points: user.points + rewardPoints });
  }

  // Trả về dữ liệu kèm thông tin user vừa tạo để frontend cập nhật UI tức thì
  const reviewWithUser = await Review.findByPk(review.id, {
    include: [{ model: User, as: "user", attributes: ["name"] }],
  });

  return { review: reviewWithUser, rewardPoints, totalPoints: user ? user.points : 0 };
};

const getReviewsByProduct = async (productId) => {
  return await Review.findAll({
    where: { productId },
    include: [{ model: User, as: "user", attributes: ["name"] }],
    order: [["createdAt", "DESC"]],
  });
};

module.exports = {
  createReview,
  getReviewsByProduct,
};