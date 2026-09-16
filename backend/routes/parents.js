const express = require("express");
const db = require("../db");
const permissionMiddleware = require("../middleware/permissionMiddleware");
const logAudit = require("../middleware/auditLogger");

const router = express.Router();

// ===============================
// GET PARENTS
// Permission: READ
// ===============================
router.get(
  "/",
  permissionMiddleware("parents", "read"),
  (req, res) => {

    let sql;
    let params = [];

    // ===============================
    // STUDENT CAN ONLY SEE OWN PARENT
    // ===============================
    if (req.user.role === "student") {

      sql = `
        SELECT
          p.parent_id,
          p.contact_number,
          p.user_id
        FROM parents p
        INNER JOIN students s
          ON s.parent_id = p.parent_id
        WHERE s.user_id = ?
      `;

      params = [req.user.id];

    } else {

      // ===============================
      // OTHER AUTHORIZED ROLES
      // CAN VIEW ALL PARENTS
      // ===============================
      sql = `
        SELECT
          parent_id,
          contact_number,
          user_id
        FROM parents
      `;
    }

    db.query(
      sql,
      params,
      (err, results) => {

        if (err) {
          console.error("MySQL Error:", err);

          return res.status(500).json({
            message: "Failed to fetch parents",
            error: err.message
          });
        }

        res.json(results);
      }
    );
  }
);

// ===============================
// ADD PARENT
// Permission: CREATE
// ===============================
router.post(
  "/",
  permissionMiddleware("parents", "create"),
  (req, res) => {

    const {
      contact_number,
      user_id
    } = req.body;

    if (!contact_number || !user_id) {
      return res.status(400).json({
        message: "contact_number and user_id are required"
      });
    }

    const sql = `
      INSERT INTO parents
      (contact_number, user_id)
      VALUES (?, ?)
    `;

    db.query(
      sql,
      [contact_number, user_id],
      (err, result) => {

        if (err) {
          console.error("MySQL Error:", err);

          return res.status(500).json({
            message: "Failed to add parent",
            error: err.message
          });
        }

        // ===============================
        // CREATE AUDIT LOG
        // ===============================
        logAudit(
          req.user.id,
          "CREATE",
          "parents",
          result.insertId,
          "Created new parent"
        );

        res.status(201).json({
          message: "Parent added successfully",
          parent_id: result.insertId
        });
      }
    );
  }
);

// ===============================
// UPDATE PARENT
// Permission: UPDATE
// ===============================
router.put(
  "/:id",
  permissionMiddleware("parents", "update"),
  (req, res) => {

    const parentId = req.params.id;

    const {
      contact_number
    } = req.body;

    if (!contact_number) {
      return res.status(400).json({
        message: "contact_number is required"
      });
    }

    const sql = `
      UPDATE parents
      SET contact_number = ?
      WHERE parent_id = ?
    `;

    db.query(
      sql,
      [
        contact_number,
        parentId
      ],
      (err, result) => {

        if (err) {
          console.error("MySQL Error:", err);

          return res.status(500).json({
            message: "Failed to update parent",
            error: err.message
          });
        }

        if (result.affectedRows === 0) {
          return res.status(404).json({
            message: "Parent not found"
          });
        }

        // ===============================
        // UPDATE AUDIT LOG
        // ===============================
        logAudit(
          req.user.id,
          "UPDATE",
          "parents",
          parentId,
          "Updated parent information"
        );

        res.json({
          message: "Parent updated successfully"
        });
      }
    );
  }
);

// ===============================
// DELETE PARENT
// Permission: DELETE
// ===============================
router.delete(
  "/:id",
  permissionMiddleware("parents", "delete"),
  (req, res) => {

    const parentId = req.params.id;

    const sql = `
      DELETE FROM parents
      WHERE parent_id = ?
    `;

    db.query(
      sql,
      [parentId],
      (err, result) => {

        if (err) {
          console.error("MySQL Error:", err);

          return res.status(500).json({
            message: "Failed to delete parent",
            error: err.message
          });
        }

        if (result.affectedRows === 0) {
          return res.status(404).json({
            message: "Parent not found"
          });
        }

        // ===============================
        // DELETE AUDIT LOG
        // ===============================
        logAudit(
          req.user.id,
          "DELETE",
          "parents",
          parentId,
          "Deleted parent"
        );

        res.json({
          message: "Parent deleted successfully"
        });
      }
    );
  }
);

module.exports = router;