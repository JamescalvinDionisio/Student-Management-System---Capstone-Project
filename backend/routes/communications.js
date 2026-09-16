const express = require("express");
const db = require("../db");
const permissionMiddleware = require("../middleware/permissionMiddleware");
const logAudit = require("../middleware/auditLogger");

const router = express.Router();


// =====================================================
// GET - View communications
// =====================================================
router.get(
  "/",
  permissionMiddleware("communication", "read"),
  (req, res) => {

    let sql;
    let params = [];

    // STUDENT / PARENT:
    // Only view messages where they are sender or receiver
    if (
      req.user.role === "student" ||
      req.user.role === "parent"
    ) {

      sql = `
        SELECT
          communication_id,
          sender_id,
          receiver_id,
          subject,
          message,
          status,
          created_at
        FROM communications
        WHERE sender_id = ?
           OR receiver_id = ?
        ORDER BY created_at DESC
      `;

      params = [req.user.id, req.user.id];

    } else {

      // ADMIN / TEACHER / OTHER AUTHORIZED ROLES
      // Can view all communications according to permission
      sql = `
        SELECT
          communication_id,
          sender_id,
          receiver_id,
          subject,
          message,
          status,
          created_at
        FROM communications
        ORDER BY created_at DESC
      `;
    }

    db.query(sql, params, (err, results) => {

      if (err) {
        console.error("MySQL Error:", err);

        return res.status(500).json({
          message: "Failed to fetch communications",
          error: err.message
        });
      }

      res.json(results);
    });
  }
);


// =====================================================
// POST - Send message
// =====================================================
router.post(
  "/",
  permissionMiddleware("communication", "create"),
  (req, res) => {

    const {
      sender_id,
      receiver_id,
      subject,
      message
    } = req.body || {};


    // Required fields
    if (!sender_id || !receiver_id || !message) {
      return res.status(400).json({
        message:
          "sender_id, receiver_id, and message are required"
      });
    }


    // =================================================
    // STUDENT / PARENT SECURITY
    // They cannot pretend to be another sender.
    // =================================================
    if (
      req.user.role === "student" ||
      req.user.role === "parent"
    ) {

      if (Number(sender_id) !== Number(req.user.id)) {

        return res.status(403).json({
          message:
            "You can only send a message using your own account"
        });
      }
    }


    // =================================================
    // CHECK RECEIVER EXISTS
    // =================================================
    const checkReceiverSql = `
      SELECT id
      FROM users
      WHERE id = ?
    `;

    db.query(
      checkReceiverSql,
      [receiver_id],
      (err, receiverResults) => {

        if (err) {
          console.error("MySQL Error:", err);

          return res.status(500).json({
            message: "Database error",
            error: err.message
          });
        }


        if (receiverResults.length === 0) {

          return res.status(404).json({
            message: "Receiver not found"
          });
        }


        // =================================================
        // INSERT COMMUNICATION
        // =================================================
        const sql = `
          INSERT INTO communications
          (sender_id, receiver_id, subject, message)
          VALUES (?, ?, ?, ?)
        `;

        db.query(
          sql,
          [
            sender_id,
            receiver_id,
            subject || null,
            message
          ],
          (err, result) => {

            if (err) {
              console.error("MySQL Error:", err);

              return res.status(500).json({
                message: "Failed to send message",
                error: err.message
              });
            }


            // CREATE AUDIT LOG
            logAudit(
              req.user.id,
              "CREATE",
              "communication",
              result.insertId,
              "Created new communication"
            );


            res.status(201).json({
              message: "Message sent successfully",
              communication_id: result.insertId
            });
          }
        );
      }
    );
  }
);


// =====================================================
// PUT - Update message status
// =====================================================
router.put(
  "/:id",
  permissionMiddleware("communication", "update"),
  (req, res) => {

    const communicationId = req.params.id;
    const { status } = req.body || {};


    if (!status) {
      return res.status(400).json({
        message: "status is required"
      });
    }


    const sql = `
      UPDATE communications
      SET status = ?
      WHERE communication_id = ?
    `;

    db.query(
      sql,
      [status, communicationId],
      (err, result) => {

        if (err) {
          console.error("MySQL Error:", err);

          return res.status(500).json({
            message: "Failed to update message",
            error: err.message
          });
        }


        if (result.affectedRows === 0) {

          return res.status(404).json({
            message: "Message not found"
          });
        }


        // UPDATE AUDIT LOG
        logAudit(
          req.user.id,
          "UPDATE",
          "communication",
          communicationId,
          "Updated communication status"
        );


        res.json({
          message: "Message status updated successfully"
        });
      }
    );
  }
);


// =====================================================
// DELETE - Delete message
// =====================================================
router.delete(
  "/:id",
  permissionMiddleware("communication", "delete"),
  (req, res) => {

    const communicationId = req.params.id;

    const sql = `
      DELETE FROM communications
      WHERE communication_id = ?
    `;

    db.query(
      sql,
      [communicationId],
      (err, result) => {

        if (err) {
          console.error("MySQL Error:", err);

          return res.status(500).json({
            message: "Failed to delete message",
            error: err.message
          });
        }


        if (result.affectedRows === 0) {

          return res.status(404).json({
            message: "Message not found"
          });
        }


        // DELETE AUDIT LOG
        logAudit(
          req.user.id,
          "DELETE",
          "communication",
          communicationId,
          "Deleted communication"
        );


        res.json({
          message: "Message deleted successfully"
        });
      }
    );
  }
);


module.exports = router;