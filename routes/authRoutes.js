const express = require("express");
const {
  register,
  login,
  load_register,
  load_login,
  logout,
  checkRole,adminRole,
} = require("../controllers/authController");

const { attachUser } = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/register", register);
router.get("/register", load_register);
router.get("/login", load_login);
router.post("/login", login);
router.get("/admin", attachUser, adminRole);
router.get("/check-role", attachUser, checkRole);
router.get("/logout", attachUser, logout);

module.exports = router;
