const User = require("../models/User");

const jwt = require("jsonwebtoken");

//1.GET request to serve the registration page using this controller
exports.load_register = async (req, res) => {
  const user = (await req.user) || null; // Get user info from the request
  res.render("register", { title: "Register", user, body: "" }); // Render register.ejs
};

//2.Registered the User using this controller
exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const user = await User.create({ name, email, password, role }); //use this line for dropdown
    // res.status(201).send({ message: "User registered successfully" });
    console.log(user);
    // res.status(201).render("layout", { title: "Register", user, body: "" });
    // Flash success message
    // req.flash("success", "Registration successfully.");
    // res.status(201).json({ message: "Registration Successfully" });
    res.redirect("/api/auth/login");
  } catch (error) {
    req.flash("error", "Please Register try again.");
    res.status(400).send({ message: "Registration failed", error });
    console.log(error);
  }
};

//3.GET request to serve the login page using this controller
exports.load_login = async (req, res) => {
  const user = req.user || null; // Get user info from the request
  res.render("login", { title: "Login", user, body: "" }); // Pass user to login.ejs
};

//4.Login the User using this controller
exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign(
      { id: user._id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    // Set the token as an HttpOnly cookie
    res.cookie("authToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });

    res.json({ token });
    console.log(`Toekn Genderated After Login : ${token}`);
    console.log(`${user.name} has Log In`);
  } catch (error) {
    res.status(500).json({ message: "Login failed", error });
    console.log(error);
  }
};

//5. Check Role
exports.checkRole = (req, res) => {
  try {
    const userRole = req.user.role; // Extract role from authenticated user
    res.status(200).json({ role: userRole });
    // res.render("adminDashboard", {
    //   title: "Admin Dashboard",
    //   user: req.user,
    //   body: "",
    // });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch role", error: error.message });
  }
};

//6. Admin Role
exports.adminRole = (req, res) => {
  try {
    const userRole = req.user.role; // Extract role from authenticated user

    if (userRole === "admin") {
      res.render("adminDashboard", {
        title: "Admin Dashboard",
        user: req.user,
        body: "",
      });
    } else {
      res.status(403).send("Access Denied: Admins only!"); // Deny access to non-admins
      //  res.status(200).json({ role: userRole });
    }
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch role",
      error: error.message,
    });
  }
};

//7. Logout the user
exports.logout = async (req, res) => {
  const userName = req.user ? req.user.name : "Unknown user";

  // Log user logout action to the server console
  // console.log(`${userName} has logged out.`);
  // res.clearCookie("authToken"); // Clear the cookie
  // // res.json({ message: "Logged out successfully" });
  // // const user = req.user || null; // Get user info from the request
  // res.redirect("/api/auth/login"); // Redirect to the login page
  // Clear the authentication cookie
  res.clearCookie("authToken");

  // Use setTimeout to delay the console log and redirect
  setTimeout(() => {
    // Log user logout action to the server console after 2 seconds
    console.log(`${userName} has logged out.`);

    // Redirect to the login page after 2 seconds
    // res.redirect("/api/auth/login");
    res.render("logout", { title: "logout", user: "", body: "" });
  }, 2000);
};
