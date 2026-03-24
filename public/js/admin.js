// Auth guard — admin only
const token = localStorage.getItem('token')
const user = JSON.parse(localStorage.getItem('user'))

if (!token || !user) {
  window.location.href = '/login.html'
}

if (user.role !== 'admin') {
  window.location.href = '/dashboard.html'
}

// Logout
document.getElementById('logoutBtn').addEventListener('click', () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  window.location.href = '/login.html'
})

// ─────────────────────────────────────────
// HEADERS HELPER
const authHeaders = {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}

// ─────────────────────────────────────────
// TAB SWITCHING
function switchTab(tab) {
  // Hide all tabs
  document.getElementById('pendingTab').style.display = 'none'
  document.getElementById('allTab').style.display = 'none'
  document.getElementById('usersTab').style.display = 'none'

  // Reset all buttons
  document.getElementById('tabPending').className = 'btn-glass-outline'
  document.getElementById('tabAll').className = 'btn-glass-outline'
  document.getElementById('tabUsers').className = 'btn-glass-outline'

  // Show selected tab
  document.getElementById(`${tab}Tab`).style.display = 'block'
  document.getElementById(`tab${tab.charAt(0).toUpperCase() + tab.slice(1)}`).className = 'btn-glass'

  // Load data
  if (tab === 'pending') loadPendingNotes()
  if (tab === 'all') loadAllNotes()
  if (tab === 'users') loadUsers()
}

// ─────────────────────────────────────────
// LOAD STATS
async function loadStats() {
  try {
    const [pendingRes, allRes, usersRes] = await Promise.all([
      fetch('/api/admin/notes/pending', { headers: authHeaders }),
      fetch('/api/admin/notes', { headers: authHeaders }),
      fetch('/api/admin/users', { headers: authHeaders })
    ])

    const pendingData = await pendingRes.json()
    const allData = await allRes.json()
    const usersData = await usersRes.json()

    document.getElementById('statPending').textContent =
      pendingData.notes.length
    document.getElementById('statTotal').textContent =
      allData.notes.length
    document.getElementById('statUsers').textContent =
      usersData.users.length
    document.getElementById('statApproved').textContent =
      allData.notes.filter(n => n.status === 'approved').length

  } catch (error) {
    console.error('Stats error:', error)
  }
}

// ─────────────────────────────────────────
// LOAD PENDING NOTES
async function loadPendingNotes() {
  try {
    const response = await fetch('/api/admin/notes/pending', {
      headers: authHeaders
    })
    const data = await response.json()
    const notes = data.notes
    const list = document.getElementById('pendingList')
    const empty = document.getElementById('pendingEmpty')

    if (notes.length === 0) {
      list.innerHTML = ''
      empty.style.display = 'block'
      return
    }

    empty.style.display = 'none'
    list.innerHTML = notes.map(note => `
      <div class="glass-card mb-3" id="note-${note.note_id}">
        <div class="row align-items-center">
          <div class="col-12 col-md-7">
            <p style="font-weight:600; margin:0;">${note.title}</p>
            <p style="font-size:0.8rem;
              color:var(--text-secondary); margin:0.25rem 0;">
              ${note.subject} • Semester ${note.semester}
            </p>
            <p style="font-size:0.78rem; color:var(--text-muted); margin:0;">
              By ${note.uploader_name} (${note.uploader_email})
            </p>
          </div>
          <div class="col-12 col-md-5 mt-3 mt-md-0">
            <div class="d-flex gap-2 justify-content-md-end">
              <button
                onclick="approveNote(${note.note_id})"
                class="btn-glass"
                style="width:auto;
                  padding:0.4rem 1rem;
                  background:#51cf66;
                  font-size:0.85rem;">
                ✅ Approve
              </button>
              <button
                onclick="rejectNote(${note.note_id})"
                class="btn-glass-outline"
                style="padding:0.4rem 1rem;
                  border-color:#ff6b6b;
                  color:#ff6b6b;
                  font-size:0.85rem;">
                ❌ Reject
              </button>
            </div>
          </div>
        </div>
      </div>
    `).join('')

  } catch (error) {
    console.error('Load pending error:', error)
  }
}

