const db = require("../db");

const logAudit = (
  userId,
  action,
  module,
  recordId = null,
  description = null
) => {
  const sql = `
    INSERT INTO audit_logs
    (user_id, action, module, record_id, description)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [userId, action, module, recordId, description],
    (err) => {
      if (err) {
        console.error("❌ Audit Log Error:", err.message);
        return;
      }

      console.log("✅ Audit log created");
    }
  );
};

module.exports = logAudit;