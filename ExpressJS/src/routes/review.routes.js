const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/review.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");

router.post("/", authMiddleware, reviewController.addReview);
router.get("/product/:productId", reviewController.getProductReviews);

module.exports = router;