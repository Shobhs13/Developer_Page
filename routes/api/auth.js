const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const jwt = require("jsonwebtoken");
const config = require("config");
const bcrypt = require("bcryptjs");

const { check, validationResult } = require("express-validator");

const User = require("../../models/User");
router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(-"password");
    res.json(user);
  } catch {
    console.error(err.message);
    res.status(200).send("Server Error");
  }
});

router.post(
  "/",
  [
    check("email", "Email must include a valid email").isEmail(),
    check("password", "password is requires").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      // see if user exist
      let user = await User.findOne({ email });

      if (!user) {
        res.status(400).json({ errors: [{ msg: "Invalid credentials" }] });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        res.status(400).json({ errors: [{ msg: "Invalid credentials" }] });
      }

      // return JWT
      const payload = {
        user: {
          id: user.id,
        },
      };

      jwt.sign(
        payload,
        config.get("jwtSecret"),
        { expiresIn: 360000 },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

module.exports = router;
