const express = require("express");
const db = require("../db");
const permissionMiddleware = require("../middleware/permissionMiddleware");
const logAudit = require("../middleware/auditLogger");

const router = express.Router();


// =====================================================
// GET - View academic areas
// =====================================================
router.get(
  "/",
  permissionMiddleware("academic_area", "read"),
  (req, res) => {

   const sql = `
  SELECT
    aa.area_id,
    aa.area_name,
    aa.description,
    aa.created_at,
    COUNT(taa.teacher_id) AS teachers_assigned
  FROM academic_areas aa
  LEFT JOIN teacher_academic_areas taa
    ON aa.area_id = taa.area_id
  GROUP BY
    aa.area_id,
    aa.area_name,
    aa.description,
    aa.created_at
  ORDER BY aa.area_id ASC
`;

    db.query(sql, (err, results) => {

      if (err) {
        console.error("MySQL Error:", err);

        return res.status(500).json({
          message: "Failed to fetch academic areas",
          error: err.message
        });
      }

      res.json(results);
    });
  }
);


// =====================================================
// POST - Create academic area
// =====================================================
router.post(
  "/",
  permissionMiddleware("academic_area", "create"),
  (req, res) => {

    const {
      area_name,
      description
    } = req.body || {};

    if (!area_name || !area_name.trim()) {
      return res.status(400).json({
        message: "Area name is required"
      });
    }

    const sql = `
      INSERT INTO academic_areas
      (area_name, description)
      VALUES (?, ?)
    `;

    db.query(
      sql,
      [
        area_name.trim(),
        description
          ? description.trim()
          : null
      ],
      (err, result) => {

        if (err) {
          console.error("MySQL Error:", err);

          return res.status(500).json({
            message: "Failed to create academic area",
            error: err.message
          });
        }

        logAudit(
          req.user.id,
          "CREATE",
          "academic_area",
          result.insertId,
          "Created new academic area"
        );

        res.status(201).json({
          message: "Academic area created successfully",
          area_id: result.insertId
        });
      }
    );
  }
);


// =====================================================
// UPDATE - Update academic area
// =====================================================
router.put(
  "/:id",
  permissionMiddleware("academic_area", "update"),
  (req, res) => {

    const areaId = req.params.id;

    const {
      area_name,
      description
    } = req.body || {};

    if (!area_name || !area_name.trim()) {
      return res.status(400).json({
        message: "Area name is required"
      });
    }

    const checkSql = `
      SELECT area_id
      FROM academic_areas
      WHERE area_id = ?
    `;

    db.query(
      checkSql,
      [areaId],
      (checkErr, checkResult) => {

        if (checkErr) {
          console.error(
            "MySQL Error:",
            checkErr
          );

          return res.status(500).json({
            message:
              "Failed to verify academic area",
            error: checkErr.message
          });
        }

        if (checkResult.length === 0) {
          return res.status(404).json({
            message:
              "Academic area not found"
          });
        }

        const sql = `
          UPDATE academic_areas
          SET
            area_name = ?,
            description = ?
          WHERE area_id = ?
        `;

        db.query(
          sql,
          [
            area_name.trim(),
            description
              ? description.trim()
              : null,
            areaId
          ],
          (err, result) => {

            if (err) {
              console.error(
                "MySQL Error:",
                err
              );

              return res.status(500).json({
                message:
                  "Failed to update academic area",
                error: err.message
              });
            }

            logAudit(
              req.user.id,
              "UPDATE",
              "academic_area",
              areaId,
              "Updated academic area"
            );

            res.json({
              message:
                "Academic area updated successfully"
            });
          }
        );
      }
    );
  }
);


// =====================================================
// DELETE - Delete academic area
// =====================================================
router.delete(
  "/:id",
  permissionMiddleware("academic_area", "delete"),
  (req, res) => {

    const areaId = req.params.id;

    const checkSql = `
      SELECT area_id
      FROM academic_areas
      WHERE area_id = ?
    `;

    db.query(
      checkSql,
      [areaId],
      (checkErr, checkResult) => {

        if (checkErr) {
          console.error(
            "MySQL Error:",
            checkErr
          );

          return res.status(500).json({
            message:
              "Failed to verify academic area",
            error: checkErr.message
          });
        }

        if (checkResult.length === 0) {
          return res.status(404).json({
            message:
              "Academic area not found"
          });
        }

        const sql = `
          DELETE FROM academic_areas
          WHERE area_id = ?
        `;

        db.query(
          sql,
          [areaId],
          (err, result) => {

            if (err) {
              console.error(
                "MySQL Error:",
                err
              );

              return res.status(500).json({
                message:
                  "Failed to delete academic area",
                error: err.message
              });
            }

            logAudit(
              req.user.id,
              "DELETE",
              "academic_area",
              areaId,
              "Deleted academic area"
            );

            res.json({
              message:
                "Academic area deleted successfully"
            });
          }
        );
      }
    );
  }
);


module.exports = router;