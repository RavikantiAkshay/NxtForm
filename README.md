# NxtForm — AI-Powered Form Builder & Data Collection Platform

An open-source, full-stack web application that revolutionizes how you collect data. Build highly customizable forms with a drag-and-drop workspace, or let AI generate professional forms from a simple prompt. Serve your forms in both classic and conversational modes to maximize completion rates.

---

## ✨ Features

### Workspace Builder
- **Drag & Drop Interface** — Build forms effortlessly with over 30+ custom block types.
- **Extensive Element Library** — Short text, long text, MCQs, dropdowns, ratings (stars, emoji, NPS), sliders, OTP inputs, file uploads, and terms & conditions.
- **Live Preview** — See exactly how your form will look on mobile or desktop in real-time.
- **"Other" Option Handling** — Built-in support for conditional "Other" text inputs in dropdowns and MCQs.

### AI Form Generator
- **Prompt to Form** — Type what you need (e.g., "A job application for a frontend developer") and let AI build the entire structure.
- **Smart Element Selection** — AI automatically selects the best specialized elements (e.g., File Upload for resumes, Dropdowns for states, Terms for agreements).
- **Professional Rephrasing** — Automatically refines your raw prompts into highly professional, user-friendly field titles.

### Form Publishing & Validation
- **One-Click Publish** — Make your forms live instantly via shareable public links.
- **Two Rendering Modes** — Toggle between Classic (standard web form) and Conversational (one question at a time like Typeform).
- **Smart Validation** — Client-side interception prevents the submission of incomplete required fields or empty custom "Other" responses.

### Response Dashboard & AI Intelligence
- **Small-Cohort Analytics** — Track real-time "Unread" counts and "Last Activity" timestamps that intelligently auto-update as users modify their submissions.
- **Friction Tracking** — Automatically calculate and highlight the "Bottleneck Question" causing the highest drop-off/skip rate across all submissions.
- **AI Outlier Detection** — Instantly scan dozens of responses using LLaMA to filter and isolate anomalous or flagged submissions for immediate manual review.
- **AI Workflow Insights** — Generate hard-hitting themes and direct workflow action items (e.g., "3 users are stuck on pricing") from raw data, bypassing generic statistical fluff.
- **CSV Export** — Export clean data with built-in CSV-injection protections and proper merging of custom "Other" inputs.

### Platform
- **Authentication** — Secure login and registration.
- **Open Source** — MIT licensed, contributions welcome.

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React | UI framework |
| React Router | Client-side routing |
| Vite | Build tool & dev server |
| TailwindCSS | Utility-first CSS framework |
| React Beautiful DnD | Drag-and-drop functionality |

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js + Express | REST API server |
| MongoDB + Mongoose | Database & ODM |
| JWT (jsonwebtoken) | Authentication |
| Groq API (LLaMA 3) | AI-powered form generation |

---

## 📁 Project Structure

```text
NxtForm/
├── client/                          # Frontend (React + Vite)
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/                   # AuthPage, LandingPage, MyFormsPage, WorkspaceBuilder, PublishedForm, ResponseDashboard
│   │   ├── App.jsx                  # Route definitions
│   │   ├── main.jsx                 # App entry point
│   │   └── index.css                # Global design system & tokens
│   └── .env                         
│
├── server/                          # Backend (Express + MongoDB)
│   ├── controllers/
│   │   ├── authController.js        
│   │   ├── formController.js        
│   │   └── responseController.js    
│   ├── middleware/
│   │   └── authMiddleware.js        
│   ├── models/
│   │   ├── User.js                  
│   │   ├── Form.js                  
│   │   └── Response.js              
│   ├── routes/
│   │   ├── authRoutes.js            
│   │   ├── formRoutes.js            
│   │   ├── responseRoutes.js        
│   │   └── aiRoutes.js              # Groq AI generation route
│   ├── server.js                    # Express app entry point
│   └── .env                         
│
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+ and **npm**
- **MongoDB** (local instance or MongoDB Atlas)
- **Groq API Key** — Get a free key at [console.groq.com](https://console.groq.com)

### 1. Clone the Repository

```bash
git clone https://github.com/RavikantiAkshay/NxtForm.git
cd NxtForm
```

### 2. Setup the Backend

```bash
cd server
npm install
```

Create a `.env` file in the `server/` directory:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
GROQ_API_KEY=your_groq_api_key
```

Start the backend server:

```bash
npm run dev
```

### 3. Setup the Frontend

```bash
cd ../client
npm install
```

Start the frontend dev server:

```bash
npm run dev
```

### 4. Open the App

Visit **[http://localhost:5173](http://localhost:5173)** in your browser.

---

## 📄 License

© 2026 Ravikanti Akshay. This project is open source and available under the [MIT License](LICENSE).