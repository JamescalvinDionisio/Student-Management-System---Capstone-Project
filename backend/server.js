require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");

const db = require("./db");

const loginRoute = require("./routes/login");
const studentsRoute = require("./routes/students");
const parentsRoute = require("./routes/parents");
const academicRecordsRoute = require("./routes/academicRecords");
const attendanceRoute = require("./routes/attendance");
const academicPerformanceRoute = require("./routes/academicPerformance");
const tasksRoute = require("./routes/tasks");
const documentsRoute = require("./routes/documents");
const healthRecordsRoute = require("./routes/healthRecords");
const communicationsRoute = require("./routes/communications");
const riskAlertsRoute = require("./routes/riskAlerts");
const auditLogsRoute = require("./routes/auditLogs");
const announcementsRoute = require("./routes/announcements");
const authMiddleware = require("./middleware/authMiddleware");
const permissionMiddleware = require("./middleware/permissionMiddleware");
const academicAreaRoutes = require("./routes/academicAreas");


const app = express();

// =========================
// MIDDLEWARE
// =========================

app.use(cors());
app.use(express.json());


// =========================
// LOGIN
// =========================

app.use("/api/login", loginRoute);


// =========================
// PROTECTED ROUTES
// =========================

// STUDENTS
app.use(
  "/api/students",
  authMiddleware,
  studentsRoute
);

// PARENTS
app.use(
  "/api/parents",
  authMiddleware,
  parentsRoute
);

// ACADEMIC RECORDS
app.use(
  "/api/academic-records",
  authMiddleware,
  academicRecordsRoute
);

// ATTENDANCE
app.use(
  "/api/attendance",
  authMiddleware,
  attendanceRoute
);

// ACADEMIC PERFORMANCE
app.use(
  "/api/academic-performance",
  authMiddleware,
  academicPerformanceRoute
);

// TASKS
app.use(
  "/api/tasks",
  authMiddleware,
  tasksRoute
);

// DOCUMENTS
app.use(
  "/api/documents",
  authMiddleware,
  documentsRoute
);

// HEALTH
app.use(
  "/api/health",
  authMiddleware,
  healthRecordsRoute
);

// COMMUNICATIONS
app.use(
  "/api/communications",
  authMiddleware,
  communicationsRoute
);

// ACADEMIC AREAS
app.use(
  "/api/academic-areas",
  authMiddleware,
  academicAreaRoutes
);

// RISK ALERTS
app.use(
  "/api/risk-alerts",
  authMiddleware,
  riskAlertsRoute
);

// ANNOUNCEMENTS
app.use(
  "/api/announcements",
  authMiddleware,
  announcementsRoute
);

// AUDIT LOGS
app.use(
  "/api/audit-logs",
  authMiddleware,
  auditLogsRoute
);


// =========================
// TEST ROUTES
// =========================

app.get("/", (req, res) => {
  res.json({
    message: "Backend is running!"
  });
});


app.get("/api/test-db", (req, res) => {
  db.query("SELECT 1 AS test", (err, result) => {

    if (err) {
      console.error("Database Error:", err);

      return res.status(500).json({
        message: "Database connection failed",
        error: err.message
      });
    }

    res.json({
      message: "Database connection successful!",
      result: result
    });
  });
});


// =========================
// USERS
// =========================

// ALLOWED ROLES
const allowedRoles = [
  "admin",
  "principal",
  "department_head",
  "registrar",
  "teacher",
  "student",
  "parent"
];


// =========================
// GET ALL USERS
// =========================

app.get(
  "/api/users",
  authMiddleware,
  permissionMiddleware("users", "read"),
  (req, res) => {

    const sql = `
      SELECT
        id,
        name,
        email,
        first_name,
        last_name,
        role
      FROM users
      ORDER BY id DESC
    `;

    db.query(sql, (err, result) => {

      if (err) {
        console.error("MySQL Error:", err);

        return res.status(500).json({
          message: "Failed to fetch users",
          error: err.message
        });
      }

      res.json(result);
    });
  }
);


// =========================
// CREATE USER
// =========================

app.post(
  "/api/users",
  authMiddleware,
  permissionMiddleware("users", "create"),
  async (req, res) => {

    const {
      name,
      email,
      password,
      first_name,
      last_name,
      role
    } = req.body;

    // REQUIRED FIELDS
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        message: "Name, email, password, and role are required"
      });
    }

    // VALIDATE ROLE
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        message: "Invalid user role"
      });
    }

    try {

      // HASH PASSWORD
      const hashedPassword = await bcrypt.hash(password, 10);

      const sql = `
        INSERT INTO users
        (
          name,
          email,
          password,
          first_name,
          last_name,
          role
        )
        VALUES (?, ?, ?, ?, ?, ?)
      `;

      db.query(
        sql,
        [
          name.trim(),
          email.trim(),
          hashedPassword,
          first_name ? first_name.trim() : null,
          last_name ? last_name.trim() : null,
          role
        ],
        (err, result) => {

          if (err) {

            console.error("MySQL Error:", err);

            if (err.code === "ER_DUP_ENTRY") {
              return res.status(409).json({
                message: "Email already exists"
              });
            }

            return res.status(500).json({
              message: "Failed to create user",
              error: err.message
            });
          }

          res.status(201).json({
            message: "User created successfully",
            user_id: result.insertId
          });
        }
      );

    } catch (error) {

      console.error("Password hashing error:", error);

      res.status(500).json({
        message: "Failed to create user"
      });
    }
  }
);


