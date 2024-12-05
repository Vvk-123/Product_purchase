const express = require("express");
const {
  getProducts,
  createProduct,
  load_create_Product,
} = require("../controllers/productController");
const {
  authMiddleware,
  adminMiddleware,
} = require("../middleware/authMiddleware");
const router = express.Router();

router.get("/getProduct", getProducts);
router.get("/add", load_create_Product);
router.post("/add", authMiddleware, adminMiddleware, createProduct);

module.exports = router;
