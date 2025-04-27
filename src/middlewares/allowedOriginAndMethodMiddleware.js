import 'dotenv/config';

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5000",
  "http://127.0.0.1:5000",
  "http://localhost:5173",
  process.env.PROD_URL || "https://horizon-amber-xi.vercel.app", // Fallback
].filter(Boolean);

const allowedMethods = ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"];

const allowedOriginAndMethodMiddleware = (req, res, next) => {
  const origin = req.headers.origin || "unknown";
  const normalizedOrigin = origin.replace(/\/+$/, "").toLowerCase();
  const normalizedAllowedOrigins = allowedOrigins.map(o => o.replace(/\/+$/, "").toLowerCase());

  const isAllowed =
    normalizedOrigin === "unknown" ||
    normalizedOrigin === "null" ||
    normalizedAllowedOrigins.includes(normalizedOrigin);

  console.log(`Request Origin: ${origin}`);
  console.log(`Normalized Origin: ${normalizedOrigin}`);
  console.log(`Method: ${req.method}, Path: ${req.path}`);
  console.log(`Origin Allowed: ${isAllowed}`);
  console.log(`Allowed Origins: ${allowedOrigins.join(", ")}`);
  console.log(`PROD_URL: ${process.env.PROD_URL || "undefined"}`);

  if (isAllowed) {
    const allowOrigin = origin === "unknown" ? "*" : origin;
    res.header("Access-Control-Allow-Origin", allowOrigin);
    console.log(`Set Access-Control-Allow-Origin: ${allowOrigin}`);
    if (origin !== "null" && origin !== "unknown") {
      res.header("Access-Control-Allow-Credentials", "true");
      console.log(`Set Access-Control-Allow-Credentials: true`);
    }
  } else {
    console.log(`Blocked Origin: ${origin}`);
    return res.status(403).json({ message: "Forbidden: Origin not allowed" });
  }

  res.header("Access-Control-Allow-Methods", allowedMethods.join(", "));
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, Accept, X-Requested-With, X-CSRF-Token"
  );

  if (req.method === "OPTIONS") {
    console.log(`Handling OPTIONS for ${origin}`);
    return res.status(200).json({});
  }

  next();
};

export default allowedOriginAndMethodMiddleware;
