# SmSm Academy - Setup Guide

## Prerequisites

Before running the project, make sure you have the following installed:

1. **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
2. **MongoDB** (local or Atlas cloud) - [Download](https://www.mongodb.com/try/download/community)
3. **Git** - [Download](https://git-scm.com/)

---

## 🚀 Quick Start

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd smsm_academy
```

### Step 2: Setup Backend

```bash
# Navigate to Server folder
cd Server

# Install dependencies
npm install

# Create .env file (copy from example or create new)
# The .env file should contain:
#   PORT=5000
#   MONGO_URI=mongodb://127.0.0.1:27017/academy_smsm
#   JWT_SECRET=smsacademysecretkey
#   JWT_EXPIRES_IN=1d

# Start MongoDB (if using local installation)
# Option A: Run mongod in a separate terminal
mongod

# Option B: Start as a service (Windows)
net start MongoDB

# Start the backend server
npm run dev
```

The backend will run on: `http://localhost:5000`

### Step 3: Setup Frontend

```bash
# Open a NEW terminal
# Navigate to Client folder
cd Client

# Serve the frontend (no build needed - it's vanilla HTML/JS)
npx serve .
```

The frontend will run on: `http://localhost:3000` (or another port if 3000 is busy)

### Step 4: Open in Browser

Open the URL shown in the terminal (e.g., `http://localhost:3000`)

---

## 📁 Project Structure

```
smsm_academy/
├── Client/                 # Frontend (HTML/CSS/JS)
│   ├── index.html          # Main page
│   ├── scripts/
│   │   ├── api.js          # API configuration & helpers
│   │   ├── app.js          # Main application
│   │   ├── state-machine.js
│   │   └── components/     # UI components
│   └── styles/             # CSS files
│
├── Server/                 # Backend (Node.js/Express)
│   ├── src/
│   │   ├── app.js          # Express app setup
│   │   ├── server.js       # Server entry point
│   │   ├── config/         # Database config
│   │   ├── controllers/    # Route handlers
│   │   ├── middlewares/    # Auth, upload, etc.
│   │   ├── models/         # Mongoose schemas
│   │   ├── routes/         # API routes
│   │   └── services/       # Business logic
│   ├── uploads/            # Uploaded files
│   ├── .env                # Environment variables
│   └── package.json
│
└── README.md
```

---

## 🔌 API Endpoints

### User Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/user/subjects` | Get all active subjects |
| POST | `/api/user/applications/submit` | Submit registration with file |

### Admin Endpoints (require authentication)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/admin/login` | Admin login |
| GET | `/api/admin/subjects` | Get all subjects |
| POST | `/api/admin/subjects` | Create subject |
| GET | `/api/admin/applications` | Get pending applications |
| PUT | `/api/admin/applications/:id/status` | Accept/reject application |

---

## 🛠️ Troubleshooting

### MongoDB Connection Error
```
MongooseServerSelectionError: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution:** Start MongoDB service or check if it's running:
```bash
# Windows
net start MongoDB

# Or run mongod directly
mongod
```

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution:** Change the PORT in `.env` file or kill the process using that port.

### CORS Error in Browser Console
**Solution:** Make sure the backend is running at `http://localhost:5000`

### Frontend Shows Fallback Data
This is normal if the backend is not running. The frontend is designed to work offline with sample data.

---

## 📝 Environment Variables

Create a `.env` file in the `Server/` folder:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/academy_smsm
JWT_SECRET=your_secret_key_here
JWT_EXPIRES_IN=1d
```

### Using MongoDB Atlas (Cloud)

If you prefer cloud MongoDB:
1. Create free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster
3. Get connection string
4. Update `.env`:
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/academy_smsm
```

---

## 👥 Development Workflow

1. **Backend changes:** Edit files in `Server/src/`, nodemon will auto-restart
2. **Frontend changes:** Edit files in `Client/`, refresh browser to see changes
3. **Test API:** Use Postman or browser console

---

## 📞 Need Help?

If you encounter any issues, check:
1. Node.js is installed: `node --version`
2. MongoDB is running: `mongod --version`
3. Dependencies are installed: `npm install` in Server folder
4. .env file exists with correct values
