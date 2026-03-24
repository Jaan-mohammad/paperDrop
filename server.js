// Import routes
const express = require('express')
const dotenv = require('dotenv')
const cors = require('cors')
const path = require('path')
const adminRoutes = require('./routes/admin.routes')


dotenv.config()

// Import db connection
const db = require('./config/db')

// Import routes
const authRoutes = require('./routes/auth.routes')
const notesRoutes = require('./routes/notes.routes')

const app = express()

// Mount routes
app.use(express.json())
app.use(cors())
app.use(express.static(path.join(__dirname, 'public')))
app.use('/api/auth', authRoutes)
app.use('/api/notes', notesRoutes)
// Mount routes for Admin
app.use('/api/auth', authRoutes)
app.use('/api/notes', notesRoutes)
app.use('/api/admin', adminRoutes)

// Test db connection
db.query('SELECT 1')
  .then(() => console.log('Database connected successfully'))
  .catch((err) => console.log('Database connection failed:', err))

// Mount routes
app.use('/api/auth', authRoutes)

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'paperDrop server is running' })
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

