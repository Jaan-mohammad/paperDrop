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

