const { Product, ProductImage } = require("../models/index");
const { Op } = require("sequelize");

const getProducts = async ({ where = {}, page = 1, limit = 6, order = [["createdAt", "DESC"]] }) => {
  const offset = (page - 1) * limit;
  const { count, rows } = await Product.findAndCountAll({
    where,
    limit,
    offset,
    order,
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

const getSaleProducts = async ({ page, limit }) => {
  return getProducts({ where: { isSale: true }, page, limit });
};

const getNewProducts = async ({ page, limit }) => {
  return getProducts({ where: { isNew: true }, page, limit });
};

const getBestSellerProducts = async ({ page, limit }) => {
  return getProducts({ where: { isBestSeller: true }, page, limit });
};

const getAllProducts = async ({ page, limit, brand, category }) => {
  const where = {};
  if (brand) where.brand = brand;
  if (category) where.category = category;
  return getProducts({ where, page, limit });
};

// Lấy chi tiết 1 sản phẩm kèm ảnh
const getProductById = async (id) => {
  const product = await Product.findByPk(id, {
    include: [
      {
        model: ProductImage,
        as: "images",
        attributes: ["url", "order"],
        order: [["order", "ASC"]],
      },
    ],
  });
  if (!product) {
    const error = new Error("Sản phẩm không tồn tại");
    error.status = 404;
    throw error;
  }
  return product;
};

// Lấy sản phẩm tương tự (cùng danh mục, khác id)
const getRelatedProducts = async ({ category, excludeId, limit = 6 }) => {
  const rows = await Product.findAll({
    where: {
      category,
      id: { [Op.ne]: excludeId },
    },
    limit,
    order: [["sold", "DESC"]],
  });
  return rows;
};

const searchProducts = async ({ keyword, brand, category, minPrice, maxPrice, isNew, isBestSeller, isSale, sortBy, page, limit }) => {
  const where = {};
  const { Op } = require("sequelize");

  if (keyword) {
    where.name = { [Op.like]: `%${keyword}%` };
  }
  if (brand) where.brand = brand;
  if (category) where.category = category;
  if (isNew === "true") where.isNew = true;
  if (isBestSeller === "true") where.isBestSeller = true;
  if (isSale === "true") where.isSale = true;
  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price[Op.gte] = parseInt(minPrice);
    if (maxPrice) where.price[Op.lte] = parseInt(maxPrice);
  }

  let order = [["createdAt", "DESC"]];
  if (sortBy === "price_asc") order = [["price", "ASC"]];
  if (sortBy === "price_desc") order = [["price", "DESC"]];
  if (sortBy === "best_seller") order = [["sold", "DESC"]];
  if (sortBy === "newest") order = [["createdAt", "DESC"]];

  return getProducts({ where, page, limit, order });
};

module.exports = {
  getSaleProducts,
  getNewProducts,
  getBestSellerProducts,
  getAllProducts,
  getProductById,
  getRelatedProducts,
  searchProducts
};