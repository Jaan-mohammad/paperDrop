const db = require("../config/db");
const { cloudinary } = require("../config/cloudinary");

// ─────────────────────────────────────────
// UPLOAD NOTE
const uploadNote = async (req, res) => {
  try {
    // 1. Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // 2. Get metadata from request body
    const { title, subject, semester, description } = req.body;

    // 3. Validate required fields
    if (!title || !subject || !semester) {
      return res
        .status(400)
        .json({ message: "Title, subject and semester are required" });
    }

    // 4. Get file URL from Cloudinary
    // After multer-storage-cloudinary runs, file info is in req.file
    const file_url = req.file.path;

    // 5. Get logged in user's id from token
    const uploaded_by = req.user.userId;

    // 6. Save to database
    const [result] = await db.query(
      `INSERT INTO notes 
        (title, subject, semester, description, file_url, uploaded_by) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [title, subject, semester, description, file_url, uploaded_by],
    );

    res.status(201).json({
      message: "Note uploaded successfully. Pending admin approval.",
      noteId: result.insertId,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ─────────────────────────────────────────
// GET ALL APPROVED NOTES
const getAllNotes = async (req, res) => {
  try {
    // Get query params for search and filter
    const { subject, semester, search, sort } = req.query;

    // Start building the query
    let query = `
      SELECT n.*, u.name as uploader_name 
      FROM notes n 
      JOIN users u ON n.uploaded_by = u.user_id
      WHERE n.status = 'approved'
    `;
    const params = [];

    // Add filters dynamically
    if (subject) {
      query += " AND n.subject = ?";
      params.push(subject);
    }

    if (semester) {
      query += " AND n.semester = ?";
      params.push(semester);
    }

    if (search) {
      query += " AND (n.title LIKE ? OR n.description LIKE ?)";
      params.push(`%${search}%`, `%${search}%`);
    }

    // Add sorting
    if (sort === "popular") {
      query += " ORDER BY n.downloads DESC";
    } else {
      query += " ORDER BY n.created_at DESC";
    }

    const [notes] = await db.query(query, params);

    res.status(200).json({ notes });
  } catch (error) {
    console.error("Get notes error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ─────────────────────────────────────────
// GET SINGLE NOTE
const getNoteById = async (req, res) => {
  try {
    const { id } = req.params;

    const [notes] = await db.query(
      `SELECT n.*, u.name as uploader_name 
       FROM notes n 
       JOIN users u ON n.uploaded_by = u.user_id
       WHERE n.note_id = ? AND n.status = 'approved'`,
      [id],
    );

    if (notes.length === 0) {
      return res.status(404).json({ message: "Note not found" });
    }

    res.status(200).json({ note: notes[0] });
  } catch (error) {
    console.error("Get note error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ─────────────────────────────────────────
// DELETE NOTE
const deleteNote = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const userRole = req.user.role;

    // Check note exists and belongs to this user
    const [notes] = await db.query("SELECT * FROM notes WHERE note_id = ?", [
      id,
    ]);

    if (notes.length === 0) {
      return res.status(404).json({ message: "Note not found" });
    }

    // Allow owner OR admin to delete
    if (notes[0].uploaded_by !== userId && userRole !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Extract public_id from Cloudinary URL
    const fileUrl = notes[0].file_url;
    const publicId = fileUrl.split("/").pop().split(".")[0];

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(`paperdrop/${publicId}`, {
      resource_type: "raw",
    });

    await db.query("DELETE FROM notes WHERE note_id = ?", [id]);

    res.status(200).json({ message: "Note deleted successfully" });
  } catch (error) {
    console.error("Delete note error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ─────────────────────────────────────────
// INCREMENT DOWNLOAD COUNTER
const downloadNote = async (req, res) => {
  try {
    const { id } = req.params;

    await db.query(
      "UPDATE notes SET downloads = downloads + 1 WHERE note_id = ?",
      [id],
    );

    res.status(200).json({ message: "Download counted" });
  } catch (error) {
    console.error("Download counter error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ─────────────────────────────────────────
// STREAM DOWNLOAD THROUGH BACKEND
const streamDownload = async (req, res) => {
  try {
    const { id } = req.params;

    const [notes] = await db.query(
      "SELECT * FROM notes WHERE note_id = ? AND status = ?",
      [id, "approved"],
    );

    if (notes.length === 0) {
      return res.status(404).json({ message: "Note not found" });
    }

    const note = notes[0];

    // Increment counter
    await db.query(
      "UPDATE notes SET downloads = downloads + 1 WHERE note_id = ?",
      [id],
    );
    await db.query("INSERT INTO downloads (user_id, note_id) VALUES (?, ?)", [
      req.user.userId,
      id,
    ]);

    // Extract public_id
    const urlParts = note.file_url.split("/upload/");
    const publicIdWithVersion = urlParts[1].replace(/v\d+\//, "");

    // Generate signed URL
    const signedUrl = cloudinary.url(publicIdWithVersion, {
      resource_type: "raw",
      sign_url: true,
      secure: true,
      expires_at: Math.floor(Date.now() / 1000) + 300,
      attachment: true,
    });

    // Just redirect — don't stream
    res.redirect(signedUrl);
  } catch (error) {
    res.status(500).json({ message: "Download failed" });
  }
};

// ─────────────────────────────────────────
// GET USER STATS
const getUserStats = async (req, res) => {
  try {
    const userId = req.user.userId

    const [uploadCount] = await db.query(
      'SELECT COUNT(*) as count FROM notes WHERE uploaded_by = ?',
      [userId]
    )

    const [downloadCount] = await db.query(
      'SELECT SUM(downloads) as total FROM notes WHERE uploaded_by = ?',
      [userId]
    )

    const [totalNotes] = await db.query(
      "SELECT COUNT(*) as count FROM notes WHERE status = 'approved'"
    )

    const [bookmarkCount] = await db.query(
      'SELECT COUNT(*) as count FROM bookmarks WHERE user_id = ?',
      [userId]
    )

    const [downloadHistory] = await db.query(
      'SELECT COUNT(*) as count FROM downloads WHERE user_id = ?',
      [userId]
    )

    res.status(200).json({
      myUploads: uploadCount[0].count,
      myDownloads: downloadCount[0].total || 0,
      totalNotes: totalNotes[0].count,
      myBookmarks: bookmarkCount[0].count,
      downloadHistory: downloadHistory[0].count
    })

  } catch (error) {
    console.error('Stats error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// ─────────────────────────────────────────
// GET MY UPLOADS
const getMyUploads = async (req, res) => {
  try {
    const userId = req.user.userId;

    const [notes] = await db.query(
      `SELECT * FROM notes 
       WHERE uploaded_by = ? 
       ORDER BY created_at DESC`,
      [userId],
    );

    res.status(200).json({ notes });
  } catch (error) {
    console.error("My uploads error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  uploadNote,
  getAllNotes,
  getNoteById,
  deleteNote,
  downloadNote,
  streamDownload,
  getUserStats,
  getMyUploads,
};
