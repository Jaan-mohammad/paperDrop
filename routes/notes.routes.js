const express = require('express')
const router = express.Router()
const { uploadNote, getAllNotes, getNoteById, deleteNote, downloadNote, streamDownload, getUserStats, getMyUploads } = require('../controllers/notes.controller')
const { verifyToken } = require('../middleware/auth.middleware')
const { upload } = require('../config/cloudinary')

// All routes require login
router.post('/upload', verifyToken, upload.single('file'), uploadNote)
router.get('/', getAllNotes)
router.get('/:id', getNoteById)
router.delete('/:id', verifyToken, deleteNote)
router.post('/:id/download', verifyToken, downloadNote)
router.get('/:id/download', verifyToken, streamDownload)
router.get('/my/stats', verifyToken, getUserStats)
router.get('/my/uploads', verifyToken, getMyUploads)


module.exports = router