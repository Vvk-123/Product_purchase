const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const jwt = require("jsonwebtoken"); // Ensure JWT is imported
const cookieParser = require("cookie-parser"); // Import cookie-parser
const session = require("express-session");
const flash = require("connect-flash");
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const Product = require("./models/Product");
const Cart = require("./models/Cart");
const cartRoutes = require("./routes/cartRoutes");
const { authMiddleware, attachUser } = require("./middleware/authMiddleware");

//1. Load environment variables
dotenv.config();

const app = express();
app.use(express.json()); // For parsing JSON data
app.use(express.urlencoded({ extended: false })); // For parsing form data
app.use(cookieParser()); // Add cookie-parser to middleware

//2. Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, "public")));

//3. Middleware for session
app.use(
  session({
    secret: process.env.SESSION_SECRET, // Change this to a secure key
    resave: false,
    saveUninitialized: true,
  })
);

//4. Middleware for flash messages
app.use(flash());

//5. Middleware to make flash messages available in templates
app.use((req, res, next) => {
  res.locals.messages = req.flash(); // Make flash messages available in templates
  next();
});

//6. Set EJS as the templating engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views")); // Set the views directory

//7. Middleware to attach user globally
app.use(attachUser); // This will ensure that user is attached for every route

//8. Database connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("DB Connection Error: ", err));

//9. Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes); // Cart routes

//10. Home Route: Render the index.ejs
app.get("/", async (req, res) => {
  try {
    const products = await Product.find(); // Fetch products from the database
    const user = req.user || null; // Get user info from the request (set by attachUser middleware)
    // console.log(`Below line print in / route in server.js file`)
    console.log(
      `User Info on Home Route: ${user ? user.name : "No user logged in"}`
    );

    //10.1 Render index.ejs with products and user data
    res.render("index", {
      title: "Home",
      products,
      user,
      body: "", // Add any other data needed in the template
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).send("Error fetching products");
  }
});

//11. Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