// ─────────────────────────────────────────
// LOAD ALL NOTES
// ─────────────────────────────────────────
async function loadAllNotes() {
  try {
    const response = await fetch('/api/admin/notes', {
      headers: authHeaders
    })
    const data = await response.json()
    const list = document.getElementById('allNotesList')

    list.innerHTML = data.notes.map(note => {
      const statusColor = {
        approved: '#51cf66',
        pending: '#fcc419',
        rejected: '#ff6b6b'
      }[note.status]

      return `
        <div class="glass-card mb-3">
          <div class="row align-items-center">
            <div class="col-12 col-md-8">
              <div class="d-flex align-items-center gap-2 mb-1">
                <p style="font-weight:600; margin:0;">${note.title}</p>
                <span style="font-size:0.72rem;
                  padding:0.2rem 0.6rem;
                  border-radius:20px;
                  background:${statusColor}22;
                  color:${statusColor};
                  border:1px solid ${statusColor}44;">
                  ${note.status}
                </span>
              </div>
              <p style="font-size:0.8rem;
                color:var(--text-secondary); margin:0;">
                ${note.subject} • Sem ${note.semester} •
                By ${note.uploader_name} •
                📥 ${note.downloads} downloads
              </p>
            </div>
            <div class="col-12 col-md-4 mt-2 mt-md-0">
              <div class="d-flex gap-2 justify-content-md-end">
                <button
                  onclick="deleteNote(${note.note_id})"
                  class="btn-glass-outline"
                  style="padding:0.4rem 1rem;
                    border-color:#ff6b6b;
                    color:#ff6b6b;
                    font-size:0.85rem;">
                  🗑 Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      `
    }).join('')

  } catch (error) {
    console.error('Load all notes error:', error)
  }
}

// ─────────────────────────────────────────
// LOAD USERS
// ─────────────────────────────────────────
async function loadUsers() {
  try {
    const response = await fetch('/api/admin/users', {
      headers: authHeaders
    })
    const data = await response.json()
    const list = document.getElementById('usersList')

    list.innerHTML = data.users.map(u => `
      <div class="glass-card mb-3">
        <div class="row align-items-center">
          <div class="col-12 col-md-8">
            <p style="font-weight:600; margin:0;">${u.name}</p>
            <p style="font-size:0.8rem;
              color:var(--text-secondary); margin:0.2rem 0 0;">
              ${u.email} •
              <span style="color:${u.role === 'admin'
                ? 'var(--accent)' : 'var(--text-muted)'};">
                ${u.role}
              </span>
            </p>
          </div>
          <div class="col-12 col-md-4 mt-2 mt-md-0">
            <div class="d-flex justify-content-md-end">
              ${u.user_id !== user.userId ? `
                <button
                  onclick="deleteUser(${u.user_id})"
                  class="btn-glass-outline"
                  style="padding:0.4rem 1rem;
                    border-color:#ff6b6b;
                    color:#ff6b6b;
                    font-size:0.85rem;">
                  🗑 Delete
                </button>
              ` : `
                <span style="font-size:0.78rem; color:var(--text-muted);">
                  (You)
                </span>
              `}
            </div>
          </div>
        </div>
      </div>
    `).join('')

  } catch (error) {
    console.error('Load users error:', error)
  }
}

// ─────────────────────────────────────────
// APPROVE NOTE
// ─────────────────────────────────────────
async function approveNote(noteId) {
  try {
    const response = await fetch(`/api/admin/notes/${noteId}/approve`, {
      method: 'PUT',
      headers: authHeaders
    })

    if (response.ok) {
      // Remove card from UI instantly
      document.getElementById(`note-${noteId}`).remove()
      loadStats()

      // Check if list is now empty
      const remaining = document.getElementById('pendingList').children
      if (remaining.length === 0) {
        document.getElementById('pendingEmpty').style.display = 'block'
      }
    }
  } catch (error) {
    console.error('Approve error:', error)
  }
}

// ─────────────────────────────────────────
// REJECT NOTE
// ─────────────────────────────────────────
async function rejectNote(noteId) {
  try {
    const response = await fetch(`/api/admin/notes/${noteId}/reject`, {
      method: 'PUT',
      headers: authHeaders
    })

    if (response.ok) {
      document.getElementById(`note-${noteId}`).remove()
      loadStats()

      const remaining = document.getElementById('pendingList').children
      if (remaining.length === 0) {
        document.getElementById('pendingEmpty').style.display = 'block'
      }
    }
  } catch (error) {
    console.error('Reject error:', error)
  }
}

// ─────────────────────────────────────────
// DELETE NOTE
// ─────────────────────────────────────────
async function deleteNote(noteId) {
  if (!confirm('Are you sure you want to delete this note?')) return

  try {
    const response = await fetch(`/api/admin/notes/${noteId}`, {
      method: 'DELETE',
      headers: authHeaders
    })

    if (response.ok) {
      loadAllNotes()
      loadStats()
    }
  } catch (error) {
    console.error('Delete note error:', error)
  }
}

// ─────────────────────────────────────────
// DELETE USER
// ─────────────────────────────────────────
async function deleteUser(userId) {
  if (!confirm('Are you sure you want to delete this user?')) return

  try {
    const response = await fetch(`/api/admin/users/${userId}`, {
      method: 'DELETE',
      headers: authHeaders
    })

    if (response.ok) {
      loadUsers()
      loadStats()
    }
  } catch (error) {
    console.error('Delete user error:', error)
  }
}

// ─────────────────────────────────────────
// 
loadStats()
loadPendingNotes()