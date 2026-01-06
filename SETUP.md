# SmSm Academy - Setup Guide for Teammates

## Prerequisites
- Node.js (v18 or later)
- MongoDB (local or Atlas connection)

## Quick Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd smsm_academy
```

### 2. Setup Backend
```bash
cd Server
npm install
```

### 3. Create Environment File
Create a file named `.env` in the `Server` folder with:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/smsm_academy
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d
```

**Note:** If using MongoDB Atlas, replace the MONGO_URI with your Atlas connection string.

### 4. Seed the Database
Run these commands to populate the database:
```bash
# Seed all configuration and sample data
npm run seed

# Seed admin user (creates admin/admin123)
node src/seeds/seedAdmin.js
```

### 5. Start the Server
```bash
npm run dev
```

The server will run on `http://localhost:5000`

---

## Access Points

| Portal | URL |
|--------|-----|
| **Student Portal** | http://localhost:5000/ |
| **Admin Login** | http://localhost:5000/admin/ |
| **Admin Dashboard** | http://localhost:5000/admin/dashboard.html |

## Admin Credentials
- **Username:** `admin`
- **Password:** `admin123`

---

## Troubleshooting

### "Cannot connect to MongoDB"
- Make sure MongoDB is running locally, OR
- Update `.env` with your MongoDB Atlas connection string

### "Admin login not working"
Run the admin seed again:
```bash
node src/seeds/seedAdmin.js
```

### "No subjects/options showing"
Run the full seed:
```bash
npm run seed
```

---

## NPM Scripts Reference
| Command | Description |
|---------|-------------|
| `npm run dev` | Start server with hot-reload (development) |
| `npm start` | Start server (production) |
| `npm run seed` | Seed all data (config, subjects, groups, etc.) |
| `npm run seed:config` | Seed only config options |
| `npm run seed:time` | Seed only time configurations |
