const express = require('express')
const router = express.Router()
const { toggleBookmark, getBookmarks, checkBookmark } = require('../controllers/bookmarks.controller')
const { verifyToken } = require('../middleware/auth.middleware')

router.use(verifyToken)

router.post('/:id', toggleBookmark)
router.get('/', getBookmarks)
router.get('/check/:id', checkBookmark)

module.exports = router