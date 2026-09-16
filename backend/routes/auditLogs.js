const express = require("express");
const db = require("../db");
const permissionMiddleware = require("../middleware/permissionMiddleware");

const router = express.Router();

// GET - View audit logs
router.get(
  "/",
  permissionMiddleware("audit_logs", "read"),
  (req, res) => {
    const sql = `
      SELECT
        log_id,
        user_id,
        action,
        module,
        record_id,
        description,
        created_at
      FROM audit_logs
      ORDER BY created_at DESC
    `;

    db.query(sql, (err, results) => {
      if (err) {
        console.error("MySQL Error:", err);

        return res.status(500).json({
          message: "Failed to fetch audit logs",
          error: err.message
        });
      }

      res.json(results);
    });
  }
);

module.exports = router;