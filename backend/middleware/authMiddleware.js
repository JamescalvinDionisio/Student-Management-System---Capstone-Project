const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  console.log("========== AUTH CHECK ==========");
  console.log("Authorization header exists:", !!authHeader);

  if (!authHeader) {
    console.log("❌ No Authorization header");

    return res.status(401).json({
      message: "No token provided"
    });
  }

  const parts = authHeader.split(" ");

  console.log("Authorization format valid:", parts.length === 2);
  console.log("Authorization type:", parts[0]);

  if (parts.length !== 2 || parts[0] !== "Bearer") {
    console.log("❌ Invalid authorization format");

    return res.status(401).json({
      message: "Invalid authorization format"
    });
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    console.log("✅ JWT verified successfully");
    console.log("User ID:", decoded.id);
    console.log("User role:", decoded.role);

    req.user = decoded;

    next();

  } catch (error) {

    console.log("❌ JWT verification failed");
    console.log("Reason:", error.message);

    return res.status(401).json({
      message: "Invalid or expired token"
    });
  }
};

module.exports = authMiddleware;