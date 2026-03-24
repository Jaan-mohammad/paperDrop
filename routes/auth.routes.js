// 1. Import express
const express = require('express')

// 2. Create a router
const router = express.Router()

// 3. Import controller functions (we'll write these next)
const { register, login, getMe } = require('../controllers/auth.controller')

// 4. Import auth middleware (we'll write this later today)
const { verifyToken } = require('../middleware/auth.middleware')

// 5. Define routes
router.post('/register', register)
router.post('/login', login)
router.get('/me', verifyToken, getMe)

// 6. Export router
module.exports = router