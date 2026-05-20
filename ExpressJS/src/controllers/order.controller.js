const orderService = require("../services/order.service");

const createOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { shippingName, shippingPhone, shippingAddress, note } = req.body;

    if (!shippingName || !shippingPhone || !shippingAddress) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng điền đầy đủ thông tin giao hàng",
      });
    }

    const order = await orderService.createOrder(userId, {
      shippingName,
      shippingPhone,
      shippingAddress,
      note,
    });

    return res.status(201).json({
      success: true,
      message: "Đặt hàng thành công!",
      data: order,
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      message: error.message,
    });
  }
};

const getOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const { status } = req.query;

    const result = await orderService.getOrders(userId, { page, limit, status });
    return res.json({ success: true, ...result });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getOrderById = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const order = await orderService.getOrderById(userId, id);
    return res.json({ success: true, data: order });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      message: error.message,
    });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const result = await orderService.cancelOrder(userId, id);
    return res.json({ success: true, ...result });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = { createOrder, getOrders, getOrderById, cancelOrder };