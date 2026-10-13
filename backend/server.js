import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import csrf from "csurf";
import { Server } from "socket.io";

// ROUTES
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import employeeRoutes from "./routes/employeeRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import groupRoutes from "./routes/groupRoutes.js";
import supplierRoutes from "./routes/supplierRoutes.js";
import customerRoutes from "./routes/customerRoutes.js";
import surveyRoutes from "./routes/surveyRoutes.js";
import projectSpecificationRoutes from "./routes/projectSpecificationRoutes.js";
import adminEmployeeRoutes from "./routes/adminEmployeeRoutes.js";

// AUTH MIDDLEWARE
import { verifyToken } from "./middleware/authMiddleware.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

// ================= TRUST PROXY (HOSTINGER FIX) =================
app.set("trust proxy", 1);

// ================= SECURITY =================
app.use(helmet());

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
  })
);

// ================= BODY PARSER =================
app.use(express.json());
app.use(cookieParser());

// ================= CORS =================
const allowedOrigins = [
  "http://localhost:5173",
  "https://pmsprojexx.vercel.app"
 
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token", "X-XSRF-TOKEN" ],
  })
);

// ================= CSRF CONFIG =================
// const csrfProtection = csrf({ cookie: true });

// ================= CSRF TOKEN ROUTE =================
// app.get("/api/csrf-token", csrfProtection, (req, res) => {
//   const token = req.csrfToken();

//   // cookie for frontend reading (optional but useful)
//   res.cookie("XSRF-TOKEN", token, {
//     httpOnly: false,
//     secure: true,
//     sameSite: "none",
//      domain: ".rsconsullting.com" // 🔥 VERY IMPORTANT FIX
//   });

//   res.json({ csrfToken: token });
// });
// ================= CSRF CONFIG =================
const csrfProtection = csrf({
  cookie: {
    key: "_csrf",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
  },
});

// ================= CSRF TOKEN ROUTE =================
app.get("/api/csrf-token", csrfProtection, (req, res) => {
  const token = req.csrfToken();

  res.set("Cache-Control", "no-store");

  res.json({
    csrfToken: token,
  });
});

// ================= SOCKET.IO =================
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("🔌 Socket connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("❌ Socket disconnected:", socket.id);
  });
});

// attach socket to request
app.use((req, res, next) => {
  req.io = io;
  next();
});

// ================= DATABASE =================
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => {
    console.error("❌ MongoDB Error:", err.message);
  });

// ================= PUBLIC ROUTES =================
app.use("/api", authRoutes);

// ================= PROTECTED ROUTES =================
app.use("/api/admin", csrfProtection, verifyToken(["Admin"]), adminRoutes);

app.use(
  "/api/employee",
  csrfProtection,
  verifyToken(["Employee"]),
  employeeRoutes
);

app.use(
  "/api/admin/projects",
  csrfProtection,
  verifyToken(["Admin"]),
  projectRoutes
);

app.use(
  "/api/groups",
  csrfProtection,
  verifyToken(["Admin", "Employee"]),
  groupRoutes
);

app.use(
  "/api/admin/suppliers",
  csrfProtection,
  verifyToken(["Admin"]),
  supplierRoutes
);

app.use(
  "/api/admin/customers",
  csrfProtection,
  verifyToken(["Admin"]),
  customerRoutes
);

app.use(
  "/api/admin/surveys",
  csrfProtection,
  verifyToken(["Admin", "Employee"]),
  surveyRoutes
);

app.use(
  "/api/surveys",
  csrfProtection,
  verifyToken(["Employee", "Admin"]),
  surveyRoutes
);

app.use(
  "/api/project-specification",
  csrfProtection,
  verifyToken(["Admin", "Employee"]),
  projectSpecificationRoutes
);

app.use(
  "/api/admin/employees",
  csrfProtection,
  verifyToken(["Admin"]),
  adminEmployeeRoutes
);

// ================= TEST ROUTE =================
app.get("/", (req, res) => {
  res.send("🚀 Server Running Successfully");
});

// ================= ERROR HANDLER =================
app.use((err, req, res, next) => {
  console.error("❌ ERROR:", err.message);

  if (err.code === "EBADCSRFTOKEN") {
    return res.status(403).json({
      message: "Invalid CSRF token",
    });
  }

  res.status(500).json({
    message: err.message || "Internal Server Error",
  });
});

// ================= START SERVER =================
const PORT = process.env.PORT || 3000;

server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

