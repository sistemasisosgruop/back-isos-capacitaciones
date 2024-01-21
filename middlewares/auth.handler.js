const boom = require("@hapi/boom");

const { config } = require("./../config/config");

function checkApiKey(req, res, next) {
  const apiKey = req.headers["api"];
  if (apiKey === config.apiKey) {
    next();
  } else {
    next(boom.unauthorized());
  }
}

function checkWorkRol(req, res, next) {
  const user = req.user;
  if (user.role === "Supervisor") {
    next();
  } else if (user.role === "Trabajador") {
    next();
  } else {
    next(boom.unauthorized());
  }
}
function checkRoles(...roles) {
  return (req, res, next) => {
    const user = req.user;
    if (roles.includes(user.role)) {
      next();
    } else {
      next(boom.unauthorized());
    }
  };
}

module.exports = { checkApiKey, checkWorkRol };
