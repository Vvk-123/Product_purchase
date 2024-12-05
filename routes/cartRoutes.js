const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");
const { ensureAuthenticated } = require("../middleware/authMiddleware");

// // GET: View cart
router.get("/", ensureAuthenticated, cartController.getCart);

// POST: Add product to cart
router.post("/add", ensureAuthenticated, cartController.addToCart);

// POST: Remove product from cart
router.post("/remove", ensureAuthenticated, cartController.removeFromCart);

// POST: Clear the cart (optional)
router.post("/clear", ensureAuthenticated, cartController.clearCart);

module.exports = router;
