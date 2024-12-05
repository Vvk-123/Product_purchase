const jwt = require("jsonwebtoken");
const User = require("../models/User");

//1. For Product Route
exports.authMiddleware = async (req, res, next) => {
  // console.log(req.headers);
  // const token = await req.header("Authorization")?.replace("Bearer ", "");
  const token = req.cookies.authToken;

  console.log(`authMiddleware_token : ${token}`); // Log the received token

  if (!token) return res.status(401).json({ message: "Access denied" });

  try {
    // console.log(token);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password"); //This method is used to exclude the password field from the user document that is being retrieved.
    console.log("Decoded token:", decoded);
    console.log("User:", req.user);
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

//2. For Product Route
exports.adminMiddleware = (req, res, next) => {
  console.log("req.user:", req.user);

  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access only" });
  }
  next();
};

//3. For Cart Route Middleware
exports.ensureAuthenticated = async (req, res, next) => {
  // const token = req.header("Authorization")?.replace("Bearer ", "");
  const token = req.cookies.authToken; // for cookies

  // console.log(`ensureAuthenticated_token  for Cart Route   :   ${token}`); // Log the received token

  if (!token) {
    return res
      .status(403)
      .json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify the token
    req.user = decoded; // Attach user data to the request object
    console.log("Decoded user for cart:", req.user); // Log the decoded user
    next(); // Proceed to the next middleware or route handler
  } catch (err) {
    console.error("Token verification error:", err); // Log verification errors
    return res.status(401).json({ message: "Invalid token." });
  }
};

// For Home Page Index.ejs middleware
//4.Middleware to attach user based on token
exports.attachUser = async (req, res, next) => {
  // const token = req.header("Authorization")?.replace("Bearer ", "");
  const token = req.cookies.authToken; // Use cookies instead of headers
  // console.log(`Below line print in attachUser in authMiddleware.js file`);
  console.log(`attachUser_token retrieved: ${token || "No token found"}`);

  if (!token) {
    console.log("No token provided");
    return next(); // Continue without attaching a user
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      console.log("No user found with this token");
      return next();
    }

    console.log("Decoded token: ", decoded);
    console.log("User found: ", req.user);
  } catch (error) {
    console.log("Invalid token or error verifying token: ", error.message);
  }

  next();
};
