// const allowedOrigins = [
//   "https://yourdomain.com",
//   "http://localhost:5000",
//   "http://127.0.0.1:5000",
//   "https://horizon-amber-xi.vercel.app",
//   "http://localhost:3000",
// ];

// const allowedMethods = ["GET", "POST", "PUT", "DELETE", "PATCH"];

// const allowedOriginAndMethodMiddleware = (req, res, next) => {
//   const origin = req.headers.origin;
//   console.log("Request Origin:", origin, "Method:", req.method, "Path:", req.path);

//   // Handle OPTIONS pre-flight request
//   if (req.method === "OPTIONS") {
//     console.log("Handling OPTIONS request");
//     res.header("Access-Control-Allow-Origin", origin || "http://localhost:5000");
//     res.header("Access-Control-Allow-Methods", allowedMethods.join(", "));
//     res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
//     res.header("Access-Control-Allow-Credentials", "true");
//     return res.status(200).json({});
//   }

//   // Log the condition evaluation
//   console.log("Evaluating origin:", { isNull: origin === null, isUndefined: !origin, isAllowed: allowedOrigins.includes(origin) });

//   // Allow same-origin (null), undefined, or explicitly allowed origins
//   if (origin === null || typeof origin === "undefined" || allowedOrigins.includes(origin)) {
//     console.log("Origin allowed:", origin || "null/undefined");
//     res.header("Access-Control-Allow-Origin", origin || "http://localhost:5000");
//   } else {
//     console.log("Forbidden Origin:", origin);
//     return res.status(403).json({ message: "Forbidden: Origin not allowed" });
//   }

//   res.header("Access-Control-Allow-Methods", allowedMethods.join(", "));
//   res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
//   res.header("Access-Control-Allow-Credentials", "true");

//   next();
// };

// module.exports = allowedOriginAndMethodMiddleware;




const allowedMethods = ["GET", "POST", "PUT", "DELETE", "PATCH"];

const allowedOriginAndMethodMiddleware = (req, res, next) => {
  const origin = req.headers.origin;
  console.log("Request Origin:", origin, "Method:", req.method, "Path:", req.path);

  // Handle OPTIONS pre-flight request
  if (req.method === "OPTIONS") {
    console.log("Handling OPTIONS request");
    res.header("Access-Control-Allow-Origin", "*");  // Allow all origins
    res.header("Access-Control-Allow-Methods", allowedMethods.join(", "));
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.header("Access-Control-Allow-Credentials", "true");
    return res.status(200).json({});
  }

  // Allow all origins
  res.header("Access-Control-Allow-Origin", "*");

  res.header("Access-Control-Allow-Methods", allowedMethods.join(", "));
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");

  next();
};

module.exports = allowedOriginAndMethodMiddleware;
