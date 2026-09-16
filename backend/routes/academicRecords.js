const express = require("express");
const db = require("../db");
const permissionMiddleware = require("../middleware/permissionMiddleware");
const logAudit = require("../middleware/auditLogger");

const router = express.Router();

// =========================
// GET ACADEMIC RECORDS
// Permission: READ
// =========================
router.get(
  "/",
  permissionMiddleware("academic_records", "read"),
  (req, res) => {
    let sql;
    let params = [];

    // =========================
    // STUDENT CAN ONLY SEE
    // THEIR OWN RECORDS
    // =========================
    if (req.user.role === "student") {
      sql = `
        SELECT
          ar.record_id,
          ar.student_id,
          ar.subject,
          ar.grade,
          ar.school_year,
          ar.semester
        FROM academic_records ar
        INNER JOIN students s
          ON ar.student_id = s.student_id
        WHERE s.user_id = ?
        ORDER BY ar.record_id DESC
      `;

      params = [req.user.id];

    } else {

      // =========================
      // OTHER AUTHORIZED ROLES
      // CAN VIEW ALL RECORDS
      // =========================
      sql = `
        SELECT
          record_id,
          student_id,
          subject,
          grade,
          school_year,
          semester
        FROM academic_records
        ORDER BY record_id DESC
      `;
    }

    db.query(
      sql,
      params,
      (err, results) => {

        if (err) {
          console.error("MySQL Error:", err);

          return res.status(500).json({
            message: "Failed to fetch academic records",
            error: err.message
          });
        }

        res.json(results);
      }
    );
  }
);

// =========================
// ADD ACADEMIC RECORD
// Permission: CREATE
// =========================
router.post(
  "/",
  permissionMiddleware("academic_records", "create"),
  (req, res) => {

    const {
      student_id,
      subject,
      grade,
      school_year,
      semester
    } = req.body || {};

    // =========================
    // REQUIRED FIELD VALIDATION
    // =========================
    if (
      !student_id ||
      !subject ||
      grade === undefined ||
      grade === null ||
      !school_year ||
      !semester
    ) {
      return res.status(400).json({
        message:
          "student_id, subject, grade, school_year, and semester are required"
      });
    }

    // =========================
    // GRADE VALIDATION
    // =========================
    const numericGrade = Number(grade);

    if (
      Number.isNaN(numericGrade) ||
      numericGrade < 0 ||
      numericGrade > 100
    ) {
      return res.status(400).json({
        message: "grade must be a number between 0 and 100"
      });
    }

    // =========================
    // CHECK STUDENT EXISTS
    // =========================
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

        // =========================
        // INSERT ACADEMIC RECORD
        // =========================
        const sql = `
          INSERT INTO academic_records
          (
            student_id,
            subject,
            grade,
            school_year,
            semester
          )
          VALUES (?, ?, ?, ?, ?)
        `;

        db.query(
          sql,
          [
            student_id,
            subject,
            numericGrade,
            school_year,
            semester
          ],
          (err, result) => {

            if (err) {
              console.error("MySQL Error:", err);

              return res.status(500).json({
                message: "Failed to add academic record",
                error: err.message
              });
            }

            // =========================
            // CREATE AUDIT LOG
            // =========================
            logAudit(
              req.user.id,
              "CREATE",
              "academic_records",
              result.insertId,
              "Created new academic record"
            );

            res.status(201).json({
              message: "Academic record added successfully",
              record_id: result.insertId
            });
          }
        );
      }
    );
  }
);

// =========================
// UPDATE ACADEMIC RECORD
// Permission: UPDATE
// =========================
router.put(
  "/:id",
  permissionMiddleware("academic_records", "update"),
  (req, res) => {

    const recordId = req.params.id;

    const {
      student_id,
      subject,
      grade,
      school_year,
      semester
    } = req.body || {};

    // =========================
    // REQUIRED FIELD VALIDATION
    // =========================
    if (
      !student_id ||
      !subject ||
      grade === undefined ||
      grade === null ||
      !school_year ||
      !semester
    ) {
      return res.status(400).json({
        message:
          "student_id, subject, grade, school_year, and semester are required"
      });
    }

    // =========================
    // GRADE VALIDATION
    // =========================
    const numericGrade = Number(grade);

    if (
      Number.isNaN(numericGrade) ||
      numericGrade < 0 ||
      numericGrade > 100
    ) {
      return res.status(400).json({
        message: "grade must be a number between 0 and 100"
      });
    }

    // =========================
    // CHECK EXISTING RECORD
    // =========================
    const checkSql = `
      SELECT
        ar.record_id,
        ar.student_id,
        s.user_id
      FROM academic_records ar
      INNER JOIN students s
        ON ar.student_id = s.student_id
      WHERE ar.record_id = ?
    `;

    db.query(
      checkSql,
      [recordId],
      (checkErr, checkResult) => {

        if (checkErr) {
          console.error("MySQL Error:", checkErr);

          return res.status(500).json({
            message: "Failed to verify academic record",
            error: checkErr.message
          });
        }

        // =========================
        // RECORD NOT FOUND
        // =========================
        if (checkResult.length === 0) {
          return res.status(404).json({
            message: "Academic record not found"
          });
        }

        const record = checkResult[0];

        // =========================
        // STUDENT OWNERSHIP CHECK
        // =========================
        if (
          req.user.role === "student" &&
          record.user_id !== req.user.id
        ) {
          return res.status(403).json({
            message:
              "You do not have permission to update this academic record"
          });
        }

        // =========================
        // CHECK NEW STUDENT EXISTS
        // =========================
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

            // =========================
            // UPDATE RECORD
            // =========================
            const sql = `
              UPDATE academic_records
              SET
                student_id = ?,
                subject = ?,
                grade = ?,
                school_year = ?,
                semester = ?
              WHERE record_id = ?
            `;

            db.query(
              sql,
              [
                student_id,
                subject,
                numericGrade,
                school_year,
                semester,
                recordId
              ],
              (err, result) => {

                if (err) {
                  console.error("MySQL Error:", err);

                  return res.status(500).json({
                    message: "Failed to update academic record",
                    error: err.message
                  });
                }

                if (result.affectedRows === 0) {
                  return res.status(404).json({
                    message: "Academic record not found"
                  });
                }

                // =========================
                // UPDATE AUDIT LOG
                // =========================
                logAudit(
                  req.user.id,
                  "UPDATE",
                  "academic_records",
                  recordId,
                  "Updated academic record"
                );

                res.json({
                  message:
                    "Academic record updated successfully"
                });
              }
            );
          }
        );
      }
    );
  }
);

// =========================
// DELETE ACADEMIC RECORD
// Permission: DELETE
// =========================
router.delete(
  "/:id",
  permissionMiddleware("academic_records", "delete"),
  (req, res) => {

    const recordId = req.params.id;

    const sql = `
      DELETE FROM academic_records
      WHERE record_id = ?
    `;

    db.query(
      sql,
      [recordId],
      (err, result) => {

        if (err) {
          console.error("MySQL Error:", err);

          return res.status(500).json({
            message: "Failed to delete academic record",
            error: err.message
          });
        }

        if (result.affectedRows === 0) {
          return res.status(404).json({
            message: "Academic record not found"
          });
        }

        // =========================
        // DELETE AUDIT LOG
        // =========================
        logAudit(
          req.user.id,
          "DELETE",
          "academic_records",
          recordId,
          "Deleted academic record"
        );

        res.json({
          message: "Academic record deleted successfully"
        });
      }
    );
  }
);

module.exports = router;