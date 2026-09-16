const express = require("express");
const db = require("../db");
const permissionMiddleware = require("../middleware/permissionMiddleware");
const logAudit = require("../middleware/auditLogger");

const router = express.Router();


// =====================================================
// GET - View risk alerts
// =====================================================
router.get(
  "/",
  permissionMiddleware("risk_alerts", "read"),
  (req, res) => {

    let sql;
    let params = [];

    // STUDENT:
    // Only view alerts belonging to their own student record
    if (req.user.role === "student") {

      sql = `
        SELECT
          r.alert_id,
          r.student_id,
          r.alert_type,
          r.severity,
          r.description,
          r.status,
          r.created_at
        FROM risk_alerts r
        INNER JOIN students s
          ON r.student_id = s.student_id
        WHERE s.user_id = ?
        ORDER BY r.created_at DESC
      `;

      params = [req.user.id];

    } else {

      // ADMIN / TEACHER / OTHER AUTHORIZED ROLES
      sql = `
        SELECT
          alert_id,
          student_id,
          alert_type,
          severity,
          description,
          status,
          created_at
        FROM risk_alerts
        ORDER BY created_at DESC
      `;
    }

    db.query(sql, params, (err, results) => {

      if (err) {
        console.error("MySQL Error:", err);

        return res.status(500).json({
          message: "Failed to fetch risk alerts",
          error: err.message
        });
      }

      res.json(results);
    });
  }
);


// =====================================================
// POST - Create risk alert
// =====================================================
router.post(
  "/",
  permissionMiddleware("risk_alerts", "create"),
  (req, res) => {

    const {
      student_id,
      alert_type,
      severity,
      description,
      status
    } = req.body || {};


    // Required fields
    if (!student_id || !alert_type) {
      return res.status(400).json({
        message: "student_id and alert_type are required"
      });
    }


    // =================================================
    // STUDENT EXISTENCE CHECK
    // =================================================
    const checkStudentSql = `
      SELECT student_id
      FROM students
      WHERE student_id = ?
    `;

    db.query(
      checkStudentSql,
      [student_id],
      (err, studentResults) => {

        if (err) {
          console.error("MySQL Error:", err);

          return res.status(500).json({
            message: "Database error",
            error: err.message
          });
        }


        if (studentResults.length === 0) {
          return res.status(404).json({
            message: "Student not found"
          });
        }


        // =================================================
        // INSERT RISK ALERT
        // =================================================
        const sql = `
          INSERT INTO risk_alerts
          (
            student_id,
            alert_type,
            severity,
            description,
            status
          )
          VALUES (?, ?, ?, ?, ?)
        `;

        db.query(
          sql,
          [
            student_id,
            alert_type,
            severity || "medium",
            description || null,
            status || "open"
          ],
          (err, result) => {

            if (err) {
              console.error("MySQL Error:", err);

              return res.status(500).json({
                message: "Failed to create risk alert",
                error: err.message
              });
            }


            // CREATE AUDIT LOG
            logAudit(
              req.user.id,
              "CREATE",
              "risk_alerts",
              result.insertId,
              "Created new risk alert"
            );


            res.status(201).json({
              message: "Risk alert created successfully",
              alert_id: result.insertId
            });
          }
        );
      }
    );
  }
);


// =====================================================
// PUT - Update risk alert
// =====================================================
router.put(
  "/:id",
  permissionMiddleware("risk_alerts", "update"),
  (req, res) => {

    const alertId = req.params.id;

    const {
      student_id,
      alert_type,
      severity,
      description,
      status
    } = req.body || {};


    if (!student_id || !alert_type) {
      return res.status(400).json({
        message: "student_id and alert_type are required"
      });
    }


    // =================================================
    // CHECK STUDENT EXISTS
    // =================================================
    const checkStudentSql = `
      SELECT student_id
      FROM students
      WHERE student_id = ?
    `;

    db.query(
      checkStudentSql,
      [student_id],
      (err, studentResults) => {

        if (err) {
          console.error("MySQL Error:", err);

          return res.status(500).json({
            message: "Database error",
            error: err.message
          });
        }


        if (studentResults.length === 0) {
          return res.status(404).json({
            message: "Student not found"
          });
        }


        // =================================================
        // UPDATE RISK ALERT
        // =================================================
        const sql = `
          UPDATE risk_alerts
          SET
            student_id = ?,
            alert_type = ?,
            severity = ?,
            description = ?,
            status = ?
          WHERE alert_id = ?
        `;

        db.query(
          sql,
          [
            student_id,
            alert_type,
            severity || "medium",
            description || null,
            status || "open",
            alertId
          ],
          (err, result) => {

            if (err) {
              console.error("MySQL Error:", err);

              return res.status(500).json({
                message: "Failed to update risk alert",
                error: err.message
              });
            }


            if (result.affectedRows === 0) {
              return res.status(404).json({
                message: "Risk alert not found"
              });
            }


            // UPDATE AUDIT LOG
            logAudit(
              req.user.id,
              "UPDATE",
              "risk_alerts",
              alertId,
              "Updated risk alert"
            );


            res.json({
              message: "Risk alert updated successfully"
            });
          }
        );
      }
    );
  }
);


// =====================================================
// DELETE - Delete risk alert
// =====================================================
router.delete(
  "/:id",
  permissionMiddleware("risk_alerts", "delete"),
  (req, res) => {

    const alertId = req.params.id;

    const sql = `
      DELETE FROM risk_alerts
      WHERE alert_id = ?
    `;

    db.query(
      sql,
      [alertId],
      (err, result) => {

        if (err) {
          console.error("MySQL Error:", err);

          return res.status(500).json({
            message: "Failed to delete risk alert",
            error: err.message
          });
        }


        if (result.affectedRows === 0) {
          return res.status(404).json({
            message: "Risk alert not found"
          });
        }


        // DELETE AUDIT LOG
        logAudit(
          req.user.id,
          "DELETE",
          "risk_alerts",
          alertId,
          "Deleted risk alert"
        );


        res.json({
          message: "Risk alert deleted successfully"
        });
      }
    );
  }
);


module.exports = router;