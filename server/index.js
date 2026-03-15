const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");
const { configureStore, createSlice } = require("@reduxjs/toolkit");

const app = express();
const PORT = process.env.PORT || 5000;
const DUPLICATE_WINDOW_MS = 8000;
const JWT_SECRET = process.env.JWT_SECRET || "sms_app_dev_secret";
const revokedTokens = new Map();
const users = [];
const classAssignments = [];
const sectionAssignments = [];
const authorizedRouteLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please try again in a minute.",
  },
});

function seedClassAssignmentsForSchool(schoolCode) {
  const normalizedSchoolCode = String(schoolCode || "")
    .trim()
    .toUpperCase();

  if (!normalizedSchoolCode) {
    return;
  }

  const hasExisting = classAssignments.some(
    (item) => item.schoolCode === normalizedSchoolCode,
  );

  if (hasExisting) {
    return;
  }

  classAssignments.push(
    {
      schoolCode: normalizedSchoolCode,
      classId: "1",
      className: "Class 1",
      sectionName: "A",
      sectionId: `${normalizedSchoolCode}-CLASS1-A`,
      subjectName: "Mathematics",
    },
    {
      schoolCode: normalizedSchoolCode,
      classId: "2",
      className: "Class 2",
      sectionName: "B",
      sectionId: `${normalizedSchoolCode}-CLASS2-B`,
      subjectName: "Science",
    },
    {
      schoolCode: normalizedSchoolCode,
      classId: "3",
      className: "Class 3",
      sectionName: "A",
      sectionId: `${normalizedSchoolCode}-CLASS3-A`,
      subjectName: "English",
    },
  );
}

function seedTeachersForSchool(schoolCode) {
  const normalizedSchoolCode = String(schoolCode || "")
    .trim()
    .toUpperCase();

  if (!normalizedSchoolCode) {
    return;
  }

  const existingTeacherCount = users.filter(
    (item) =>
      item.schoolCode === normalizedSchoolCode &&
      String(item.role || "") === "TEACHER",
  ).length;

  if (existingTeacherCount > 0) {
    return;
  }

  for (let index = 1; index <= 10; index += 1) {
    users.push({
      schoolCode: normalizedSchoolCode,
      teacherId: String(index),
      name: `Teacher ${index}`,
      email: `teacher${index}@${normalizedSchoolCode.toLowerCase()}.com`,
      phone: "",
      role: "TEACHER",
      status: "ACTIVE",
    });
  }
}

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

app.post("/itadmin/classes", authorizedRouteLimiter, (req, res) => {
  const verification = verifyActiveToken(req);
  if (verification.error) {
    return res.status(verification.error.status).json({
      success: false,
      message: verification.error.message,
    });
  }

  const schoolCode = String(verification.decoded?.schoolCode || "")
    .trim()
    .toUpperCase();
  const classNameRaw = req.body?.class_name;
  const className =
    typeof classNameRaw === "number"
      ? String(classNameRaw)
      : String(classNameRaw || "").trim();

  if (!className) {
    return res.status(400).json({
      success: false,
      message: "class_name is required.",
    });
  }

  seedClassAssignmentsForSchool(schoolCode);

  const duplicate = classAssignments.some(
    (item) => item.schoolCode === schoolCode && item.className === className,
  );

  if (duplicate) {
    return res.status(409).json({
      success: false,
      message: "Class already exists.",
    });
  }

  const nextClassId = String(
    classAssignments.filter((item) => item.schoolCode === schoolCode).length +
      1,
  );
  const classRecord = {
    schoolCode,
    classId: nextClassId,
    className,
    sectionName: "",
    sectionId: `${schoolCode}-CLASS${nextClassId}`,
    subjectName: "",
  };

  classAssignments.push(classRecord);

  return res.status(201).json({
    success: true,
    message: "Class added successfully.",
    class: {
      class_id: classRecord.classId,
      class_name: classRecord.className,
    },
  });
});

