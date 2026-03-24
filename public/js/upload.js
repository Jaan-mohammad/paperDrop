// Auth guard
const token = localStorage.getItem('token')
const user = JSON.parse(localStorage.getItem('user'))

if (!token || !user) {
  window.location.href = '/login.html'
}

// Logout
document.getElementById('logoutBtn').addEventListener('click', () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  window.location.href = '/login.html'
})

// ─────────────────────────────────────────
// FILE DROP ZONE
const dropZone = document.getElementById('dropZone')
const fileInput = document.getElementById('fileInput')
const fileName = document.getElementById('fileName')

// Click on drop zone opens file picker
dropZone.addEventListener('click', () => fileInput.click())

// When file is selected show its name
fileInput.addEventListener('change', () => {
  if (fileInput.files.length > 0) {
    const file = fileInput.files[0]
    fileName.textContent = `Selected: ${file.name}`
    fileName.style.display = 'block'
    dropZone.style.borderColor = 'var(--accent)'
  }
})

// Drag and drop support
dropZone.addEventListener('dragover', (e) => {
  e.preventDefault()
  dropZone.style.borderColor = 'var(--accent)'
})

dropZone.addEventListener('dragleave', () => {
  dropZone.style.borderColor = 'var(--glass-border)'
})

dropZone.addEventListener('drop', (e) => {
  e.preventDefault()
  const files = e.dataTransfer.files
  if (files.length > 0) {
    fileInput.files = files
    fileName.textContent = `Selected: ${files[0].name}`
    fileName.style.display = 'block'
  }
})

// ─────────────────────────────────────────
// SHOW MESSAGE
function showMessage(text, type) {
  const box = document.getElementById('message')
  box.textContent = text
  box.className = `glass-alert ${type}`
  box.style.display = 'block'
}

// ─────────────────────────────────────────
// UPLOAD
document.getElementById('uploadBtn').addEventListener('click', async () => {
  const file = fileInput.files[0]
  const title = document.getElementById('title').value.trim()
  const subject = document.getElementById('subject').value.trim()
  const semester = document.getElementById('semester').value
  const description = document.getElementById('description').value.trim()

  // Validate
  if (!file) {
    showMessage('Please select a file', 'danger')
    return
  }

  if (!title || !subject || !semester) {
    showMessage('Title, subject and semester are required', 'danger')
    return
  }

  try {
    const uploadBtn = document.getElementById('uploadBtn')
    uploadBtn.disabled = true
    uploadBtn.innerHTML = `
  <span class="spinner-border spinner-border-sm me-2" 
  role="status"></span> Uploading...`

    // Build FormData
    const formData = new FormData()
    formData.append('file', file)
    formData.append('title', title)
    formData.append('subject', subject)
    formData.append('semester', semester)
    formData.append('description', description)

    // Send to backend
    const response = await fetch('/api/notes/upload', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    })

    const data = await response.json()

    if (response.ok) {
      showMessage(
        'Note uploaded successfully! Pending admin approval.',
        'success'
      )
      // Reset form
      fileInput.value = ''
      fileName.style.display = 'none'
      dropZone.style.borderColor = 'var(--glass-border)'
      document.getElementById('title').value = ''
      document.getElementById('subject').value = ''
      document.getElementById('semester').value = ''
      document.getElementById('description').value = ''

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        window.location.href = '/dashboard.html'
      }, 2000)

    } else {
      showMessage(data.message, 'danger')
      uploadBtn.disabled = false
      uploadBtn.textContent = 'Upload Note'
    }

  } catch (error) {
    showMessage('Something went wrong. Try again.', 'danger')
    document.getElementById('uploadBtn').disabled = false
    document.getElementById('uploadBtn').textContent = 'Upload Note'
  }
})