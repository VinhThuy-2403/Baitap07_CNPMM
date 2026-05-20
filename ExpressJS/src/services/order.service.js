const { Order, OrderItem, Cart, Product } = require("../models/index");
const { Op } = require("sequelize");

const STATUS_LABELS = {
  pending: "Đơn hàng mới",
  confirmed: "Đã xác nhận",
  preparing: "Đang chuẩn bị hàng",
  shipping: "Đang giao hàng",
  delivered: "Đã giao thành công",
  cancelled: "Đã hủy",
  cancel_requested: "Yêu cầu hủy đơn",
};

// Tạo đơn hàng COD
const createOrder = async (userId, { shippingName, shippingPhone, shippingAddress, note }) => {
  // Lấy giỏ hàng
  const cartItems = await Cart.findAll({
    where: { userId },
    include: [{ model: Product, as: "product" }],
  });

  if (!cartItems || cartItems.length === 0) {
    const error = new Error("Giỏ hàng trống");
    error.status = 400;
    throw error;
  }

  // Kiểm tra tồn kho
  for (const item of cartItems) {
    if (item.product.stock < item.quantity) {
      const error = new Error(
        `Sản phẩm "${item.product.name}" chỉ còn ${item.product.stock} trong kho`
      );
      error.status = 400;
      throw error;
    }
  }

  // Tính tổng tiền
  const totalAmount = cartItems.reduce((sum, item) => {
    const price = item.product.salePrice || item.product.price;
    return sum + price * item.quantity;
  }, 0);

  // Tạo đơn hàng
  const order = await Order.create({
    userId,
    status: "pending",
    paymentMethod: "cod",
    paymentStatus: "unpaid",
    totalAmount,
    shippingName,
    shippingPhone,
    shippingAddress,
    note: note || null,
  });

  // Tạo order items + trừ stock
  for (const item of cartItems) {
    const price = item.product.salePrice || item.product.price;
    await OrderItem.create({
      orderId: order.id,
      productId: item.productId,
      productName: item.product.name,
      productImage: item.product.image,
      price,
      quantity: item.quantity,
    });

    // Trừ stock + tăng sold
    await item.product.update({
      stock: item.product.stock - item.quantity,
      sold: item.product.sold + item.quantity,
    });
  }

  // Xóa giỏ hàng
  await Cart.destroy({ where: { userId } });

  // Tự động xác nhận sau 5 phút
  setTimeout(async () => {
    try {
      const freshOrder = await Order.findByPk(order.id);
      if (freshOrder && freshOrder.status === "pending") {
        await freshOrder.update({
          status: "confirmed",
          confirmedAt: new Date(),
        });
        console.log(`Order #${order.id} auto-confirmed`);
      }
    } catch (err) {
      console.error("Auto confirm error:", err.message);
    }
  }, 5 * 60 * 1000); // 5 phút

  return order;
};

// Lấy danh sách đơn hàng của user
const getOrders = async (userId, { page = 1, limit = 10, status }) => {
  const where = { userId };
  if (status) where.status = status;

  const offset = (page - 1) * limit;
  const { count, rows } = await Order.findAndCountAll({
    where,
    include: [{ model: OrderItem, as: "items" }],
    order: [["createdAt", "DESC"]],
    limit,
    offset,
  });

  return {
    data: rows,
    pagination: {
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
    },
  };
};

// Lấy chi tiết đơn hàng
const getOrderById = async (userId, orderId) => {
  const order = await Order.findOne({
    where: { id: orderId, userId },
    include: [{ model: OrderItem, as: "items" }],
  });

  if (!order) {
    const error = new Error("Không tìm thấy đơn hàng");
    error.status = 404;
    throw error;
  }

  return order;
};

// Hủy đơn hàng
const cancelOrder = async (userId, orderId) => {
  const order = await Order.findOne({ where: { id: orderId, userId } });

  if (!order) {
    const error = new Error("Không tìm thấy đơn hàng");
    error.status = 404;
    throw error;
  }

  // Chỉ cho hủy ở trạng thái pending hoặc confirmed
  if (!["pending", "confirmed", "preparing"].includes(order.status)) {
    const error = new Error("Không thể hủy đơn hàng ở trạng thái này");
    error.status = 400;
    throw error;
  }

  // Nếu đang chuẩn bị hàng → chuyển sang yêu cầu hủy
  if (order.status === "preparing") {
    await order.update({
      status: "cancel_requested",
      cancelRequestedAt: new Date(),
    });
    return { message: "Đã gửi yêu cầu hủy đơn hàng cho shop", order };
  }

  // Kiểm tra 30 phút
  const createdAt = new Date(order.createdAt);
  const now = new Date();
  const diffMinutes = (now - createdAt) / 1000 / 60;

  if (diffMinutes > 5) {
    const error = new Error("Chỉ được hủy đơn trong vòng 30 phút sau khi đặt");
    error.status = 400;
    throw error;
  }

  // Hoàn lại stock
  const items = await OrderItem.findAll({ where: { orderId } });
  for (const item of items) {
    const product = await Product.findByPk(item.productId);
    if (product) {
      await product.update({
        stock: product.stock + item.quantity,
        sold: Math.max(0, product.sold - item.quantity),
      });
    }
  }

  await order.update({ status: "cancelled" });
  return { message: "Đã hủy đơn hàng thành công", order };
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  cancelOrder,
  STATUS_LABELS,
};