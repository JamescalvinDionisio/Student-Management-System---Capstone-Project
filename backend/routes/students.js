const express = require("express");
const db = require("../db");

const permissionMiddleware = require("../middleware/permissionMiddleware");
const logAudit = require("../middleware/auditLogger");

const router = express.Router();

/* =========================================================
   GET STUDENTS
   Permission: READ
   ========================================================= */

router.get(
  "/",
  permissionMiddleware("students", "read"),
  (req, res) => {
    let sql;
    let params = [];

    /*
     * STUDENT:
     * Can only view their own student record.
     */
    if (req.user.role === "student") {
      sql = `
        SELECT
          s.student_id,
          s.grade_level,
          s.parent_id,
          s.section,
          s.enrollment_status,
          s.user_id,
          u.name,
          u.email,
          p.contact_number
        FROM students s
        INNER JOIN users u
          ON s.user_id = u.id
        LEFT JOIN parents p
          ON s.parent_id = p.parent_id
        WHERE s.user_id = ?
        ORDER BY s.student_id DESC
      `;

      params = [req.user.id];
    }

    /*
     * OTHER AUTHORIZED ROLES:
     * Can view all student records.
     */
    else {
      sql = `
        SELECT
          s.student_id,
          s.grade_level,
          s.parent_id,
          s.section,
          s.enrollment_status,
          s.user_id,
          u.name,
          u.email,
          p.contact_number
        FROM students s
        INNER JOIN users u
          ON s.user_id = u.id
        LEFT JOIN parents p
          ON s.parent_id = p.parent_id
        ORDER BY s.student_id DESC
      `;
    }

    db.query(
      sql,
      params,
      (err, results) => {
        if (err) {
          console.error(
            "MySQL Error:",
            err
          );

          return res.status(500).json({
            message:
              "Failed to fetch students",
            error:
              err.message
          });
        }

        res.json(results);
      }
    );
  }
);


/* =========================================================
   ADD STUDENT
   Permission: CREATE
   ========================================================= */

router.post(
  "/",
  permissionMiddleware(
    "students",
    "create"
  ),
  (req, res) => {

    const {
      grade_level,
      parent_id,
      section,
      enrollment_status,
      user_id
    } = req.body || {};


    /*
     * REQUIRED FIELDS
     */

    if (
      !grade_level ||
      !section ||
      !enrollment_status ||
      !user_id
    ) {
      return res.status(400).json({
        message:
          "grade_level, section, enrollment_status, and user_id are required"
      });
    }


    const numericUserId =
      Number(user_id);

    if (
      !Number.isInteger(
        numericUserId
      ) ||
      numericUserId <= 0
    ) {
      return res.status(400).json({
        message:
          "Invalid user_id"
      });
    }


    let numericParentId = null;

    if (
      parent_id !== null &&
      parent_id !== undefined &&
      String(parent_id).trim() !== ""
    ) {
      numericParentId =
        Number(parent_id);

      if (
        !Number.isInteger(
          numericParentId
        ) ||
        numericParentId <= 0
      ) {
        return res.status(400).json({
          message:
            "Invalid parent_id"
        });
      }
    }


    /*
     * CHECK USER EXISTS
     * AND MUST HAVE STUDENT ROLE
     */

    const checkUserSql = `
      SELECT
        id,
        name,
        role
      FROM users
      WHERE id = ?
    `;

    db.query(
      checkUserSql,
      [numericUserId],
      (userErr, userResults) => {

        if (userErr) {
          console.error(
            "MySQL Error:",
            userErr
          );

          return res.status(500).json({
            message:
              "Failed to verify user",
            error:
              userErr.message
          });
        }


        if (
          userResults.length === 0
        ) {
          return res.status(404).json({
            message:
              "User not found"
          });
        }


        const selectedUser =
          userResults[0];


        if (
          selectedUser.role !==
          "student"
        ) {
          return res.status(400).json({
            message:
              "Selected user must have the student role"
          });
        }


        /*
         * CHECK IF USER ALREADY HAS
         * A STUDENT RECORD
         */

        const duplicateStudentSql = `
          SELECT student_id
          FROM students
          WHERE user_id = ?
        `;

        db.query(
          duplicateStudentSql,
          [numericUserId],
          (
            duplicateErr,
            duplicateResults
          ) => {

            if (duplicateErr) {
              console.error(
                "MySQL Error:",
                duplicateErr
              );

              return res.status(500).json({
                message:
                  "Failed to verify existing student record",
                error:
                  duplicateErr.message
              });
            }


            if (
              duplicateResults.length >
              0
            ) {
              return res.status(409).json({
                message:
                  "This user already has a student record"
              });
            }


            /*
             * CHECK PARENT
             */

            const continueInsert =
              () => {

                const insertSql = `
                  INSERT INTO students
                  (
                    grade_level,
                    parent_id,
                    section,
                    enrollment_status,
                    user_id
                  )
                  VALUES (?, ?, ?, ?, ?)
                `;


                db.query(
                  insertSql,
                  [
                    String(
                      grade_level
                    ).trim(),

                    numericParentId,

                    String(
                      section
                    ).trim(),

                    String(
                      enrollment_status
                    ).trim(),

                    numericUserId
                  ],
                  (
                    insertErr,
                    result
                  ) => {

                    if (insertErr) {
                      console.error(
                        "MySQL Error:",
                        insertErr
                      );

                      return res.status(500).json({
                        message:
                          "Failed to add student",
                        error:
                          insertErr.message
                      });
                    }


                    /*
                     * AUDIT LOG
                     */

                    logAudit(
                      req.user.id,
                      "CREATE",
                      "students",
                      result.insertId,
                      "Created new student"
                    );


                    res.status(201).json({
                      message:
                        "Student added successfully",

                      student_id:
                        result.insertId
                    });

                  }
                );
              };


            if (
              numericParentId
            ) {

              const checkParentSql = `
                SELECT
                  parent_id
                FROM parents
                WHERE parent_id = ?
              `;

              db.query(
                checkParentSql,
                [numericParentId],
                (
                  parentErr,
                  parentResults
                ) => {

                  if (parentErr) {
                    console.error(
                      "MySQL Error:",
                      parentErr
                    );

                    return res.status(500).json({
                      message:
                        "Failed to verify parent",
                      error:
                        parentErr.message
                    });
                  }


                  if (
                    parentResults.length ===
                    0
                  ) {
                    return res.status(404).json({
                      message:
                        "Parent not found"
                    });
                  }


                  continueInsert();

                }
              );

            } else {

              continueInsert();

            }

          }
        );

      }
    );
  }
);