// =========================
// UPDATE USER
// =========================

app.put(
  "/api/users/:id",
  authMiddleware,
  permissionMiddleware("users", "update"),
  async (req, res) => {

    const userId = Number(req.params.id);

    const {
      name,
      email,
      password,
      first_name,
      last_name,
      role
    } = req.body;

    // VALIDATE ID
    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(400).json({
        message: "Invalid user ID"
      });
    }

    // REQUIRED FIELDS
    if (!name || !email || !role) {
      return res.status(400).json({
        message: "Name, email, and role are required"
      });
    }

    // VALIDATE ROLE
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        message: "Invalid user role"
      });
    }

    // CHECK USER EXISTS
    db.query(
      "SELECT id FROM users WHERE id = ?",
      [userId],
      async (err, results) => {

        if (err) {
          console.error("MySQL Error:", err);

          return res.status(500).json({
            message: "Failed to check user",
            error: err.message
          });
        }

        if (results.length === 0) {
          return res.status(404).json({
            message: "User not found"
          });
        }

        try {

          let sql;
          let params;

          // WITH NEW PASSWORD
          if (password && password.trim() !== "") {

            const hashedPassword = await bcrypt.hash(
              password,
              10
            );

            sql = `
              UPDATE users
              SET
                name = ?,
                email = ?,
                password = ?,
                first_name = ?,
                last_name = ?,
                role = ?
              WHERE id = ?
            `;

            params = [
              name.trim(),
              email.trim(),
              hashedPassword,
              first_name ? first_name.trim() : null,
              last_name ? last_name.trim() : null,
              role,
              userId
            ];

          } else {

            // WITHOUT CHANGING PASSWORD
            sql = `
              UPDATE users
              SET
                name = ?,
                email = ?,
                first_name = ?,
                last_name = ?,
                role = ?
              WHERE id = ?
            `;

            params = [
              name.trim(),
              email.trim(),
              first_name ? first_name.trim() : null,
              last_name ? last_name.trim() : null,
              role,
              userId
            ];
          }

          db.query(
            sql,
            params,
            (err, result) => {

              if (err) {

                console.error("MySQL Error:", err);

                if (err.code === "ER_DUP_ENTRY") {
                  return res.status(409).json({
                    message: "Email already exists"
                  });
                }

                return res.status(500).json({
                  message: "Failed to update user",
                  error: err.message
                });
              }

              res.json({
                message: "User updated successfully",
                user_id: userId
              });
            }
          );

        } catch (error) {

          console.error("Password hashing error:", error);

          res.status(500).json({
            message: "Failed to update user"
          });
        }
      }
    );
  }
);


// =========================
// DELETE USER
// =========================

app.delete(
  "/api/users/:id",
  authMiddleware,
  permissionMiddleware("users", "delete"),
  (req, res) => {

    const userId = Number(req.params.id);

    // VALIDATE ID
    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(400).json({
        message: "Invalid user ID"
      });
    }

    // PREVENT SELF DELETE
    if (req.user.id === userId) {
      return res.status(400).json({
        message: "You cannot delete your own account"
      });
    }

    // CHECK USER EXISTS
    db.query(
      "SELECT id FROM users WHERE id = ?",
      [userId],
      (err, results) => {

        if (err) {
          console.error("MySQL Error:", err);

          return res.status(500).json({
            message: "Failed to check user",
            error: err.message
          });
        }

        if (results.length === 0) {
          return res.status(404).json({
            message: "User not found"
          });
        }

        // DELETE USER
        db.query(
          "DELETE FROM users WHERE id = ?",
          [userId],
          (err, result) => {

            if (err) {
              console.error("MySQL Error:", err);

              // FOREIGN KEY ERROR
              if (err.code === "ER_ROW_IS_REFERENCED_2") {
                return res.status(409).json({
                  message:
                    "Cannot delete this user because related records still exist."
                });
              }

              return res.status(500).json({
                message: "Failed to delete user",
                error: err.message
              });
            }

            res.json({
              message: "User deleted successfully",
              user_id: userId
            });
          }
        );
      }
    );
  }
);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `🚀 Server running on http://localhost:${PORT}`
  );
});