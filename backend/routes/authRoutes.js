
// import express from "express";
// import User from "../models/User.js";
// import bcrypt from "bcryptjs";
// import jwt from "jsonwebtoken";
// import { body, validationResult } from "express-validator";

// const router = express.Router();

// // ================= SIGNUP =================
// router.post(
//   "/signup",
//   [
//     body("firstName").notEmpty().withMessage("First name required"),
//     body("lastName").notEmpty().withMessage("Last name required"),
//     body("email").isEmail().withMessage("Valid email required"),
//     body("password")
//       .isLength({ min: 6 })
//       .withMessage("Password must be at least 6 characters"),
//   ],
//   async (req, res) => {
//     try {
//       // 🔍 Validation check
//       const errors = validationResult(req);
//       if (!errors.isEmpty()) {
//         return res.status(400).json({ errors: errors.array() });
//       }

//       const { firstName, lastName, email, password, userId, role } = req.body;

//       // check existing user
//       const existingUser = await User.findOne({ email });
//       if (existingUser) {
//         return res.status(400).json({ msg: "User already exists" });
//       }

//       // hash password
//       const hashedPassword = await bcrypt.hash(password, 10);

//       const user = new User({
//         firstName,
//         lastName,
//         email,
//         password: hashedPassword,
//         userId,
//         role: role || "Employee",
//       });

//       await user.save();

//       res.status(201).json({ msg: "Signup successful" });
//     } catch (err) {
//       console.error("Signup Error:", err);
//       res.status(500).json({ msg: "Server error" });
//     }
//   }
// );

// // ================= LOGIN =================
// router.post(
//   "/login",
//   [
//     body("email").isEmail().withMessage("Valid email required"),
//     body("password").notEmpty().withMessage("Password required"),
//   ],
//   async (req, res) => {
//     try {
//       // 🔍 Validation check
//       const errors = validationResult(req);
//       if (!errors.isEmpty()) {
//         return res.status(400).json({ errors: errors.array() });
//       }

//       const { email, password } = req.body;

//       console.log("🔐 Login attempt:", email);

//       const user = await User.findOne({ email });
//       if (!user) {
//         return res.status(401).json({ msg: "Invalid email or password" });
//       }

//       const isMatch = await bcrypt.compare(password, user.password);
//       if (!isMatch) {
//         return res.status(401).json({ msg: "Invalid email or password" });
//       }

//       // 🔐 JWT Token
//       const token = jwt.sign(
//         {
//           id: user._id,
//           userId: user.userId,
//           firstName: user.firstName,
//           lastName: user.lastName,
//           role: user.role,
//           departments: Array.isArray(user.departments)
//             ? user.departments
//             : [user.departments],
//         },
//         process.env.JWT_SECRET,
//         { expiresIn: "1d" }
//       );

//       // 🍪 Secure Cookie
//       res.cookie("token", token, {
//         httpOnly: true,
//         secure: process.env.NODE_ENV === "production",
//         sameSite: "Strict",
//         maxAge: 24 * 60 * 60 * 1000,
//       });

//       res.json({
//         msg: "Login successful",
//         user: {
//           id: user._id,
//           name: `${user.firstName} ${user.lastName}`,
//           email: user.email,
//           userId: user.userId,
//           role: user.role,
//           departments: Array.isArray(user.departments)
//             ? user.departments
//             : [user.departments],
//         },
//       });
//     } catch (err) {
//       console.error("Login Error:", err);
//       res.status(500).json({ msg: "Server error" });
//     }
//   }
// );

// // ================= LOGOUT =================
// router.post("/logout", (req, res) => {
//   try {
//     res.clearCookie("token", {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: "Strict",
//     });
//     //  res.clearCookie("_csrf");
//     res.json({ msg: "Logged out successfully" });
//   } catch (err) {
//     console.error("Logout Error:", err);
//     res.status(500).json({ msg: "Server error" });
//   }
// });

// export default router;

import express from "express";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { body, validationResult } from "express-validator";

const router = express.Router();

// ================= SIGNUP =================
router.post(
  "/signup",
  [
    body("email").isEmail(),
    body("password").isLength({ min: 6 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { firstName, lastName, email, password, userId, role } = req.body;

      const existing = await User.findOne({ email });
      if (existing) return res.status(400).json({ msg: "User exists" });

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await User.create({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        userId,
        role: role || "Employee",
      });

      res.status(201).json({ msg: "Signup successful" });
    } catch (err) {
      res.status(500).json({ msg: "Server error" });
    }
  }
);

// ================= LOGIN =================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ msg: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ msg: "Invalid credentials" });

    // 🔐 JWT
    // const token = jwt.sign(
    //   {
    //     id: user._id,
    //     role: user.role,
    //     departments: user.departments,
    //   },
    //   process.env.JWT_SECRET,
    //   { expiresIn: "7d" } // 🔥 increased from 1d
    // );

    
const token = jwt.sign(
  {
    id: user._id.toString(),
    userId: user.userId,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    departments: user.departments || [],
  },
  process.env.JWT_SECRET,
  { expiresIn: "7d" }
);


    // 🍪 COOKIE FIX (IMPORTANT)
    res.cookie("token", token, {
      httpOnly: true,

      // 🔥 IMPORTANT FIX FOR HOSTINGER + HTTPS
      secure: true,

      // 🔥 IMPORTANT (cross-subdomain)
      sameSite: "none",

      path: "/",

      // 🔥 keep alive 7 days
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      msg: "Login successful",
      token,
      user: {
        // id: user._id,
        email: user.email,
        role: user.role,
        departments: user.departments,
         id: user._id.toString(),
    userId: user.userId,
    firstName: user.firstName,
    lastName: user.lastName,
    
   
   
      },
    });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// ================= LOGOUT =================
router.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
  });

  res.json({ msg: "Logged out" });
});

export default router;