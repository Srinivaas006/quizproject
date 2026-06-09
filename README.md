# QuizConductor 🎯
### Real-Time Multiplayer Quiz Platform with AI-Powered Question Generation

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20Site-blue?style=for-the-badge)](https://quizproject-frontend.onrender.com)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-green?style=for-the-badge&logo=node.js)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.x-black?style=for-the-badge&logo=socket.io)](https://socket.io)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb)](https://mongodb.com)

---

## What is QuizConductor?

QuizConductor is a **full-stack real-time quiz platform** built for classrooms, technical assessments, and events. Teachers create and launch quizzes; students join instantly via a session code — no account needed. Scores update live on a leaderboard as answers come in, powered by WebSocket communication.

A standout feature: **upload any PDF, Excel sheet, or text document** and the platform uses **Google Gemini AI** to automatically extract and format quiz questions — saving hours of manual entry.

> 🎓 Built as a B.Tech final-year capstone project. Deployed and actively used for classroom quizzes at JNTUK.

---

## Live Demo

🔗 **[https://quizproject-frontend.onrender.com](https://quizproject-frontend.onrender.com)**

| Role    | Access                                      |
|---------|---------------------------------------------|
| Teacher | Register → Create Quiz → Launch Session     |
| Student | Join via session code — no account needed   |

---

## Key Features

### For Teachers (Admin)
- **Create quizzes** manually or by uploading a file (PDF, Excel, TXT, CSV)
- **AI question extraction** — paste or upload any content; Gemini 1.5 Flash parses it into structured MCQs
- **Live lobby** — see students join in real time before starting
- **Live leaderboard** — watch scores update per question as students answer
- **Countdown timer** — configurable per-question time limit
- **Session code** — unique 6-character code generated per quiz

### For Students
- **Join without an account** — just a session code and your name
- **Real-time quiz experience** — questions appear simultaneously for all participants
- **Instant results** — grade, accuracy %, correct/incorrect breakdown after quiz
- **Detailed answer review** — see every question, your answer, and the correct answer
- **Personal score card** — rank on the final leaderboard

### Platform
- **Dark / Light mode** — system preference detected, manually togglable
- **Role-based access** — JWT-authenticated admin routes, open student routes
- **Responsive UI** — works on desktop and mobile
- **Demo mode** — try the platform without signing up

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      CLIENT (React 18)                   │
│  HomePage → CreateQuiz → Lobby → QuizSession → Results  │
│              Socket.IO Client  │  Axios REST             │
└────────────────────┬──────────┴──────────────────────────┘
                     │ WebSocket + HTTP
┌────────────────────▼──────────────────────────────────────┐
│                  SERVER (Express + Node.js)                │
│                                                           │
│  REST API            │  Socket.IO Server                  │
│  /api/auth           │  joinQuiz                          │
│  /api/quizzes        │  teacherStartQuiz                  │
│  /api/quizzes/parse  │  answer → liveLeaderboard          │
│                      │  finishQuiz → finalLeaderboard     │
│                                                           │
│  Gemini 1.5 Flash API (AI question extraction)           │
└────────────────────┬──────────────────────────────────────┘
                     │ Mongoose ODM
┌────────────────────▼──────────────────────────────────────┐
│               MongoDB Atlas (Cloud DB)                    │
│   Users │ Quizzes │ Results                               │
└───────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer       | Technology                        | Purpose                              |
|-------------|-----------------------------------|--------------------------------------|
| Frontend    | React 18, React Router v6         | SPA with client-side routing         |
| Styling     | CSS Variables, GlobalStyles.css   | Dark/light theme system              |
| Real-time   | Socket.IO (client + server)       | Live quiz sync, leaderboard updates  |
| HTTP Client | Axios                             | REST API calls with JWT headers      |
| Backend     | Node.js, Express.js               | REST API + WebSocket server          |
| Auth        | JWT, bcrypt                       | Secure token-based authentication    |
| Database    | MongoDB Atlas, Mongoose           | Data persistence and schema modeling |
| AI          | Google Gemini 1.5 Flash API       | Intelligent question extraction      |
| File Parse  | multer, xlsx, pdf-parse           | Excel/CSV/PDF upload handling        |
| Deployment  | Render.com                        | Full-stack cloud deployment          |

---

## Project Structure

```
quizproject/
├── backend/
│   ├── models/
│   │   ├── User.js          # User schema (admin role)
│   │   ├── Quiz.js          # Quiz + questions schema
│   │   └── Result.js        # Student results + detailed answers
│   ├── routes/
│   │   ├── auth.js          # Register / Login endpoints
│   │   └── quizzes.js       # Quiz CRUD + AI file parsing
│   ├── socket.js            # All real-time Socket.IO logic
│   └── server.js            # Express app entry point
│
└── frontend/
    └── src/
        ├── components/
        │   ├── HomePage.js        # Landing page
        │   ├── CreateQuiz.js      # Quiz creation + file upload UI
        │   ├── JoinQuiz.js        # Student join screen
        │   ├── Lobby.js           # Pre-quiz waiting room
        │   ├── QuizSession.js     # Live quiz with timer
        │   ├── Results.js         # Post-quiz score summary
        │   ├── Leaderboard.js     # Student-facing final board
        │   └── TLeaderboard.js    # Teacher live leaderboard
        ├── contexts/
        │   └── AuthContext.js     # Global auth state
        └── App.js                 # Routes + theme provider
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free tier works)
- Google Gemini API key (free at [aistudio.google.com](https://aistudio.google.com))

### 1. Clone the repo
```bash
git clone https://github.com/Srinivaas006/quizproject.git
cd quizproject
```

### 2. Backend setup
```bash
cd backend
npm install
```

Create a `.env` file in `/backend`:
```env
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key
GEMINI_API_KEY=your_gemini_api_key
FRONTEND_URL=http://localhost:3000
PORT=5000
```

```bash
npm start
```

### 3. Frontend setup
```bash
cd frontend
npm install
npm start
```

App runs at `http://localhost:3000`

---

## How It Works — Real-Time Flow

```
Teacher creates quiz → gets SESSION CODE
         │
         ▼
Students enter session code → join lobby (Socket: joinQuiz)
         │
         ▼
Teacher sees students join → clicks START (Socket: teacherStartQuiz)
         │
         ▼
3-2-1 countdown broadcasts to all → quiz begins simultaneously
         │
         ▼
Each answer → server checks → updates score (Socket: answer)
         │
         ▼
Live leaderboard pushes to teacher screen after every answer
         │
         ▼
All questions done → results saved to MongoDB → grade assigned
         │
         ▼
Final leaderboard shown to all → detailed review shown to student
```

---

## AI Question Extraction

Upload any of the following and Gemini extracts MCQs automatically:

| Format   | How it's parsed                             |
|----------|---------------------------------------------|
| `.xlsx`  | Excel parser first; Gemini fallback         |
| `.csv`   | Parsed as structured rows                   |
| `.txt`   | Raw text sent to Gemini                     |
| `.pdf`   | Text extracted → sent to Gemini             |

Gemini prompt enforces JSON output format with `text`, `options[]`, and `correctIndex` — validated and sanitised server-side before saving.

---

## Grading System

| Percentage | Grade |
|------------|-------|
| ≥ 90%      | A+    |
| ≥ 80%      | A     |
| ≥ 70%      | B     |
| ≥ 60%      | C     |
| ≥ 50%      | D     |
| < 50%      | F     |

Score = number of correct answers (no negative marking).

---

## API Endpoints

| Method | Endpoint                  | Auth     | Description                        |
|--------|---------------------------|----------|------------------------------------|
| POST   | `/api/auth/register`      | None     | Create admin account               |
| POST   | `/api/auth/login`         | None     | Login, returns JWT                 |
| POST   | `/api/quizzes`            | Admin    | Create a new quiz                  |
| GET    | `/api/quizzes/:code`      | None     | Fetch quiz by session code         |
| POST   | `/api/quizzes/parse-file` | Admin    | Upload file → AI extract questions |
| POST   | `/api/quizzes/:code/result` | None   | Save student result                |

---

## Socket Events

| Event                | Direction         | Description                          |
|----------------------|-------------------|--------------------------------------|
| `joinQuiz`           | Client → Server   | Student joins session                |
| `teacherJoinLobby`   | Client → Server   | Teacher opens lobby                  |
| `teacherStartQuiz`   | Client → Server   | Teacher starts the quiz              |
| `answer`             | Client → Server   | Student submits an answer            |
| `finishQuiz`         | Client → Server   | Student completes all questions      |
| `lobbyUpdate`        | Server → Client   | Updated student list in lobby        |
| `countdown`          | Server → Client   | 3-2-1 countdown before quiz          |
| `startQuiz`          | Server → Client   | Quiz questions pushed to all clients |
| `liveLeaderboard`    | Server → Client   | Leaderboard after each answer        |
| `quizResults`        | Server → Client   | Final results for student            |
| `finalLeaderboard`   | Server → Client   | Final leaderboard for all            |

---

## Planned Improvements

- [ ] Export leaderboard to Excel/CSV
- [ ] Student result history (login to view past quizzes)
- [ ] Quiz scheduling (set future start time)
- [ ] Question bank (save/reuse questions across sessions)
- [ ] Analytics dashboard (per-question accuracy, score distribution charts)
- [ ] Shareable result card (html2canvas export)
- [ ] Docker + docker-compose for one-command local setup
- [ ] GitHub Actions CI pipeline

---

## Screenshots

> Add screenshots here after capturing them from the live site.

| Homepage | Create Quiz | Live Quiz | Results |
|----------|-------------|-----------|---------|
| ![home](screenshots/home.png) | ![create](screenshots/create.png) | ![quiz](screenshots/quiz.png) | ![results](screenshots/results.png) |

---

## Author

**[ Kundu Srinivas ]**  
B.Tech CSE — Aditya University (AR23)  
📧 kundusrinivas006@gmail.com
🔗 [LinkedIn](www.linkedin.com/in/kundu-srinivas-896bb2337) · [GitHub](https://github.com/Srinivaas006)

---

## License

MIT License — feel free to use, modify, and distribute with attribution.
