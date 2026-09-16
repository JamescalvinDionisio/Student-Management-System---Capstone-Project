const permissions = require("./permissions");

const permissionMiddleware = (module, action) => {
  return (req, res, next) => {
    // Check kung authenticated ang user
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        message: "Unauthorized"
      });
    }

    const role = req.user.role;

    // Check kung existing ang role
    if (!permissions[role]) {
      return res.status(403).json({
        message: "Invalid user role"
      });
    }

    // Check kung existing ang module
    if (!permissions[role][module]) {
      return res.status(403).json({
        message: "Access denied"
      });
    }

    // Check kung may permission ang role sa action
    if (!permissions[role][module].includes(action)) {
      return res.status(403).json({
        message: "You do not have permission to perform this action"
      });
    }

    next();
  };
};

module.exports = permissionMiddleware;