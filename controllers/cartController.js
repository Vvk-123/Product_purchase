const Cart = require("../models/Cart");
const Product = require("../models/Product");

//1. Get the cart for a user
exports.getCart = async (req, res) => {
  try {
    // Check if the user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(403).json({ message: "User not authenticated." });
    }

    const userId = req.user.id; // Get user ID from authenticated user
    console.log("User ID:", userId);
    console.log("User is coming to Cart");

    // Find the cart associated with the user
    const cart = await Cart.findOne({ userId }).populate("products.productId");
    if (!cart || cart.products.length === 0) {
      // If the cart is empty, render an empty cart view
      return res.render("cart", {
        title: "Your Cart",
        body: "",
        cart: null,
        total: 0,
        user: req.user,
      });
    }

    // Calculate the total cart value
    // let total = 0;
    // cart.products.forEach((item) => {
    //   total += item.productId.price * item.quantity;
    // });

    // Calculate the total price
    let total = 0;
    cart.products.forEach((item) => {
      if (item.productId && item.productId.price) {
        total += item.productId.price * item.quantity;
      }
    });

    // Render the cart view with the cart details
    res.render("cart", {
      title: "Your Cart",
      body: "",
      cart,
      total,
      user: req.user,
    });
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.status(500).json({ error: error.message });
  }
};

//2. Add a product to the cart
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    // Log the incoming request data
    console.log("Request Body:", req.body);
    console.log("Authenticated User:", req.user);

    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(403).json({ message: "User not authenticated." });
    }

    // Find the product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    // Find or create the cart
    let cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      cart = new Cart({ userId: req.user.id, products: [] });
    }

    // Check if the product already exists in the cart
    const existingProductIndex = cart.products.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (existingProductIndex > -1) {
      // Update the quantity if product exists
      cart.products[existingProductIndex].quantity += parseInt(quantity, 10);
    } else {
      // Add the product to the cart
      cart.products.push({ productId, quantity: parseInt(quantity, 10) });
    }

    // Save the updated cart
    await cart.save();
    // res.send("Product Added to the cart");

    // Flash success message
    req.flash("success", "Product added to cart successfully.");

    // Redirect to cart page
    res.redirect("/api/cart");
  } catch (error) {
    console.error("Error adding product to cart:", error.message);
    req.flash("error", "Failed to add product to cart.");
    res.status(500).json({ error: "Internal Server Error" });
  }
};

//3. Remove a product from the cart
exports.removeFromCart = async (req, res) => {
  try {
    const { productId } = req.body;

    // Log the incoming request data
    console.log("Request Body:", req.body);
    console.log("Authenticated User:", req.user);

    let cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.products = cart.products.filter(
      (item) => item.productId.toString() !== productId
    );
    await cart.save();
    // res.send("Product deleted from the cart");
    // Flash success message
    req.flash("success", "Product deletd from cart successfully.");

    res.redirect("/api/cart");
  } catch (error) {
    req.flash("error", "Failed to delete product to cart.");
    res.status(500).json({ error: error.message });
  }
};

//4. Clear the cart (optional)
// exports.clearCart = async (req, res) => {
//   try {
//     await Cart.findOneAndDelete({ userId: req.user._id });
//     res.redirect("/api/cart");
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// gpt Clear the cart
exports.clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id });
    console.log("User Id for cart clear : ", cart);

    if (!cart) {
      // If no cart exists, redirect with a friendly message
      req.flash("info", "Your cart is already empty.");
      return res.redirect("/api/cart");
    }

    await Cart.findOneAndDelete({ userId: req.user.id });

    // Add a success flash message
    req.flash("success", "Your cart has been cleared successfully.");
    res.redirect("/api/cart"); // Redirect to the cart page
  } catch (error) {
    console.error("Error clearing the cart:", error);
    req.flash(
      "error",
      "An error occurred while clearing the cart. Please try again."
    );
    res.redirect("/api/cart"); // Redirect to the cart page with an error message
  }
};
