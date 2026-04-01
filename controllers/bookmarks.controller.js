const db = require('../config/db')

const toggleBookmark = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.userId

    const [existing] = await db.query(
      'SELECT * FROM bookmarks WHERE user_id = ? AND note_id = ?',
      [userId, id]
    )

    if (existing.length > 0) {
      await db.query(
        'DELETE FROM bookmarks WHERE user_id = ? AND note_id = ?',
        [userId, id]
      )
      return res.status(200).json({ message: 'Bookmark removed', bookmarked: false })
    } else {
      await db.query(
        'INSERT INTO bookmarks (user_id, note_id) VALUES (?, ?)',
        [userId, id]
      )
      return res.status(200).json({ message: 'Bookmarked successfully', bookmarked: true })
    }

  } catch (error) {
    console.error('Bookmark error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

const getBookmarks = async (req, res) => {
  try {
    const userId = req.user.userId

    const [notes] = await db.query(
      `SELECT n.*, u.name as uploader_name, b.created_at as bookmarked_at
       FROM bookmarks b
       JOIN notes n ON b.note_id = n.note_id
       JOIN users u ON n.uploaded_by = u.user_id
       WHERE b.user_id = ? AND n.status = 'approved'
       ORDER BY b.created_at DESC`,
      [userId]
    )

    res.status(200).json({ notes })

  } catch (error) {
    console.error('Get bookmarks error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

const checkBookmark = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.userId

    const [existing] = await db.query(
      'SELECT * FROM bookmarks WHERE user_id = ? AND note_id = ?',
      [userId, id]
    )

    res.status(200).json({ bookmarked: existing.length > 0 })

  } catch (error) {
    console.error('Check bookmark error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

module.exports = { toggleBookmark, getBookmarks, checkBookmark }