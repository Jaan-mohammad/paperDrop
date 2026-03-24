const express = require('express')
const router = express.Router()
const {
  getPendingNotes,
  approveNote,
  rejectNote,
  getAllUsers,
  deleteUser,
  getAllNotesAdmin,
  deleteNoteAdmin
} = require('../controllers/admin.controller')
const { verifyToken, verifyAdmin } = require('../middleware/auth.middleware')

// All admin routes are protected by both middlewares
router.use(verifyToken, verifyAdmin)

// Notes management
router.get('/notes/pending', getPendingNotes)
router.get('/notes', getAllNotesAdmin)
router.put('/notes/:id/approve', approveNote)
router.put('/notes/:id/reject', rejectNote)
router.delete('/notes/:id', deleteNoteAdmin)

// Users management
router.get('/users', getAllUsers)
router.delete('/users/:id', deleteUser)

module.exports = router