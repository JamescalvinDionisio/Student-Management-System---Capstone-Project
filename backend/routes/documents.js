const express = require("express");
const db = require("../db");
const permissionMiddleware = require("../middleware/permissionMiddleware");
const logAudit = require("../middleware/auditLogger");

const router = express.Router();

// =====================================================
// GET - VIEW DOCUMENTS
// Student: Own documents only
// Other authorized roles: All documents
// =====================================================
router.get(
  "/",
  permissionMiddleware("documents", "read"),
  (req, res) => {
    let sql;
    let params = [];

    // =================================================
    // STUDENT CAN ONLY VIEW OWN DOCUMENTS
    // =================================================
    if (req.user.role === "student") {
      sql = `
        SELECT
          d.document_id,
          d.student_id,
          d.document_name,
          d.document_type,
          d.status,
          d.submission_date,
          d.expiry_date,
          d.remarks,
          d.created_at
        FROM documents d
        INNER JOIN students s
          ON d.student_id = s.student_id
        WHERE s.user_id = ?
        ORDER BY d.created_at DESC
      `;

      params = [req.user.id];

    } else {
      // =================================================
      // OTHER AUTHORIZED ROLES CAN VIEW ALL DOCUMENTS
      // =================================================
      sql = `
        SELECT
          document_id,
          student_id,
          document_name,
          document_type,
          status,
          submission_date,
          expiry_date,
          remarks,
          created_at
        FROM documents
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
            message: "Failed to fetch documents",
            error: err.message
          });
        }

        res.json(results);
      }
    );
  }
);


// =====================================================
// POST - CREATE DOCUMENT RECORD
// Permission: CREATE
// =====================================================
router.post(
  "/",
  permissionMiddleware("documents", "create"),
  (req, res) => {

    const {
      student_id,
      document_name,
      document_type,
      status,
      submission_date,
      expiry_date,
      remarks
    } = req.body || {};

    // =================================================
    // REQUIRED FIELD VALIDATION
    // =================================================
    if (!student_id || !document_name) {
      return res.status(400).json({
        message: "student_id and document_name are required"
      });
    }

    // =================================================
    // CHECK IF STUDENT EXISTS
    // =================================================
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

        // =================================================
        // STUDENT NOT FOUND
        // =================================================
        if (studentResults.length === 0) {
          return res.status(404).json({
            message: "Student not found"
          });
        }

        // =================================================
        // CREATE DOCUMENT
        // =================================================
        const sql = `
          INSERT INTO documents
          (
            student_id,
            document_name,
            document_type,
            status,
            submission_date,
            expiry_date,
            remarks
          )
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        db.query(
          sql,
          [
            student_id,
            document_name,
            document_type || null,
            status || "pending",
            submission_date || null,
            expiry_date || null,
            remarks || null
          ],
          (err, result) => {

            if (err) {
              console.error("MySQL Error:", err);

              return res.status(500).json({
                message: "Failed to create document",
                error: err.message
              });
            }

            // =================================================
            // CREATE AUDIT LOG
            // =================================================
            logAudit(
              req.user.id,
              "CREATE",
              "documents",
              result.insertId,
              "Created new document"
            );

            res.status(201).json({
              message: "Document created successfully",
              document_id: result.insertId
            });
          }
        );
      }
    );
  }
);


// =====================================================
// PUT - UPDATE DOCUMENT
// Permission: UPDATE
// =====================================================
router.put(
  "/:id",
  permissionMiddleware("documents", "update"),
  (req, res) => {

    const documentId = req.params.id;

    const {
      student_id,
      document_name,
      document_type,
      status,
      submission_date,
      expiry_date,
      remarks
    } = req.body || {};

    // =================================================
    // REQUIRED FIELD VALIDATION
    // =================================================
    if (!student_id || !document_name) {
      return res.status(400).json({
        message: "student_id and document_name are required"
      });
    }

    // =================================================
    // CHECK IF STUDENT EXISTS
    // =================================================
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

        // =================================================
        // STUDENT NOT FOUND
        // =================================================
        if (studentResults.length === 0) {
          return res.status(404).json({
            message: "Student not found"
          });
        }

        // =================================================
        // UPDATE DOCUMENT
        // =================================================
        const sql = `
          UPDATE documents
          SET
            student_id = ?,
            document_name = ?,
            document_type = ?,
            status = ?,
            submission_date = ?,
            expiry_date = ?,
            remarks = ?
          WHERE document_id = ?
        `;

        db.query(
          sql,
          [
            student_id,
            document_name,
            document_type || null,
            status || "pending",
            submission_date || null,
            expiry_date || null,
            remarks || null,
            documentId
          ],
          (err, result) => {

            if (err) {
              console.error("MySQL Error:", err);

              return res.status(500).json({
                message: "Failed to update document",
                error: err.message
              });
            }

            // =================================================
            // DOCUMENT NOT FOUND
            // =================================================
            if (result.affectedRows === 0) {
              return res.status(404).json({
                message: "Document not found"
              });
            }

            // =================================================
            // UPDATE AUDIT LOG
            // =================================================
            logAudit(
              req.user.id,
              "UPDATE",
              "documents",
              documentId,
              "Updated document"
            );

            res.json({
              message: "Document updated successfully"
            });
          }
        );
      }
    );
  }
);


// =====================================================
// DELETE - DELETE DOCUMENT
// Permission: DELETE
// =====================================================
router.delete(
  "/:id",
  permissionMiddleware("documents", "delete"),
  (req, res) => {

    const documentId = req.params.id;

    const sql = `
      DELETE FROM documents
      WHERE document_id = ?
    `;

    db.query(
      sql,
      [documentId],
      (err, result) => {

        if (err) {
          console.error("MySQL Error:", err);

          return res.status(500).json({
            message: "Failed to delete document",
            error: err.message
          });
        }

        // =================================================
        // DOCUMENT NOT FOUND
        // =================================================
        if (result.affectedRows === 0) {
          return res.status(404).json({
            message: "Document not found"
          });
        }

        // =================================================
        // DELETE AUDIT LOG
        // =================================================
        logAudit(
          req.user.id,
          "DELETE",
          "documents",
          documentId,
          "Deleted document"
        );

        res.json({
          message: "Document deleted successfully"
        });
      }
    );
  }
);


module.exports = router;