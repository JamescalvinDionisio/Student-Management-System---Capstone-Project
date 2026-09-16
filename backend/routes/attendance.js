const express = require("express");
const db = require("../db");
const permissionMiddleware = require("../middleware/permissionMiddleware");
const logAudit = require("../middleware/auditLogger");

const router = express.Router();

// ===============================
// GET - VIEW ATTENDANCE
// Permission: READ
// ===============================
router.get(
  "/",
  permissionMiddleware("attendance", "read"),
  (req, res) => {
    let sql;
    let params = [];

    // ===============================
    // STUDENT CAN ONLY SEE OWN ATTENDANCE
    // ===============================
    if (req.user.role === "student") {
      sql = `
        SELECT
          a.attendance_id,
          a.student_id,
          a.attendance_date,
          a.status,
          a.remarks
        FROM attendance a
        INNER JOIN students s
          ON a.student_id = s.student_id
        WHERE s.user_id = ?
        ORDER BY a.attendance_date DESC
      `;

      params = [req.user.id];

    } else {

      // ===============================
      // OTHER AUTHORIZED ROLES
      // CAN VIEW ALL ATTENDANCE
      // ===============================
      sql = `
        SELECT
          attendance_id,
          student_id,
          attendance_date,
          status,
          remarks
        FROM attendance
        ORDER BY attendance_date DESC
      `;
    }

    db.query(
      sql,
      params,
      (err, results) => {

        if (err) {
          console.error("MySQL Error:", err);

          return res.status(500).json({
            message: "Failed to fetch attendance",
            error: err.message
          });
        }

        res.json(results);
      }
    );
  }
);

// ===============================
// POST - CREATE ATTENDANCE
// Permission: CREATE
// ===============================
router.post(
  "/",
  permissionMiddleware("attendance", "create"),
  (req, res) => {

    // ===============================
    // GET REQUEST BODY SAFELY
    // ===============================
    const {
      student_id,
      attendance_date,
      status,
      remarks
    } = req.body || {};

    // ===============================
    // REQUIRED FIELD VALIDATION
    // ===============================
    if (
      !student_id ||
      !attendance_date ||
      !status
    ) {
      return res.status(400).json({
        message:
          "student_id, attendance_date, and status are required"
      });
    }

    // ===============================
    // CHECK IF STUDENT EXISTS
    // ===============================
    const checkStudentSql = `
      SELECT student_id
      FROM students
      WHERE student_id = ?
    `;

    db.query(
      checkStudentSql,
      [student_id],
      (studentErr, studentResult) => {

        if (studentErr) {
          console.error("MySQL Error:", studentErr);

          return res.status(500).json({
            message: "Failed to verify student",
            error: studentErr.message
          });
        }

        // ===============================
        // STUDENT NOT FOUND
        // ===============================
        if (studentResult.length === 0) {
          return res.status(404).json({
            message: "Student not found"
          });
        }

        // ===============================
        // INSERT ATTENDANCE
        // ===============================
        const sql = `
          INSERT INTO attendance
          (student_id, attendance_date, status, remarks)
          VALUES (?, ?, ?, ?)
        `;

        db.query(
          sql,
          [
            student_id,
            attendance_date,
            status,
            remarks || null
          ],
          (err, result) => {

            if (err) {
              console.error("MySQL Error:", err);

              return res.status(500).json({
                message: "Failed to create attendance",
                error: err.message
              });
            }

            // ===============================
            // CREATE AUDIT LOG
            // ===============================
            logAudit(
              req.user.id,
              "CREATE",
              "attendance",
              result.insertId,
              "Created new attendance record"
            );

            res.status(201).json({
              message: "Attendance created successfully",
              attendance_id: result.insertId
            });
          }
        );
      }
    );
  }
);

// ===============================
// PUT - UPDATE ATTENDANCE
// Permission: UPDATE
// ===============================
router.put(
  "/:id",
  permissionMiddleware("attendance", "update"),
  (req, res) => {

    const attendanceId = req.params.id;

    // ===============================
    // GET REQUEST BODY SAFELY
    // ===============================
    const {
      student_id,
      attendance_date,
      status,
      remarks
    } = req.body || {};

    // ===============================
    // REQUIRED FIELD VALIDATION
    // ===============================
    if (
      !student_id ||
      !attendance_date ||
      !status
    ) {
      return res.status(400).json({
        message:
          "student_id, attendance_date, and status are required"
      });
    }

    // ===============================
    // CHECK IF ATTENDANCE EXISTS
    // ===============================
    const checkAttendanceSql = `
      SELECT attendance_id
      FROM attendance
      WHERE attendance_id = ?
    `;

    db.query(
      checkAttendanceSql,
      [attendanceId],
      (attendanceErr, attendanceResult) => {

        if (attendanceErr) {
          console.error("MySQL Error:", attendanceErr);

          return res.status(500).json({
            message: "Failed to verify attendance record",
            error: attendanceErr.message
          });
        }

        if (attendanceResult.length === 0) {
          return res.status(404).json({
            message: "Attendance record not found"
          });
        }

        // ===============================
        // CHECK IF STUDENT EXISTS
        // ===============================
        const checkStudentSql = `
          SELECT student_id
          FROM students
          WHERE student_id = ?
        `;

        db.query(
          checkStudentSql,
          [student_id],
          (studentErr, studentResult) => {

            if (studentErr) {
              console.error("MySQL Error:", studentErr);

              return res.status(500).json({
                message: "Failed to verify student",
                error: studentErr.message
              });
            }

            if (studentResult.length === 0) {
              return res.status(404).json({
                message: "Student not found"
              });
            }

            // ===============================
            // UPDATE ATTENDANCE
            // ===============================
            const sql = `
              UPDATE attendance
              SET
                student_id = ?,
                attendance_date = ?,
                status = ?,
                remarks = ?
              WHERE attendance_id = ?
            `;

            db.query(
              sql,
              [
                student_id,
                attendance_date,
                status,
                remarks || null,
                attendanceId
              ],
              (err, result) => {

                if (err) {
                  console.error("MySQL Error:", err);

                  return res.status(500).json({
                    message: "Failed to update attendance",
                    error: err.message
                  });
                }

                if (result.affectedRows === 0) {
                  return res.status(404).json({
                    message: "Attendance record not found"
                  });
                }

                // ===============================
                // UPDATE AUDIT LOG
                // ===============================
                logAudit(
                  req.user.id,
                  "UPDATE",
                  "attendance",
                  attendanceId,
                  "Updated attendance record"
                );

                res.json({
                  message: "Attendance updated successfully"
                });
              }
            );
          }
        );
      }
    );
  }
);

// ===============================
// DELETE - DELETE ATTENDANCE
// Permission: DELETE
// ===============================
router.delete(
  "/:id",
  permissionMiddleware("attendance", "delete"),
  (req, res) => {

    const attendanceId = req.params.id;

    const sql = `
      DELETE FROM attendance
      WHERE attendance_id = ?
    `;

    db.query(
      sql,
      [attendanceId],
      (err, result) => {

        if (err) {
          console.error("MySQL Error:", err);

          return res.status(500).json({
            message: "Failed to delete attendance",
            error: err.message
          });
        }

        if (result.affectedRows === 0) {
          return res.status(404).json({
            message: "Attendance record not found"
          });
        }

        // ===============================
        // DELETE AUDIT LOG
        // ===============================
        logAudit(
          req.user.id,
          "DELETE",
          "attendance",
          attendanceId,
          "Deleted attendance record"
        );

        res.json({
          message: "Attendance deleted successfully"
        });
      }
    );
  }
);

module.exports = router;