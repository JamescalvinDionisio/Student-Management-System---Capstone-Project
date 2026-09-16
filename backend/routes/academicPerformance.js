const express = require("express");
const router = express.Router();

const db = require("../db");

// =====================================================
// GET ACADEMIC PERFORMANCE
// =====================================================
// Parent:
// Makikita lamang ang academic records ng kanyang anak.
//
// Student:
// Makikita lamang ang sarili niyang academic records.
//
// Admin/other roles:
// Maaaring makita ang academic records ng students.
// =====================================================

router.get("/", (req, res) => {
  const userId = req.user.id;
  const userRole = req.user.role;

  // =====================================================
  // PARENT
  // =====================================================
  if (userRole === "parent") {
    const sql = `
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
      INNER JOIN parents p
        ON s.parent_id = p.parent_id
      WHERE p.user_id = ?
      ORDER BY ar.record_id DESC
    `;

    db.query(sql, [userId], (err, results) => {
      if (err) {
        console.error("Parent Academic Performance Error:", err);

        return res.status(500).json({
          message: "Failed to fetch academic performance",
          error: err.message
        });
      }

      return res.json(results);
    });

    return;
  }

  // =====================================================
  // STUDENT
  // =====================================================
  if (userRole === "student") {
    const sql = `
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

    db.query(sql, [userId], (err, results) => {
      if (err) {
        console.error("Student Academic Performance Error:", err);

        return res.status(500).json({
          message: "Failed to fetch academic performance",
          error: err.message
        });
      }

      return res.json(results);
    });

    return;
  }

  // =====================================================
  // ADMIN / OTHER AUTHORIZED USERS
  // =====================================================
  const sql = `
    SELECT
      ar.record_id,
      ar.student_id,
      ar.subject,
      ar.grade,
      ar.school_year,
      ar.semester
    FROM academic_records ar
    ORDER BY ar.record_id DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Academic Performance Error:", err);

      return res.status(500).json({
        message: "Failed to fetch academic performance",
        error: err.message
      });
    }

    res.json(results);
  });
});

module.exports = router;