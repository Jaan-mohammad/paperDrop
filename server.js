// Import routes
const express = require('express')
const dotenv = require('dotenv')
const cors = require('cors')
const path = require('path')


dotenv.config()

// Import db connection
const db = require('./config/db')

// Import routes
const authRoutes = require('./routes/auth.routes')
const notesRoutes = require('./routes/notes.routes')
const adminRoutes = require('./routes/admin.routes')
const bookmarkRoutes = require('./routes/bookmark.routes')

const app = express()

// Middlware 
app.use(express.json())
app.use(cors())

// Server frontend
app.use(express.static(path.join(__dirname, 'public')))

// Routers
app.use('/api/auth', authRoutes)
app.use('/api/notes', notesRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/bookmarks', bookmarkRoutes)


// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'paperDrop server is running' })
})

// Test DB connection
db.query('SELECT 1')
  .then(() => console.log('Database connected successfully'))
  .catch((err) => console.log('Database connection failed:', err));

// Start server
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
});


// Keep alive — prevents Railway from sleeping
const https = require('https')

setInterval(() => {
  https.get('https://paperdrop-production.up.railway.app/api/test', (res) => {
    console.log('Keep alive ping:', res.statusCode)
  }).on('error', (err) => {
    console.log('Keep alive error:', err.message)
  })
}, 25 * 60 * 1000) // ping every 25 minutes
