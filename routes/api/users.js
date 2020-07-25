const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const config = require("config");

const { check, validationResult } = require("express-validator");

const User = require("../../models/User");
router.post(
  "/",
  [
    check("name", "Name is required").not().isEmpty(),
    check("email", "Email must include a valid email").isEmail(),
    check(
      "password",
      "please enter a password with 6 or more characters"
    ).isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
      // see if user exist
      let user = await User.findOne({ email });

      if (user) {
        res.status(400).json({ errors: [{ msg: "User already exists" }] });
      }
      // get users gravatar
      const avatar = gravatar.url(email, {
        s: "200",
        r: "pg",
        d: "mm",
      });
      //create user insatance
      user = new User({
        name,
        email,
        avatar,
        password,
      });
      // encrypt using bcrypt
      // create a salt to hashing
      const salt = await bcrypt.genSalt(10);

      user.password = await bcrypt.hash(password, salt);

      await user.save();
      // return JWT
      const payload = {
        user: {
          id: user.id,
        },
      };

      jwt.sign(
        payload,
        config.get("jwtSecret"),
        { expiresIn: "5 days" },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  }
);
module.exports = router;
