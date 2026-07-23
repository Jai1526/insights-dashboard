<div align="center">

# 📊 Insights Dashboard

### Real-time analytics dashboard with WebSocket live updates, dark mode, and glassmorphic UI

*Turn raw traffic into confident decisions — with live metrics streaming into your dashboard.*

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.x-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongoosejs.com/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-Real--time-010101?style=for-the-badge&logo=socket.io&logoColor=white)](https://socket.io/)
[![Chart.js](https://img.shields.io/badge/Chart.js-4.x-FF6384?style=for-the-badge&logo=chartdotjs&logoColor=white)](https://www.chartjs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

</div>

<br/>

## 🔗 GitHub Repository

> **https://github.com/Jai1526/insights-dashboard**

<br/>

## 🎬 Live Demo 
The live demo runs locally at `http://localhost:5000` after starting the backend server with MongoDB.

**To see the demo:**
1. Clone the repository
2. Run `npm install && npm run dev`
3. Open `http://localhost:5000`
4. Login with demo credentials: `demo@insights.io` / `demo12345`

The dashboard features real-time WebSocket updates — new traffic events appear every 2-8 seconds with live activity feed updates and toast notifications.

<br/>

## ✨ Overview

Insights Dashboard is a full-stack analytics platform combining a **Node.js/Express backend** with a **glassmorphic frontend**. It uses **Socket.IO** to stream live traffic events in real-time, **Chart.js** for animated visualizations, and **MongoDB/Mongoose** for persistence. The UI features a collapsible sidebar, dark/light theme toggle, and responsive glass-panel design.

<br/>

## 🚀 Features

- ⚡ **Real-time analytics** — WebSocket-powered live event streaming; dashboard updates instantly as new traffic arrives
- 🎨 **Dual theme system** — smooth light/dark mode toggle using CSS custom properties, persisted via `localStorage`
- 📱 **Collapsible sidebar** — icon-only collapse mode on desktop, plus slide-out drawer on mobile
- 📈 **Live Chart.js visualizations** — animated line chart with gradient fill, donut chart with custom legend, Week/Month/Year range switching
- 💳 **Animated stat cards** — staggered entrance, hover elevation, trend indicators
- 🗂️ **Activity feed** — real-time activity log with toast notifications for revenue events
- 🔍 **Functional search bar & notification badge** — built into a glassy, sticky top header
- 📐 **Fully responsive** — gracefully reflows from 4-column desktop to 1-column mobile
- 🔐 **JWT authentication** — secure login/register with bcrypt password hashing
- 📦 **Campaign management** — full CRUD for marketing campaigns with metrics
- 🚦 **Traffic event ingestion** — both real-time WebSocket events and REST API endpoints

<br/>

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js, Express 5 |
| Database | MongoDB with Mongoose |
| Real-time | Socket.IO |
| Auth | JWT + bcrypt |
| Frontend | Vanilla JS, Chart.js 4 |
| Styling | CSS3 with glassmorphism & custom properties |

<br/>

## 📁 Project Structure

```
├── server.js                 # Express app, Socket.IO init, traffic generator
├── package.json
├── .env.example
├── .gitignore
├── Dockerfile
├── services/
│   ├── socketService.js      # Socket.IO server setup & emit helpers
│   └── trafficGenerator.js   # Real-time traffic event generator
├── models/
│   ├── TrafficEvent.js       # Traffic event schema
│   ├── ActivityLog.js        # Activity log schema
│   ├── Campaign.js           # Campaign schema
│   └── User.js               # User schema
├── controllers/
│   ├── analyticsController.js # All analytics endpoints
│   └── authController.js      # Auth endpoints
├── routes/
│   ├── analytics.js
│   └── auth.js
├── middleware/
│   ├── auth.js
│   ├── cache.js
│   ├── errorHandler.js
│   ├── mongoSanitize.js
│   └── validator.js
├── config/
│   ├── env.js
│   └── jwt.js
├── utils/
│   └── appError.js
├── public/
│   ├── index.html
│   ├── dashboard.js
│   └── dashboard.css
├── seed.js                   # Seed script for initial data
├── insights_flutter/         # Flutter mobile app (separate workspace)
└── README.md
```

<br/>

## 📦 Installation & Setup

**Prerequisites:** Node.js 18+, MongoDB

### Local Development

```bash
# 1. Clone the repo
git clone https://github.com/Jai1526/insights-dashboard.git
cd insights-dashboard

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env with your MONGO_URI and JWT_SECRET

# 4. Start the server
npm run dev

# 5. Open in browser
# http://localhost:5000
```

### Deploy to Production

To make the dashboard accessible online with full real-time features:

1. Deploy the backend to a Node.js hosting service (Render, Railway, Fly.io, etc.)
2. Set environment variables (MONGO_URI, JWT_SECRET, etc.)
3. Update `ALLOWED_ORIGINS` in `.env` to include your deployed domain
4. The dashboard will be served at your deployed URL

**Note:** The real-time socket connection and live traffic generation require the backend server to be running. Static hosting alone (GitHub Pages, Netlify) will only show the UI shell without live data.

<br/>

<br/>

## 🔧 Environment Variables

Create a `.env` file in the `backend` directory:

```env
MONGO_URI=mongodb://127.0.0.1:27017/insights_dashboard
PORT=5000
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5000
```

<br/>

## 🎯 How Real-time Works

1. **Server startup:** `server.js` initializes Socket.IO and starts `trafficGenerator.js`
2. **Event generation:** `trafficGenerator.js` creates realistic traffic events every 2-8 seconds (with occasional bursts of 3-6 events)
3. **Persistence:** Events are saved to MongoDB with full context (source, country, device, revenue, etc.)
4. **Broadcasting:** Each event triggers `emitTrafficEvent()` which broadcasts to all connected clients via Socket.IO
5. **Frontend update:** `dashboard.js` receives `traffic_event` messages and instantly appends them to the activity feed and refreshes charts/metrics
6. **Cache bypass:** API cache TTL reduced to 3-10 seconds to ensure near-real-time data accuracy

<br/>

## 📄 License

Licensed under the **MIT License** — free to use, modify, and distribute.

<br/>

<div align="center">

Built with ♥ using Node.js, Express, MongoDB, Socket.IO & vanilla JavaScript.

</div>
