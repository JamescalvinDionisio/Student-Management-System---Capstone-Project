const express = require("express");
const router = express.Router();
const db = require("../db");
const permissionMiddleware = require("../middleware/permissionMiddleware");


// =====================================================
// GET - View announcements
// =====================================================

router.get(
  "/",
  permissionMiddleware("announcements", "read"),
  (req, res) => {

    const sql = `
      SELECT
        announcement_id,
        title,
        message,
        created_at
      FROM announcements
      ORDER BY created_at DESC
    `;

    db.query(sql, (err, results) => {

      if (err) {
        console.error("Announcements Error:", err);

        return res.status(500).json({
          message: "Failed to fetch announcements",
          error: err.message
        });
      }

      res.json(results);
    });
  }
);


module.exports = router;