const express = require("express");
const db = require("../db");
const permissionMiddleware = require("../middleware/permissionMiddleware");
const logAudit = require("../middleware/auditLogger");

const router = express.Router();

console.log("🔥 TASKS.JS LOADED");


// =====================================================
// GET - VIEW TASKS
// Student: Own tasks only
// Other authorized roles: All tasks
// =====================================================
router.get(
  "/",
  permissionMiddleware("tasks", "read"),
  (req, res) => {

    let sql;
    let params = [];

    // =====================================================
    // STUDENT CAN ONLY VIEW OWN TASKS
    // =====================================================
    if (req.user.role === "student") {

      sql = `
        SELECT
          t.task_id,
          t.student_id,
          t.title,
          t.description,
          t.due_date,
          t.status,
          t.priority,
          t.created_at
        FROM tasks t
        INNER JOIN students s
          ON t.student_id = s.student_id
        WHERE s.user_id = ?
        ORDER BY t.due_date ASC
      `;

      params = [req.user.id];

    } else {

      // =====================================================
      // OTHER AUTHORIZED ROLES CAN VIEW ALL TASKS
      // =====================================================
      sql = `
        SELECT
          task_id,
          student_id,
          title,
          description,
          due_date,
          status,
          priority,
          created_at
        FROM tasks
        ORDER BY due_date ASC
      `;
    }

    db.query(
      sql,
      params,
      (err, results) => {

        if (err) {
          console.error("MySQL Error:", err);

          return res.status(500).json({
            message: "Failed to fetch tasks",
            error: err.message
          });
        }

        res.json(results);
      }
    );
  }
);


// =====================================================
// POST - CREATE TASK
// Permission: CREATE
// =====================================================
router.post(
  "/",
  permissionMiddleware("tasks", "create"),
  (req, res) => {

    // =====================================================
    // GET REQUEST BODY SAFELY
    // =====================================================
    const {
      student_id,
      title,
      description,
      due_date,
      status,
      priority
    } = req.body || {};

    // =====================================================
    // REQUIRED FIELD VALIDATION
    // =====================================================
    if (!student_id || !title) {
      return res.status(400).json({
        message: "student_id and title are required"
      });
    }

    // =====================================================
    // CHECK IF STUDENT EXISTS
    // =====================================================
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

        // =====================================================
        // STUDENT NOT FOUND
        // =====================================================
        if (studentResult.length === 0) {
          return res.status(404).json({
            message: "Student not found"
          });
        }

        // =====================================================
        // CREATE TASK
        // =====================================================
        const sql = `
          INSERT INTO tasks
          (
            student_id,
            title,
            description,
            due_date,
            status,
            priority
          )
          VALUES (?, ?, ?, ?, ?, ?)
        `;

        db.query(
          sql,
          [
            student_id,
            title,
            description || null,
            due_date || null,
            status || "pending",
            priority || "medium"
          ],
          (err, result) => {

            if (err) {
              console.error("MySQL Error:", err);

              return res.status(500).json({
                message: "Failed to create task",
                error: err.message
              });
            }

            // =====================================================
            // CREATE AUDIT LOG
            // =====================================================
            logAudit(
              req.user.id,
              "CREATE",
              "tasks",
              result.insertId,
              "Created new task"
            );

            res.status(201).json({
              message: "Task created successfully",
              task_id: result.insertId
            });
          }
        );
      }
    );
  }
);


