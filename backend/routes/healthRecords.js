const express = require("express");
const db = require("../db");
const permissionMiddleware = require("../middleware/permissionMiddleware");
const logAudit = require("../middleware/auditLogger");

const router = express.Router();

// =====================================
// GET - View health records
// =====================================
router.get(
  "/",
  permissionMiddleware("health", "read"),
  (req, res) => {

    let sql;
    let params = [];

    // =====================================
    // STUDENT - OWN HEALTH RECORD ONLY
    // =====================================
    if (req.user.role === "student") {

      sql = `
        SELECT
          hr.health_id,
          hr.student_id,
          hr.medical_condition,
          hr.allergies,
          hr.medications,
          hr.blood_type,
          hr.emergency_contact,
          hr.emergency_contact_number,
          hr.remarks,
          hr.created_at
        FROM health_records hr
        INNER JOIN students s
          ON hr.student_id = s.student_id
        WHERE s.user_id = ?
        ORDER BY hr.created_at DESC
      `;

      params = [req.user.id];

    } else {

      // =====================================
      // OTHER AUTHORIZED ROLES
      // CAN VIEW ALL HEALTH RECORDS
      // =====================================
      sql = `
        SELECT
          health_id,
          student_id,
          medical_condition,
          allergies,
          medications,
          blood_type,
          emergency_contact,
          emergency_contact_number,
          remarks,
          created_at
        FROM health_records
        ORDER BY created_at DESC
      `;
    }

    db.query(
      sql,
      params,
      (err, results) => {

        if (err) {
          console.error("MySQL Error:", err);

          return res.status(500).json({
            message: "Failed to fetch health records",
            error: err.message
          });
        }

        res.json(results);
      }
    );
  }
);


// =====================================
// POST - Create health record
// =====================================
router.post(
  "/",
  permissionMiddleware("health", "create"),
  (req, res) => {

    const {
      student_id,
      medical_condition,
      allergies,
      medications,
      blood_type,
      emergency_contact,
      emergency_contact_number,
      remarks
    } = req.body || {};

    // =====================================
    // REQUIRED FIELD VALIDATION
    // =====================================
    if (!student_id) {
      return res.status(400).json({
        message: "student_id is required"
      });
    }

    // =====================================
    // CHECK IF STUDENT EXISTS
    // =====================================
    const checkStudentSql = `
      SELECT student_id
      FROM students
      WHERE student_id = ?
    `;

    db.query(
      checkStudentSql,
      [student_id],
      (studentErr, studentResults) => {

        if (studentErr) {
          console.error("MySQL Error:", studentErr);

          return res.status(500).json({
            message: "Failed to check student",
            error: studentErr.message
          });
        }

        // =====================================
        // STUDENT NOT FOUND
        // =====================================
        if (studentResults.length === 0) {
          return res.status(404).json({
            message: "Student not found"
          });
        }

        // =====================================
        // CREATE HEALTH RECORD
        // =====================================
        const sql = `
          INSERT INTO health_records
          (
            student_id,
            medical_condition,
            allergies,
            medications,
            blood_type,
            emergency_contact,
            emergency_contact_number,
            remarks
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        db.query(
          sql,
          [
            student_id,
            medical_condition || null,
            allergies || null,
            medications || null,
            blood_type || null,
            emergency_contact || null,
            emergency_contact_number || null,
            remarks || null
          ],
          (err, result) => {

            if (err) {
              console.error("MySQL Error:", err);

              return res.status(500).json({
                message: "Failed to create health record",
                error: err.message
              });
            }

            // =====================================
            // CREATE AUDIT LOG
            // =====================================
            logAudit(
              req.user.id,
              "CREATE",
              "health",
              result.insertId,
              "Created new health record"
            );

            res.status(201).json({
              message: "Health record created successfully",
              health_id: result.insertId
            });
          }
        );
      }
    );
  }
);


// =====================================
// PUT - Update health record
// =====================================
router.put(
  "/:id",
  permissionMiddleware("health", "update"),
  (req, res) => {

    const healthId = req.params.id;

    const {
      student_id,
      medical_condition,
      allergies,
      medications,
      blood_type,
      emergency_contact,
      emergency_contact_number,
      remarks
    } = req.body || {};

    // =====================================
    // REQUIRED FIELD VALIDATION
    // =====================================
    if (!student_id) {
      return res.status(400).json({
        message: "student_id is required"
      });
    }

    // =====================================
    // CHECK IF STUDENT EXISTS
    // =====================================
    const checkStudentSql = `
      SELECT student_id
      FROM students
      WHERE student_id = ?
    `;

    db.query(
      checkStudentSql,
      [student_id],
      (studentErr, studentResults) => {

        if (studentErr) {
          console.error("MySQL Error:", studentErr);

          return res.status(500).json({
            message: "Failed to check student",
            error: studentErr.message
          });
        }

        // =====================================
        // STUDENT NOT FOUND
        // =====================================
        if (studentResults.length === 0) {
          return res.status(404).json({
            message: "Student not found"
          });
        }

        // =====================================
        // UPDATE HEALTH RECORD
        // =====================================
        const sql = `
          UPDATE health_records
          SET
            student_id = ?,
            medical_condition = ?,
            allergies = ?,
            medications = ?,
            blood_type = ?,
            emergency_contact = ?,
            emergency_contact_number = ?,
            remarks = ?
          WHERE health_id = ?
        `;

        db.query(
          sql,
          [
            student_id,
            medical_condition || null,
            allergies || null,
            medications || null,
            blood_type || null,
            emergency_contact || null,
            emergency_contact_number || null,
            remarks || null,
            healthId
          ],
          (err, result) => {

            if (err) {
              console.error("MySQL Error:", err);

              return res.status(500).json({
                message: "Failed to update health record",
                error: err.message
              });
            }

            // =====================================
            // HEALTH RECORD NOT FOUND
            // =====================================
            if (result.affectedRows === 0) {
              return res.status(404).json({
                message: "Health record not found"
              });
            }

            // =====================================
            // UPDATE AUDIT LOG
            // =====================================
            logAudit(
              req.user.id,
              "UPDATE",
              "health",
              healthId,
              "Updated health record"
            );

            res.json({
              message: "Health record updated successfully"
            });
          }
        );
      }
    );
  }
);


// =====================================
// DELETE - Delete health record
// =====================================
router.delete(
  "/:id",
  permissionMiddleware("health", "delete"),
  (req, res) => {

    const healthId = req.params.id;

    const sql = `
      DELETE FROM health_records
      WHERE health_id = ?
    `;

    db.query(
      sql,
      [healthId],
      (err, result) => {

        if (err) {
          console.error("MySQL Error:", err);

          return res.status(500).json({
            message: "Failed to delete health record",
            error: err.message
          });
        }

        // =====================================
        // HEALTH RECORD NOT FOUND
        // =====================================
        if (result.affectedRows === 0) {
          return res.status(404).json({
            message: "Health record not found"
          });
        }

        // =====================================
        // DELETE AUDIT LOG
        // =====================================
        logAudit(
          req.user.id,
          "DELETE",
          "health",
          healthId,
          "Deleted health record"
        );

        res.json({
          message: "Health record deleted successfully"
        });
      }
    );
  }
);


module.exports = router;