/*
    path: api/login
*/

const { Router } = require("express");
const { check } = require("express-validator");

// Controllers
const { createUser, login, renewToken } = require("../controllers/auth");
const { validateFields } = require("../middlewares/validate-fields");
const { validateJWT } = require("../middlewares/validate-jwt");

const router = Router();

// Create new users
router.post(
  "/new",
  [
    check("name", "Name is mandatory").not().isEmpty(),
    check("password", "Password is mandatory").not().isEmpty(),
    check("email", "Email is mandatory").isEmail(),
    validateFields,
  ],
  createUser
);

// Login
router.post(
  "/",
  [
    check("email", "Email is mandatory").isEmail(),
    check("password", "Password is mandatory").not().isEmpty(),
    validateFields,
  ],
  login
);

// Renew token
router.get("/renew", validateJWT, renewToken);

module.exports = router;
