# 🍔 Food Genie

Smart food ordering platform powered by artificial intelligence, built on the **MERN** stack.

> **Status:** Project scaffold only. No authentication, database models, or business logic yet — this is the initial full-stack skeleton to build on step by step.

## 🧱 Tech Stack

| Layer    | Technology                                      |
| -------- | ----------------------------------------------- |
| Frontend | React (Vite), React Router, Axios, Tailwind CSS |
| Backend  | Node.js, Express                                |
| Database | MongoDB (via Mongoose)                          |
| Auth     | JSON Web Tokens + bcryptjs _(planned)_          |
| Payments | Stripe _(planned)_                              |
| AI       | Gemini _(planned)_                              |

## 📁 Project Structure

```
food-genie/
├── backend/                # Node.js + Express API
│   ├── config/             # DB connection & other config
│   ├── controllers/        # Route handler logic (later)
│   ├── middleware/         # Custom Express middleware (later)
│   ├── models/             # Mongoose models (later)
│   ├── routes/             # API route definitions
│   ├── utils/              # Helper functions (later)
│   ├── .env.example        # Environment variable template
│   └── server.js           # App entry point
│
└── frontend/               # React app (Vite)
    ├── src/
    │   ├── components/     # Reusable UI components
    │   ├── context/        # React context providers
    │   ├── pages/          # Page-level components
    │   ├── services/       # API layer (Axios instance)
    │   ├── App.jsx         # Routes
    │   └── main.jsx        # Entry point
    └── index.html
```

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/)
- A MongoDB connection string (local or [MongoDB Atlas](https://www.mongodb.com/atlas)) — optional for now

### 1. Backend

```bash
cd backend
npm install

# Create your env file from the template and fill in values
cp .env.example .env

# Start the dev server (auto-reloads on changes)
npm run dev
```

The API runs on **http://localhost:5000** by default.
Test it: [http://localhost:5000/api/health](http://localhost:5000/api/health) -> `{ "status": "ok" }`

> Note: MongoDB connection is commented out in `server.js` so the server
> boots without a database while scaffolding. Set `MONGO_URI` in `.env` and
> uncomment `connectDB()` when you're ready.

### 2. Frontend

```bash
cd frontend
npm install

# (Optional) create env file if you need a custom API URL
cp .env.example .env

# Start the Vite dev server
npm run dev
```

The app runs on **http://localhost:5173**. Open it and you should see the
Food Genie homepage displaying the backend's health status (`ok ✅`),
confirming the frontend and backend are connected.

## 📜 Available Scripts

**Backend** (`/backend`)

- `npm run dev` — start with nodemon (auto-reload)
- `npm start` — start with node

**Frontend** (`/frontend`)

- `npm run dev` — start the Vite dev server
- `npm run build` — production build
- `npm run preview` — preview the production build

## 🔑 Environment Variables

See `backend/.env.example` and `frontend/.env.example`. Never commit your
real `.env` files — they're already git-ignored.

## 📄 License

MIT
