const Product = require("../models/Product");

//1.Product Page
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Failed to get products", error });
  }
};

//2.load create product page
exports.load_create_Product = async (req, res) => {
  try {
    const user = (await req.user) || null; // Get user info from the request
    console.log(`User Info for load create product page : ${user}`);
    res.render("addProduct", { title: "Product", user, body: "" });
  } catch (error) {
    res.status(500).json({ message: "Failed to get products Page", error });
  }
};

//3.Product Add to Page only admin role authority
exports.createProduct = async (req, res) => {
  const { name, description, price, stock, image } = req.body;
  try {
    const product = new Product({ name, description, price, stock, image });
    await product.save();
    // res.status(201).json({ message: "Product created successfully" });

    // Set a flash message
    req.flash("success", "Product added to the Page successfully!");
    // res.redirect("/")
    res.redirect("/api/products/add");
  } catch (error) {
    req.flash("error", "Failed to add product to cart.");
    res.status(400).json({ message: "Product creation failed", error });
  }
};