/* =========================================================
   UPDATE STUDENT
   Permission: UPDATE
   ========================================================= */

router.put(
  "/:id",
  permissionMiddleware(
    "students",
    "update"
  ),
  (req, res) => {

    const studentId =
      Number(req.params.id);

    if (
      !Number.isInteger(
        studentId
      ) ||
      studentId <= 0
    ) {
      return res.status(400).json({
        message:
          "Invalid student ID"
      });
    }


    const {
      grade_level,
      parent_id,
      section,
      enrollment_status
    } = req.body || {};


    /*
     * REQUIRED FIELDS
     */

    if (
      !grade_level ||
      !section ||
      !enrollment_status
    ) {
      return res.status(400).json({
        message:
          "grade_level, section, and enrollment_status are required"
      });
    }


    /*
     * NORMALIZE PARENT ID
     */

    let numericParentId = null;

    if (
      parent_id !== null &&
      parent_id !== undefined &&
      String(parent_id).trim() !== ""
    ) {
      numericParentId =
        Number(parent_id);

      if (
        !Number.isInteger(
          numericParentId
        ) ||
        numericParentId <= 0
      ) {
        return res.status(400).json({
          message:
            "Invalid parent_id"
        });
      }
    }


    /*
     * CHECK STUDENT
     */

    const checkStudentSql = `
      SELECT
        student_id,
        user_id
      FROM students
      WHERE student_id = ?
    `;

    db.query(
      checkStudentSql,
      [studentId],
      (
        checkErr,
        studentResults
      ) => {

        if (checkErr) {
          console.error(
            "MySQL Error:",
            checkErr
          );

          return res.status(500).json({
            message:
              "Failed to verify student",
            error:
              checkErr.message
          });
        }


        if (
          studentResults.length ===
          0
        ) {
          return res.status(404).json({
            message:
              "Student not found"
          });
        }


        const student =
          studentResults[0];


        /*
         * STUDENT OWNERSHIP
         */

        if (
          req.user.role ===
            "student" &&
          student.user_id !==
            req.user.id
        ) {
          return res.status(403).json({
            message:
              "You do not have permission to update this student"
          });
        }


        /*
         * CHECK PARENT
         */

        const continueUpdate =
          () => {

            const updateSql = `
              UPDATE students
              SET
                grade_level = ?,
                parent_id = ?,
                section = ?,
                enrollment_status = ?
              WHERE student_id = ?
            `;


            db.query(
              updateSql,
              [
                String(
                  grade_level
                ).trim(),

                numericParentId,

                String(
                  section
                ).trim(),

                String(
                  enrollment_status
                ).trim(),

                studentId
              ],
              (
                updateErr,
                result
              ) => {

                if (updateErr) {
                  console.error(
                    "MySQL Error:",
                    updateErr
                  );

                  return res.status(500).json({
                    message:
                      "Failed to update student",
                    error:
                      updateErr.message
                  });
                }


                if (
                  result.affectedRows ===
                  0
                ) {
                  return res.status(404).json({
                    message:
                      "Student not found"
                  });
                }


                /*
                 * AUDIT LOG
                 */

                logAudit(
                  req.user.id,
                  "UPDATE",
                  "students",
                  studentId,
                  "Updated student information"
                );


                res.json({
                  message:
                    "Student updated successfully"
                });

              }
            );

          };


        if (
          numericParentId
        ) {

          const checkParentSql = `
            SELECT
              parent_id
            FROM parents
            WHERE parent_id = ?
          `;

          db.query(
            checkParentSql,
            [numericParentId],
            (
              parentErr,
              parentResults
            ) => {

              if (parentErr) {
                console.error(
                  "MySQL Error:",
                  parentErr
                );

                return res.status(500).json({
                  message:
                    "Failed to verify parent",
                  error:
                    parentErr.message
                });
              }


              if (
                parentResults.length ===
                0
              ) {
                return res.status(404).json({
                  message:
                    "Parent not found"
                });
              }


              continueUpdate();

            }
          );

        } else {

          continueUpdate();

        }

      }
    );
  }
);


