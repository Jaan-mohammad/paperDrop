# 📄 paperDrop

> A centralized platform for students to upload, share, and download study materials — built to replace WhatsApp groups and scattered resources.

🌐 **Live Demo:** [https://paperdrop-production.up.railway.app](https://paperdrop-production.up.railway.app)

---

## 🚀 What is paperDrop?

Students waste hours searching for notes across WhatsApp, email, and random drives. paperDrop solves this by giving every student one place to upload, find, and download academic resources — organized by subject and semester, moderated by admins.

---

## ✨ Features

### 👤 Authentication
- Register and login with JWT
- Password hashing with bcrypt
- Role-based access (Student / Admin)
- Protected routes with middleware

### 📤 Upload Notes
- Upload PDF and Word documents
- Add metadata — title, subject, semester, description
- Files stored securely on Cloudinary
- Admin approval before going live

### 🔍 Browse & Search
- Search by title or description
- Filter by subject and semester
- Sort by latest or most downloaded
- Debounced search for performance

### 📥 Download
- One-click download via backend proxy
- Download counter per note
- Secure signed Cloudinary URLs

### 👑 Admin Panel
- View all pending uploads
- Approve or reject notes
- Manage all users
- Delete inappropriate content
- Real-time stats dashboard

### 📊 User Dashboard
- Personal upload history with status badges
- Total downloads on your notes
- Platform-wide stats

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML, CSS, Bootstrap 5, Vanilla JS |
| Backend | Node.js, Express.js |
| Database | MySQL (Railway) |
| File Storage | Cloudinary |
| Authentication | JWT + bcrypt |
| Deployment | Railway |

---

## 📁 Project Structure

```
paperDrop/
│
├── server.js                    # Entry point
├── config/
│   ├── db.js                    # MySQL connection pool
│   └── cloudinary.js            # Cloudinary + Multer config
│
├── routes/
│   ├── auth.routes.js           # /api/auth
│   ├── notes.routes.js          # /api/notes
│   └── admin.routes.js          # /api/admin
│
├── controllers/
│   ├── auth.controller.js       # Register, Login, GetMe
│   ├── notes.controller.js      # Upload, Browse, Download
│   └── admin.controller.js      # Approve, Reject, Manage
│
├── middleware/
│   └── auth.middleware.js       # JWT verification + Admin guard
│
└── public/                      # Frontend files
    ├── index.html               # Landing page
    ├── login.html
    ├── register.html
    ├── dashboard.html
    ├── browse.html
    ├── upload.html
    ├── admin.html
    ├── css/
    │   └── style.css            # Glassmorphism design system
    └── js/
        ├── auth.js
        ├── browse.js
        ├── upload.js
        └── admin.js
```

---

## 🗄️ Database Schema

```sql
users
─────────────────────────────
user_id     INT PRIMARY KEY AUTO_INCREMENT
name        VARCHAR(100)
email       VARCHAR(100) UNIQUE
password    VARCHAR(255)       -- bcrypt hashed
role        ENUM('student', 'admin')
created_at  TIMESTAMP

notes
─────────────────────────────
note_id     INT PRIMARY KEY AUTO_INCREMENT
title       VARCHAR(255)
subject     VARCHAR(100)
semester    INT
description TEXT
file_url    VARCHAR(500)       -- Cloudinary URL
uploaded_by INT → FK → users
downloads   INT DEFAULT 0
status      ENUM('pending', 'approved', 'rejected')
created_at  TIMESTAMP
```

---

## 🔌 API Endpoints

### Auth
```
POST   /api/auth/register     Register new account
POST   /api/auth/login        Login, returns JWT
GET    /api/auth/me           Get logged in user (protected)
```

### Notes
```
GET    /api/notes             Get all approved notes (+ search/filter)
GET    /api/notes/:id         Get single note
POST   /api/notes/upload      Upload note (protected)
GET    /api/notes/:id/download Download note (protected)
DELETE /api/notes/:id         Delete own note (protected)
GET    /api/notes/my/stats    Get user stats (protected)
GET    /api/notes/my/uploads  Get my uploads (protected)
```

### Admin
```
GET    /api/admin/notes/pending   Get pending notes
GET    /api/admin/notes           Get all notes
PUT    /api/admin/notes/:id/approve  Approve note
PUT    /api/admin/notes/:id/reject   Reject note
DELETE /api/admin/notes/:id       Delete note
GET    /api/admin/users           Get all users
DELETE /api/admin/users/:id       Delete user
```

---

## ⚙️ Local Setup

### Prerequisites
- Node.js v18+
- MySQL
- Cloudinary account

### Steps

```bash
# 1. Clone the repo
git clone https://github.com/Jaan-mohammad/paperDrop.git
cd paperDrop

# 2. Install dependencies
npm install

# 3. Create .env file
cp .env.example .env
# Fill in your credentials

# 4. Create MySQL database
# Run the SQL from db.sql in your MySQL client

# 5. Start development server
npm run dev
```

### Environment Variables

```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=paperdrop
JWT_SECRET=your_secret_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## 🚀 Deployment

- **Database** → MySQL on Railway
- **Backend + Frontend** → Node.js on Railway
- **File Storage** → Cloudinary (free tier)

---

## 🔮 Future Enhancements

- PDF preview in browser
- Email verification on register
- Comments and discussions on notes
- Rating system for notes
- AI-based note recommendations
- Mobile application
- Email notifications for approvals

---

## 👨‍💻 Author

Built as a Final Year Project — demonstrating full stack web development with Node.js, Express, MySQL, and cloud deployment.

---

## 📝 License

MIT License — free to use and modify.
