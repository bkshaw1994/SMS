const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { configureStore, createSlice } = require("@reduxjs/toolkit");

const app = express();
const PORT = process.env.PORT || 5000;
const DUPLICATE_WINDOW_MS = 8000;
const JWT_SECRET = process.env.JWT_SECRET || "sms_app_dev_secret";
const revokedTokens = new Map();
const users = [];

function getTokenFromRequest(req) {
  const authHeader = String(req.headers.authorization || "").trim();
  const bearerPrefix = "Bearer ";

  if (authHeader.startsWith(bearerPrefix)) {
    return authHeader.slice(bearerPrefix.length).trim();
  }

  const accessTokenHeader = String(req.headers["x-access-token"] || "").trim();
  if (accessTokenHeader) {
    return accessTokenHeader;
  }

  return String(req.body?.token || "").trim();
}

function cleanupRevokedTokens() {
  const now = Date.now();
  for (const [token, expiresAt] of revokedTokens.entries()) {
    if (expiresAt <= now) {
      revokedTokens.delete(token);
    }
  }
}

function verifyActiveToken(req) {
  cleanupRevokedTokens();

  const token = getTokenFromRequest(req);
  if (!token) {
    return { error: { status: 401, message: "Unauthorized: token missing." } };
  }

  if (revokedTokens.has(token)) {
    return {
      error: {
        status: 401,
        message: "Unauthorized: token has been logged out.",
      },
    };
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return { token, decoded };
  } catch {
    return { error: { status: 401, message: "Invalid or expired token." } };
  }
}

function resolveRoleFromEmail(email) {
  const localPart = (email.split("@")[0] || "").toLowerCase();
  const segments = localPart.split(/[^a-z]+/).filter(Boolean);
  const inferredRole =
    segments.length > 0 ? segments[segments.length - 1] : "user";

  return inferredRole.toUpperCase();
}

const validationSlice = createSlice({
  name: "validation",
  initialState: {
    validatedCodes: {},
  },
  reducers: {
    addValidatedCode: (state, action) => {
      const { schoolCode, validatedAt } = action.payload;
      state.validatedCodes[schoolCode] = validatedAt;
    },
  },
});

const { addValidatedCode } = validationSlice.actions;

const store = configureStore({
  reducer: {
    validation: validationSlice.reducer,
  },
});

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.post("/school/validate-code", (req, res) => {
  const schoolCode = String(req.body?.schoolCode ?? "")
    .trim()
    .toUpperCase();

  if (!schoolCode) {
    return res.status(400).json({
      valid: false,
      message: "School code is required.",
    });
  }

  if (!/^[A-Z0-9]+$/.test(schoolCode)) {
    return res.status(400).json({
      valid: false,
      message: "School code must contain only letters and numbers.",
    });
  }

  if (schoolCode.length < 3) {
    return res.status(400).json({
      valid: false,
      message: "School code must be at least 3 characters long.",
    });
  }

  const lastValidatedAt =
    store.getState().validation.validatedCodes[schoolCode];
  const isDuplicate =
    typeof lastValidatedAt === "number" &&
    Date.now() - lastValidatedAt <= DUPLICATE_WINDOW_MS;

  if (isDuplicate) {
    return res.status(304).end();
  }

  store.dispatch(addValidatedCode({ schoolCode, validatedAt: Date.now() }));

  return res.json({
    valid: true,
    schoolCode,
    message: `School code ${schoolCode} is valid.`,
  });
});

app.post("/auth/validate-login", (req, res) => {
  const valid = Boolean(req.body?.valid);
  const schoolCode = String(req.body?.schoolCode ?? "")
    .trim()
    .toUpperCase();
  const email = String(req.body?.email ?? "")
    .trim()
    .toLowerCase();
  const role = resolveRoleFromEmail(email);

  if (!valid) {
    return res.status(400).json({
      valid: false,
      message: "Login payload must include valid=true.",
    });
  }

  if (!schoolCode || !/^[A-Z0-9]+$/.test(schoolCode)) {
    return res.status(400).json({
      valid: false,
      message: "A valid schoolCode is required.",
    });
  }

  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({
      valid: false,
      message: "A valid email is required.",
    });
  }

  const token = jwt.sign(
    {
      schoolCode,
      email,
      role,
    },
    JWT_SECRET,
    { expiresIn: "1h" },
  );

  return res.json({
    valid: true,
    schoolCode,
    email,
    role,
    token,
  });
});

app.post("/auth/logout", (req, res) => {
  const verification = verifyActiveToken(req);
  if (verification.error) {
    return res.status(verification.error.status).json({
      success: false,
      message: verification.error.message,
    });
  }

  const expiresAt =
    typeof verification.decoded?.exp === "number"
      ? verification.decoded.exp * 1000
      : Date.now() + 3600000;

  revokedTokens.set(verification.token, expiresAt);

  return res.json({
    success: true,
    message: "Logged out successfully.",
  });
});

app.post("/users", (req, res) => {
  const verification = verifyActiveToken(req);
  if (verification.error) {
    return res.status(verification.error.status).json({
      success: false,
      message: verification.error.message,
    });
  }

  const schoolCode = String(req.body?.schoolCode ?? "")
    .trim()
    .toUpperCase();
  const name = String(req.body?.name ?? "").trim();
  const email = String(req.body?.email ?? "")
    .trim()
    .toLowerCase();
  const phone = String(req.body?.phone ?? "").trim();
  const role = String(req.body?.role ?? "")
    .trim()
    .toUpperCase();
  const status = String(req.body?.status ?? "")
    .trim()
    .toUpperCase();

  if (!schoolCode || !name || !email || !phone || !role || !status) {
    return res.status(400).json({
      success: false,
      message: "schoolCode, name, email, phone, role, and status are required.",
    });
  }

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({
      success: false,
      message: "A valid email is required.",
    });
  }

  if (!/^[0-9]{10,15}$/.test(phone)) {
    return res.status(400).json({
      success: false,
      message: "Phone should contain 10 to 15 digits.",
    });
  }

  if (status !== "ACTIVE") {
    return res.status(400).json({
      success: false,
      message: "status must be ACTIVE.",
    });
  }

  const user = {
    schoolCode,
    name,
    email,
    phone,
    role,
    status,
  };

  users.push(user);

  return res.status(201).json({
    success: true,
    message: "User created successfully.",
    user,
  });
});

app.get("/itadmin/users", (req, res) => {
  const verification = verifyActiveToken(req);
  if (verification.error) {
    return res.status(verification.error.status).json({
      success: false,
      message: verification.error.message,
    });
  }

  const requestSchoolCode = String(verification.decoded?.schoolCode || "")
    .trim()
    .toUpperCase();

  const filteredUsers = users
    .filter((user) => user.schoolCode === requestSchoolCode)
    .map((user) => ({
      name: user.name,
      email: user.email,
      phone: user.phone,
      whatsapp: null,
      role: user.role || null,
    }));

  return res.json({
    schoolCode: requestSchoolCode,
    count: filteredUsers.length,
    users: filteredUsers,
  });
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`School API running on http://localhost:${PORT}`);
});
