// Auth guard
const token = localStorage.getItem("token");
console.log("Token:", token);
const user = JSON.parse(localStorage.getItem("user"));

// Transform Cloudinary raw URL to force proper download
function getDownloadUrl(fileUrl) {
   return fileUrl.replace("/raw/upload/", "/raw/upload/fl_attachment/");
}

if (!token || !user) {
   window.location.href = "/login.html";
}

// Logout
document.getElementById("logoutBtn").addEventListener("click", () => {
   localStorage.removeItem("token");
   localStorage.removeItem("user");
   window.location.href = "/login.html";
});

// ─────────────────────────────────────────
// FETCH AND RENDER NOTES
async function fetchNotes() {
   const search = document.getElementById("searchInput").value.trim();
   const subject = document.getElementById("subjectFilter").value.trim();
   const semester = document.getElementById("semesterFilter").value;
   const sort = document.getElementById("sortFilter").value;

   // Show loading, hide others
   document.getElementById("loadingState").style.display = "block";
   document.getElementById("notesGrid").innerHTML = "";
   document.getElementById("emptyState").style.display = "none";
   document.getElementById("resultsCount").textContent = "";

   // Build query string dynamically
   const params = new URLSearchParams();
   if (search) params.append("search", search);
   if (subject) params.append("subject", subject);
   if (semester) params.append("semester", semester);
   if (sort) params.append("sort", sort);

   try {
      const response = await fetch(`/api/notes?${params.toString()}`, {
         headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      // Hide loading
      document.getElementById("loadingState").style.display = "none";

      if (!response.ok) {
         showEmptyState();
         return;
      }

      const notes = data.notes;

      if (notes.length === 0) {
         showEmptyState();
         return;
      }

      // Show results count
      document.getElementById("resultsCount").textContent =
         `${notes.length} note${notes.length !== 1 ? "s" : ""} found`;

      // Render cards
      const grid = document.getElementById("notesGrid");
      grid.innerHTML = notes.map((note) => createNoteCard(note)).join("");
   } catch (error) {
      document.getElementById("loadingState").style.display = "none";
      showEmptyState();
   }
}

// ─────────────────────────────────────────
// CREATE NOTE CARD HTML
function createNoteCard(note) {
   const date = new Date(note.created_at).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
   });

   return `
    <div class="col-12 col-md-6 col-lg-4">
      <div class="note-card">

        <div class="d-flex justify-content-between align-items-start mb-2">
          <div>
            <span class="glass-badge">${note.subject}</span>
            <span class="glass-badge">Sem ${note.semester}</span>
          </div>
          <span style="font-size:0.75rem; color:var(--text-muted);">
            ${date}
          </span>
        </div>

        <p class="note-title">${note.title}</p>

        <p class="note-meta">
          Uploaded by ${note.uploader_name}
        </p>

        ${note.description ? `<p class="note-desc">${note.description}</p>` : ""
      }

        <hr class="glass-divider">
<div class="d-flex justify-content-between align-items-center">
  <span style="font-size:0.78rem; color:var(--text-muted);">
    📥 ${note.downloads} downloads
  </span>
  <div class="d-flex gap-2">
    <button
      class="btn-glass-outline"
      id="bookmark-btn-${note.note_id}"
      onclick="handleBookmark(${note.note_id}, this)"
      style="font-size:0.8rem; padding:0.4rem 0.75rem;">
      🔖 Save
    </button>
    <button
      class="btn-glass-outline"
      onclick="downloadNote(${note.note_id}, '${note.title.replace(/'/g, "")}')"
      style="font-size:0.8rem; padding:0.4rem 0.9rem;">
      Download
    </button>
  </div>
</div>

      </div>
    </div>
  `;
}

async function handleBookmark(noteId, btn) {
  try {
    const response = await fetch(`/api/bookmarks/${noteId}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    })

    const data = await response.json()

    if (response.ok) {
      if (data.bookmarked) {
        btn.textContent = '🔖 Saved'
        btn.style.borderColor = 'var(--accent)'
        btn.style.color = 'var(--accent)'
      } else {
        btn.textContent = '🔖 Save'
        btn.style.borderColor = ''
        btn.style.color = ''
      }
    }
  } catch (error) {
    console.error('Bookmark error:', error)
  }
}

// ─────────────────────────────────────────
// DOWNLOAD NOTE
async function downloadNote(noteId, title) {
   try {
      window.open(`/api/notes/${noteId}/download?token=${token}`, "_blank");
      setTimeout(fetchNotes, 2000);
   } catch (error) {
      console.error("Download error:", error);
   }
}

// ─────────────────────────────────────────
// EMPTY STATE
function showEmptyState() {
   document.getElementById("emptyState").style.display = "block";
   document.getElementById("resultsCount").textContent = "";
}

// ─────────────────────────────────────────
// SEARCH + FILTER LISTENERS

// Search with debounce — don't fire on every keystroke
let debounceTimer;
document.getElementById("searchInput").addEventListener("input", () => {
   clearTimeout(debounceTimer);
   debounceTimer = setTimeout(fetchNotes, 400);
});

// Filters fire immediately on change
document.getElementById("subjectFilter").addEventListener("input", fetchNotes);
document
   .getElementById("semesterFilter")
   .addEventListener("change", fetchNotes);
document.getElementById("sortFilter").addEventListener("change", fetchNotes);

// Reset button
document.getElementById("resetBtn").addEventListener("click", () => {
   document.getElementById("searchInput").value = "";
   document.getElementById("subjectFilter").value = "";
   document.getElementById("semesterFilter").value = "";
   document.getElementById("sortFilter").value = "latest";
   fetchNotes();
});

// Load notes on page load
fetchNotes();
