const permissions = {

  // =========================
  // ADMIN
  // =========================
  admin: {

    users: ["read", "create", "update", "delete"],
    students: ["read", "create", "update", "delete"],
    parents: ["read", "create", "update", "delete"],
    academic_records: ["read", "create", "update", "delete"],
    academic_area: ["read", "create", "update", "delete"],
    attendance: ["read", "create", "update", "delete"],
    tasks: ["read", "create", "update", "delete"],
    documents: ["read", "create", "update", "delete"],
    health: ["read", "create", "update", "delete"],
    communication: ["read", "create", "update", "delete"],
    risk_alerts: ["read", "create", "update", "delete"],
    announcements: ["read", "create", "update", "delete"],
    audit_logs: ["read"]

  },


  // =========================
  // PRINCIPAL
  // =========================
  principal: {

    users: ["read"],
    students: ["read"],
    parents: ["read"],
    academic_records: ["read", "update"],
    academic_area: ["read", "create", "update", "delete"],
    attendance: ["read"],
    tasks: ["read"],
    documents: ["read", "update"],
    health: ["read"],
    communication: ["read", "create"],
    risk_alerts: ["read", "update"],
    announcements: ["read", "create", "update", "delete"],
    audit_logs: ["read"]

  },


  // =========================
  // DEPARTMENT HEAD
  // =========================
  department_head: {

    students: ["read"],
    parents: ["read"],
    academic_records: ["read", "create", "update"],
    academic_area: ["read", "create", "update", "delete"],
    attendance: ["read"],
    tasks: ["read", "create", "update"],
    documents: ["read", "update"],
    health: ["read"],
    communication: ["read", "create"],
    risk_alerts: ["read", "create", "update"],
    announcements: ["read", "create", "update"],
    audit_logs: ["read"]

  },


  // =========================
  // REGISTRAR
  // =========================
  registrar: {

    students: ["read", "create", "update", "delete"],
    parents: ["read", "create", "update", "delete"],
    academic_records: ["read", "create", "update"],
    academic_area: ["read", "create", "update", "delete"],
    attendance: ["read"],
    tasks: ["read"],
    documents: ["read", "create", "update", "delete"],
    communication: ["read", "create"],
    announcements: ["read", "create"],
    audit_logs: ["read"]

  },


  // =========================
  // TEACHER
  // =========================
  teacher: {

    students: ["read"],
    parents: ["read"],
    academic_records: ["read", "create", "update"],
    academic_area: ["read"],
    attendance: ["read", "create", "update"],
    tasks: ["read", "create", "update", "delete"],
    documents: ["read", "create", "update"],
    health: ["read", "create", "update"],
    communication: ["read", "create", "update"],
    risk_alerts: ["read", "create", "update"],
    announcements: ["read", "create"],
    audit_logs: ["read"]

  },


  // =========================
  // STUDENT
  // =========================
  student: {

    students: ["read"],
    parents: ["read"],
    academic_records: ["read"],
    academic_area: ["read"],
    attendance: ["read"],
    tasks: ["read"],
    documents: ["read"],
    health: ["read"],
    communication: ["read", "create"],
    risk_alerts: ["read"],
    announcements: ["read"]

  },


  // =========================
  // PARENT
  // =========================
  parent: {

    students: ["read"],
    academic_records: ["read"],
    academic_area: ["read"],
    attendance: ["read"],
    tasks: ["read"],
    documents: ["read"],
    health: ["read"],
    communication: ["read", "create"],
    risk_alerts: ["read"],
    announcements: ["read"]

  }

};


module.exports = permissions;