app.post("/itadmin/sections", authorizedRouteLimiter, (req, res) => {
  const verification = verifyActiveToken(req);
  if (verification.error) {
    return res.status(verification.error.status).json({
      success: false,
      message: verification.error.message,
    });
  }

  const schoolCode = String(verification.decoded?.schoolCode || "")
    .trim()
    .toUpperCase();
  const teacherId = String(req.body?.teacher_id || "").trim();
  const classId = String(req.body?.class_id || "").trim();
  const sectionName = String(req.body?.section_name || "").trim();

  if (!teacherId || !classId || !sectionName) {
    return res.status(400).json({
      success: false,
      message: "teacher_id, class_id and section_name are required.",
    });
  }

  seedClassAssignmentsForSchool(schoolCode);
  seedTeachersForSchool(schoolCode);

  const classItem = classAssignments.find(
    (item) =>
      item.schoolCode === schoolCode && String(item.classId) === classId,
  );
  if (!classItem) {
    return res.status(404).json({
      success: false,
      message: "Class not found for this school.",
    });
  }

  const teacherItem = users.find(
    (item) =>
      item.schoolCode === schoolCode &&
      String(item.role || "") === "TEACHER" &&
      String(item.teacherId || item.email || item.name) === teacherId,
  );
  if (!teacherItem) {
    return res.status(404).json({
      success: false,
      message: "Teacher not found for this school.",
    });
  }

  const duplicateSection = sectionAssignments.some(
    (item) =>
      item.schoolCode === schoolCode &&
      item.classId === classId &&
      item.sectionName.toUpperCase() === sectionName.toUpperCase(),
  );
  if (duplicateSection) {
    return res.status(409).json({
      success: false,
      message: "Section already exists for this class.",
    });
  }

  const sectionId = `${schoolCode}-CLASS${classId}-${sectionName.toUpperCase()}`;
  sectionAssignments.push({
    schoolCode,
    classId,
    teacherId,
    sectionName,
    sectionId,
  });

  return res.status(201).json({
    success: true,
    message: "Section added successfully.",
    section: {
      section_id: sectionId,
      class_id: classId,
      teacher_id: teacherId,
      section_name: sectionName,
    },
  });
});

app.get("/teacher/classes-assigned", authorizedRouteLimiter, (req, res) => {
  const verification = verifyActiveToken(req);
  if (verification.error) {
    return res.status(verification.error.status).json({
      success: false,
      message: verification.error.message,
    });
  }

  const tokenSchoolCode = String(verification.decoded?.schoolCode || "")
    .trim()
    .toUpperCase();
  const requestedSchoolCode = String(
    req.query?.school_id || req.query?.schoolId || req.query?.schoolCode || "",
  )
    .trim()
    .toUpperCase();
  const schoolCode = requestedSchoolCode || tokenSchoolCode;

  if (!schoolCode) {
    return res.status(400).json({
      success: false,
      message: "school_id is required.",
    });
  }

  if (tokenSchoolCode && schoolCode !== tokenSchoolCode) {
    return res.status(403).json({
      success: false,
      message: "Forbidden: school_id does not match authenticated school.",
    });
  }

  seedClassAssignmentsForSchool(schoolCode);
  seedTeachersForSchool(schoolCode);

  const classes = classAssignments
    .filter((item) => item.schoolCode === schoolCode)
    .map((item, index) => ({
      class_id: String(item.classId || index + 1),
      class_name: item.className,
      section_name: item.sectionName,
      section_id: item.sectionId,
      subject_name: item.subjectName,
    }));

  const teachers = users
    .filter(
      (user) =>
        user.schoolCode === schoolCode && String(user.role || "") === "TEACHER",
    )
    .map((user) => ({
      teacher_id: user.teacherId || user.email || user.name,
      name: user.name,
      email: user.email,
      phone: user.phone || null,
    }));

  return res.json({
    schoolCode,
    classCount: classes.length,
    teacherCount: teachers.length,
    classes,
    teachers,
  });
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`School API running on http://localhost:${PORT}`);
});
