const jwt = require("jsonwebtoken");

const authenticate = (req, res, next) => {
  const authenticationToken = req.cookies["authenticationToken"];
  if (!authenticationToken) {
    return res.status(401).send("Invalid authentication token.");
  }
  try {
    const payload = jwt.verify(authenticationToken, process.env.JWT_SECRET_STRING);
    req.payload = payload;
  } catch (err) {
    return res.status(401).send("Invalid authentication token.");
  }
  next();
};
module.exports = authenticate;