/* =========================================================
   DELETE STUDENT
   Permission: DELETE
   ========================================================= */

router.delete(
  "/:id",
  permissionMiddleware(
    "students",
    "delete"
  ),
  (req, res) => {

    const studentId =
      Number(req.params.id);


    if (
      !Number.isInteger(
        studentId
      ) ||
      studentId <= 0
    ) {
      return res.status(400).json({
        message:
          "Invalid student ID"
      });
    }


    /*
     * CHECK STUDENT EXISTS
     */

    const checkStudentSql = `
      SELECT
        student_id,
        user_id
      FROM students
      WHERE student_id = ?
    `;


    db.query(
      checkStudentSql,
      [studentId],
      (
        checkErr,
        studentResults
      ) => {

        if (checkErr) {
          console.error(
            "MySQL Error:",
            checkErr
          );

          return res.status(500).json({
            message:
              "Failed to verify student",
            error:
              checkErr.message
          });
        }


        if (
          studentResults.length ===
          0
        ) {
          return res.status(404).json({
            message:
              "Student not found"
          });
        }


        /*
         * DELETE STUDENT
         */

        const deleteSql = `
          DELETE FROM students
          WHERE student_id = ?
        `;


        db.query(
          deleteSql,
          [studentId],
          (
            deleteErr,
            result
          ) => {

            if (deleteErr) {

              console.error(
                "MySQL Error:",
                deleteErr
              );


              /*
               * FOREIGN KEY PROTECTION
               */

              if (
                deleteErr.code ===
                  "ER_ROW_IS_REFERENCED_2" ||
                deleteErr.code ===
                  "ER_ROW_IS_REFERENCED"
              ) {

                return res.status(409).json({
                  message:
                    "Cannot delete this student because related records still exist."
                });

              }


              return res.status(500).json({
                message:
                  "Failed to delete student",
                error:
                  deleteErr.message
              });

            }


            if (
              result.affectedRows ===
              0
            ) {

              return res.status(404).json({
                message:
                  "Student not found"
              });

            }


            /*
             * AUDIT LOG
             */

            logAudit(
              req.user.id,
              "DELETE",
              "students",
              studentId,
              "Deleted student"
            );


            res.json({
              message:
                "Student deleted successfully"
            });

          }
        );

      }
    );
  }
);


module.exports = router;