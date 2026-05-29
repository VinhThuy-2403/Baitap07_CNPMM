const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Order = sequelize.define(
  "Order",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(
        "pending",
        "confirmed",
        "preparing",
        "shipping",
        "delivered",
        "cancelled",
        "cancel_requested"
      ),
      defaultValue: "pending",
    },
    paymentMethod: {
      type: DataTypes.ENUM("cod"),
      defaultValue: "cod",
    },
    paymentStatus: {
      type: DataTypes.ENUM("unpaid", "paid"),
      defaultValue: "unpaid",
    },
    totalAmount: {
      type: DataTypes.DECIMAL(15, 0),
      allowNull: false,
    },
    shippingName: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    shippingPhone: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    shippingAddress: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    note: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    confirmedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    cancelRequestedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    // Thêm các cột này vào model Order
    discountCode: { type: DataTypes.STRING, allowNull: true },
    discountPercent: { type: DataTypes.INTEGER, defaultValue: 0 },
    pointsUsed: { type: DataTypes.INTEGER, defaultValue: 0 },
    pointsDiscount: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 }, 
    finalAmount: { type: DataTypes.DECIMAL(10, 2), allowNull: false }, 
  },
  {
    tableName: "orders",
    timestamps: true,
  }
);

module.exports = Order;