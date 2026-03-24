// 1. import jwt
const jwt = require('jsonwebtoken')

// ─────────────────────────────────────────
// VERIFY TOKEN
const verifyToken = (req, res, next) => {
  try {
    // Check header first, then query param
    const authHeader = req.headers['authorization']
    const queryToken = req.query.token

    let token = null

    if (authHeader) {
      token = authHeader.split(' ')[1]
    } else if (queryToken) {
      token = queryToken
    }

    if (!token) {
      return res.status(401).json({ message: 'No token provided' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    next()

  } catch (error) {
    return res.status(401).json({ message: 'Token is invalid or expired' })
  }
}


// ─────────────────────────────────────────
// VERIFY ADMIN
const verifyAdmin = (req, res, next) => {
  // runs after verifyToken so req.user already exists
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access only' })
  }
  next()
}

module.exports = { verifyToken, verifyAdmin }