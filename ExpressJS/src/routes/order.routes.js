const express = require("express");
const router = express.Router();
const orderController = require("../controllers/order.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");

router.use(authMiddleware);

router.post("/", orderController.createOrder);
router.get("/", orderController.getOrders);
router.get("/:id", orderController.getOrderById);
router.post("/:id/cancel", orderController.cancelOrder);

module.exports = router;