// =====================================================
// PUT - UPDATE TASK
// Permission: UPDATE
// =====================================================
router.put(
  "/:id",
  permissionMiddleware("tasks", "update"),
  (req, res) => {

    // =====================================================
    // SECURITY DEBUG
    // =====================================================
    console.log("========== TASK UPDATE CHECK ==========");
    console.log("User ID:", req.user.id);
    console.log("User Role:", req.user.role);
    console.log("Task ID:", req.params.id);
    console.log("=======================================");

    // =====================================================
    // STUDENT MUST NEVER UPDATE TASKS
    // =====================================================
    if (req.user.role === "student") {

      console.log("❌ STUDENT UPDATE BLOCKED");

      return res.status(403).json({
        message: "You do not have permission to perform this action"
      });
    }

    // =====================================================
    // ONLY AUTHORIZED NON-STUDENT ROLES CONTINUE
    // =====================================================
    const allowedUpdateRoles = [
      "admin",
      "principal",
      "department_head",
      "teacher"
    ];

    if (!allowedUpdateRoles.includes(req.user.role)) {

      console.log("❌ ROLE NOT ALLOWED TO UPDATE TASKS:", req.user.role);

      return res.status(403).json({
        message: "You do not have permission to perform this action"
      });
    }

    const taskId = req.params.id;

    // =====================================================
    // GET REQUEST BODY SAFELY
    // =====================================================
    const {
      student_id,
      title,
      description,
      due_date,
      status,
      priority
    } = req.body || {};

    // =====================================================
    // REQUIRED FIELD VALIDATION
    // =====================================================
    if (!student_id || !title) {
      return res.status(400).json({
        message: "student_id and title are required"
      });
    }

    // =====================================================
    // CHECK IF TASK EXISTS
    // =====================================================
    const checkTaskSql = `
      SELECT task_id
      FROM tasks
      WHERE task_id = ?
    `;

    db.query(
      checkTaskSql,
      [taskId],
      (taskErr, taskResult) => {

        if (taskErr) {
          console.error("MySQL Error:", taskErr);

          return res.status(500).json({
            message: "Failed to verify task",
            error: taskErr.message
          });
        }

        // =====================================================
        // TASK NOT FOUND
        // =====================================================
        if (taskResult.length === 0) {
          return res.status(404).json({
            message: "Task not found"
          });
        }

        // =====================================================
        // CHECK IF STUDENT EXISTS
        // =====================================================
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

            // =====================================================
            // STUDENT NOT FOUND
            // =====================================================
            if (studentResult.length === 0) {
              return res.status(404).json({
                message: "Student not found"
              });
            }

            // =====================================================
            // UPDATE TASK
            // =====================================================
            const sql = `
              UPDATE tasks
              SET
                student_id = ?,
                title = ?,
                description = ?,
                due_date = ?,
                status = ?,
                priority = ?
              WHERE task_id = ?
            `;

            db.query(
              sql,
              [
                student_id,
                title,
                description || null,
                due_date || null,
                status || "pending",
                priority || "medium",
                taskId
              ],
              (err, result) => {

                if (err) {
                  console.error("MySQL Error:", err);

                  return res.status(500).json({
                    message: "Failed to update task",
                    error: err.message
                  });
                }

                if (result.affectedRows === 0) {
                  return res.status(404).json({
                    message: "Task not found"
                  });
                }

                // =====================================================
                // UPDATE AUDIT LOG
                // =====================================================
                logAudit(
                  req.user.id,
                  "UPDATE",
                  "tasks",
                  taskId,
                  "Updated task"
                );

                res.json({
                  message: "Task updated successfully"
                });
              }
            );
          }
        );
      }
    );
  }
);


// =====================================================
// DELETE - DELETE TASK
// Permission: DELETE
// =====================================================
router.delete(
  "/:id",
  permissionMiddleware("tasks", "delete"),
  (req, res) => {

    // =====================================================
    // SECURITY DEBUG
    // =====================================================
    console.log("========== TASK DELETE CHECK ==========");
    console.log("User ID:", req.user.id);
    console.log("User Role:", req.user.role);
    console.log("Task ID:", req.params.id);
    console.log("=======================================");

    // =====================================================
    // STUDENT MUST NEVER DELETE TASKS
    // =====================================================
    if (req.user.role === "student") {

      console.log("❌ STUDENT DELETE BLOCKED");

      return res.status(403).json({
        message: "You do not have permission to perform this action"
      });
    }

    // =====================================================
    // ONLY AUTHORIZED NON-STUDENT ROLES CONTINUE
    // =====================================================
    const allowedDeleteRoles = [
      "admin",
      "teacher"
    ];

    if (!allowedDeleteRoles.includes(req.user.role)) {

      console.log("❌ ROLE NOT ALLOWED TO DELETE TASKS:", req.user.role);

      return res.status(403).json({
        message: "You do not have permission to perform this action"
      });
    }

    const taskId = req.params.id;

    // =====================================================
    // DELETE TASK
    // =====================================================
    const sql = `
      DELETE FROM tasks
      WHERE task_id = ?
    `;

    db.query(
      sql,
      [taskId],
      (err, result) => {

        if (err) {
          console.error("MySQL Error:", err);

          return res.status(500).json({
            message: "Failed to delete task",
            error: err.message
          });
        }

        // =====================================================
        // TASK NOT FOUND
        // =====================================================
        if (result.affectedRows === 0) {
          return res.status(404).json({
            message: "Task not found"
          });
        }

        // =====================================================
        // DELETE AUDIT LOG
        // =====================================================
        logAudit(
          req.user.id,
          "DELETE",
          "tasks",
          taskId,
          "Deleted task"
        );

        res.json({
          message: "Task deleted successfully"
        });
      }
    );
  }
);


module.exports = router;