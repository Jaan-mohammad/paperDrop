const db = require('../config/db')
const { cloudinary } = require('../config/cloudinary')

// ─────────────────────────────────────────
// GET ALL PENDING NOTES
const getPendingNotes = async (req, res) => {
  try {
    const [notes] = await db.query(
      `SELECT n.*, u.name as uploader_name, u.email as uploader_email
       FROM notes n
       JOIN users u ON n.uploaded_by = u.user_id
       WHERE n.status = 'pending'
       ORDER BY n.created_at DESC`
    )
    res.status(200).json({ notes })
  } catch (error) {
    console.error('Get pending notes error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// ─────────────────────────────────────────
// GET ALL NOTES (admin view)
const getAllNotesAdmin = async (req, res) => {
  try {
    const [notes] = await db.query(
      `SELECT n.*, u.name as uploader_name, u.email as uploader_email
       FROM notes n
       JOIN users u ON n.uploaded_by = u.user_id
       ORDER BY n.created_at DESC`
    )
    res.status(200).json({ notes })
  } catch (error) {
    console.error('Get all notes error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// ─────────────────────────────────────────
// APPROVE NOTE
const approveNote = async (req, res) => {
  try {
    const { id } = req.params

    const [notes] = await db.query(
      'SELECT * FROM notes WHERE note_id = ?', [id]
    )

    if (notes.length === 0) {
      return res.status(404).json({ message: 'Note not found' })
    }

    await db.query(
      'UPDATE notes SET status = ? WHERE note_id = ?',
      ['approved', id]
    )

    res.status(200).json({ message: 'Note approved successfully' })
  } catch (error) {
    console.error('Approve note error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// ─────────────────────────────────────────
// REJECT NOTE
const rejectNote = async (req, res) => {
  try {
    const { id } = req.params

    const [notes] = await db.query(
      'SELECT * FROM notes WHERE note_id = ?', [id]
    )

    if (notes.length === 0) {
      return res.status(404).json({ message: 'Note not found' })
    }

    await db.query(
      'UPDATE notes SET status = ? WHERE note_id = ?',
      ['rejected', id]
    )

    res.status(200).json({ message: 'Note rejected' })
  } catch (error) {
    console.error('Reject note error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// ─────────────────────────────────────────
// DELETE NOTE (admin)
const deleteNoteAdmin = async (req, res) => {
  try {
    const { id } = req.params

    const [notes] = await db.query(
      'SELECT * FROM notes WHERE note_id = ?', [id]
    )

    if (notes.length === 0) {
      return res.status(404).json({ message: 'Note not found' })
    }

    // Delete from Cloudinary
    const fileUrl = notes[0].file_url
    const urlParts = fileUrl.split('/upload/')
    const publicId = urlParts[1].replace(/v\d+\//, '').split('.')[0]

    await cloudinary.uploader.destroy(
      publicId,
      { resource_type: 'raw' }
    )

    await db.query('DELETE FROM notes WHERE note_id = ?', [id])

    res.status(200).json({ message: 'Note deleted successfully' })
  } catch (error) {
    console.error('Delete note error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// ─────────────────────────────────────────
// GET ALL USERS
const getAllUsers = async (req, res) => {
  try {
    const [users] = await db.query(
      `SELECT user_id, name, email, role, created_at 
       FROM users 
       ORDER BY created_at DESC`
    )
    res.status(200).json({ users })
  } catch (error) {
    console.error('Get users error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// ─────────────────────────────────────────
// DELETE USER
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params
    const adminId = req.user.userId

    // Prevent admin from deleting themselves
    if (parseInt(id) === adminId) {
      return res.status(400).json({ 
        message: 'You cannot delete your own account' 
      })
    }

    const [users] = await db.query(
      'SELECT * FROM users WHERE user_id = ?', [id]
    )

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' })
    }

    await db.query('DELETE FROM users WHERE user_id = ?', [id])

    res.status(200).json({ message: 'User deleted successfully' })
  } catch (error) {
    console.error('Delete user error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

module.exports = {
  getPendingNotes,
  approveNote,
  rejectNote,
  getAllUsers,
  deleteUser,
  getAllNotesAdmin,
  deleteNoteAdmin
}