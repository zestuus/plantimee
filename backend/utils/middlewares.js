const jwt = require('jsonwebtoken');

const { TOKEN_SECRET } = require('../constants/config');

function privateRoute(req, res, next) {
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).send("Access denied!");
  }

  const token = authorization.split(' ')[1];

  if(!token) {
    res.status(401).send('Access denied!');
  }

  try {
    req.user = jwt.verify(token, TOKEN_SECRET);
    next();
  } catch {
    res.status(403).send('Invalid token!');
  }
}

module.exports = { privateRoute };