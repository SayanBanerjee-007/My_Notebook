require("dotenv").config();
const router = require("express").Router();
const Users = require("../database/models/users");
const { validationResult, body } = require("express-validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authenticate = require("../middleware/authenticate");

router
  .route("/signup")
  // Create a user using : POST "/api/auth/signup". No login required
  .post(
    [
      body("name", "Enter a valid name.").notEmpty().isLength({ min: 3, max: 50 }).trim(),
      body("email", "Enter a valid email.").isEmail().trim(),
      body("password", "Password must contain upper and lower case alphabets, numbers and special characters.")
        .isStrongPassword()
        .trim(),
    ],
    async (req, res) => {
      try {
        console.log(req.body);
        const result = validationResult(req);
        // Return if inputs are invalid
        if (!result.isEmpty()) {
          return res.status(400).json({ errors: result.array() });
        }
        // Return if email already exits
        if (await Users.findOne({ email: req.body.email })) {
          return res.status(400).json({ errorMsg: "Email is already used." });
        }
        const newUsers = new Users({
          name: req.body.name,
          email: req.body.email,
          password: await bcrypt.hash(req.body.password, 10),
        });
        const newUserObj = await newUsers.save();
        res.status(200).json({ message: "Signup successful." });
      } catch (err) {
        res.status(500).json({ errorMsg: "Internal Server Error." });
      }
    }
  );
router
  .route("/login")
  // Authenticate user using : POST "/api/auth/login". No login required
  .post(
    [
      body("email", "Enter a valid email.").isEmail().notEmpty().trim(),
      body("password", "Please enter your password.").notEmpty().trim(),
    ],
    async (req, res) => {
      if (req.payload) {
        return res.status(403).json({ errorMsg: "Access Denied." });
      }
      try {
        const result = validationResult(req);
        // Return if inputs are invalid
        if (!result.isEmpty()) {
          return res.status(400).json({ errors: result.array() });
        }
        // Return if email does not exits
        const user = await Users.findOne({ email: req.body.email });
        if (!user) {
          return res.status(400).json({ errorMsg: "Invalid email or password." });
        }
        // Return if password is wrong
        if (!(await bcrypt.compare(req.body.password, user.password))) {
          return res.status(400).json({ errorMsg: "Invalid email or password." });
        }
        const jwtToken = jwt.sign({ email: user.email, _id: user._id }, process.env.JWT_SECRET_STRING, {
          expiresIn: "15d",
        });
        res.cookie("authenticationToken", jwtToken, {
          maxAge: 1000 * 60 * 60 * 24 * 15,
        });
        res.status(200).json({ msg: "Login successful." });
      } catch (err) {
        console.log(err);
        res.status(500).json({ errorMsg: "Internal Server Error." });
      }
    }
  );
router
  .route("/getuserdetails")
  // Getting user details using : POST "/api/auth/getUserDetails". Login required
  .post(authenticate, async (req, res) => {
    try {
      const user = await Users.findById({ _id: req.payload._id }).select("-password");
      res.status(200).json(user);
    } catch (err) {
      res.status(500).json({ errorMsg: "Internal Server Error." });
    }
  });

module.exports = router;
