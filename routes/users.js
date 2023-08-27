const express = require("express");
const router = express.Router();
const User = require("../models/user");
const passport = require("passport");
const users = require("../controllers/users");
const { storeReturnTo } = require("../middlevare");

router.route("/register").get(users.renderRegisterForm).post(users.register);

router
  .route("/login")
  .get(users.renderLoginForm)
  .post(
    storeReturnTo,
    passport.authenticate("local", {
      failureFlash: true,
      failureRedirect: "/login",
    }),
    users.login
  );

router.get("/logout", users.logout);

module.exports = router;
