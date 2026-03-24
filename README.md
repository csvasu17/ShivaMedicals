# Shiva Medicals

Digital token booking & clinic queue management system for Shiva Medicals, Aranthangi.

---

## Folder Structure

```
ShivaMedicals/
│
├── client/                        # React + Vite frontend (port 6002)
│   ├── public/                    # Static assets
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/            # Navbar, Footer
│   │   │   ├── modals/            # BookingModal, LoginModal
│   │   │   └── sections/          # All homepage sections
│   │   ├── constants/             # API configuration
│   │   ├── pages/                 # Main routes
│   │   ├── App.jsx                # Root app & routing
│   │   └── index.css              # Design system
│   └── .env                       # Frontend env vars
│
├── server/                        # Express.js backend (port 6001)
│   ├── controllers/               # API logic
│   ├── routes/                    # API routing
│   ├── db/                        # Database connection
│   ├── index.js                   # Main server entry
│   └── update_db.js               # Database migrations
│
├── dev.js                         # Start both client + server (node dev.js)
├── package.json                   # Root monorepo config
└── README.md
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL running locally

### Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run database migrations**:
   ```bash
   cd server && node update_db.js
   ```

3. **Start development**:
   ```bash
   # From root
   npm run dev
   ```

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/doctors` | Get all doctors |
| GET | `/api/sessions/:doctorId` | Sessions for a doctor |
| POST | `/api/bookings` | Create a token booking |
| POST | `/api/auth/login` | Staff login |
