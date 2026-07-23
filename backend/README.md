<div align="center">

# 📊 The Insights Dashboard

### A stunning, glass-paneled analytics dashboard with live charts, dark mode, and buttery-smooth interactions

*Your data deserves better than boring bar charts — this dashboard turns raw metrics into a frosted-glass command center.*

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Chart.js](https://img.shields.io/badge/Chart.js-FF6384?style=for-the-badge&logo=chartdotjs&logoColor=white)](https://www.chartjs.org/)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![No Dependencies](https://img.shields.io/badge/dependencies-vanilla-success?style=flat-square)](#)
[![Responsive](https://img.shields.io/badge/design-responsive-blueviolet?style=flat-square)](#)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](#)

</div>

<br/>

## 🔗 Live Demo

> **[Live Demo →](#)** *(paste your GitHub Pages link here, e.g. `https://your-username.github.io/insights-dashboard/`)*

<br/>

## ✨ Overview

The Insights Dashboard is a fully interactive analytics UI built entirely with **vanilla HTML, CSS, and JavaScript** — no frameworks, no build step. It combines a **Glassmorphic Neumorphism** aesthetic (frosted glass panels, soft depth shadows, smooth gradients) with real, functioning data visualizations powered by Chart.js, a collapsible sidebar, and a fully working light/dark theme toggle.

<br/>

## 🚀 Features

- 🎨 **Dual theme system** — smooth light/dark mode toggle using CSS custom properties, with theme preference saved via `localStorage`
- 📱 **Collapsible sidebar navigation** — icon-only collapse mode on desktop, plus a slide-out drawer with backdrop overlay on mobile
- 📈 **Live Chart.js visualizations** — an animated, gradient-filled line chart (Traffic Overview) with Week/Month/Year range switching, and a donut chart (Traffic Sources) with a custom legend
- 💳 **Animated stat cards** — staggered entrance animation, hover elevation, and up/down trend indicators
- 🗂️ **Recent Activity feed** — a timeline panel showing live-style activity events with status icons
- 🏆 **Top Performers panel** — a leaderboard list with conic-gradient circular progress rings
- 🔍 **Functional search bar & notification badge** built into a glassy, sticky top header
- 📐 **Fully responsive layout** — 4-column stat grid gracefully reflows to 2-column and 1-column on tablet/mobile, with the sidebar collapsing into an off-canvas drawer

<br/>

## 📁 Project Structure

```
├── dashboard.html   # Markup, layout structure & Chart.js CDN import
├── dashboard.css    # Glassmorphic theming, layout grids & responsive breakpoints
├── dashboard.js     # Theme toggle, sidebar logic & Chart.js initialization
└── README.md
```

<br/>

## 🛠️ Installation & Setup

Get it running locally in three steps — no dependencies to install.

**1. Clone the repository**
```bash
git clone https://github.com/your-username/insights-dashboard.git
cd insights-dashboard
```

**2. Serve the folder locally** *(recommended, avoids local file/CORS quirks with the Chart.js CDN)*
```bash
python3 -m http.server 8080
# or
npx serve .
```

**3. Open it in your browser**
```
http://localhost:8080/dashboard.html
```

> You can also just double-click `dashboard.html` to open it directly — it works standalone too.

<br/>

## 🎨 Customization

The entire color system, spacing scale, and corner radii live in CSS custom properties at the top of `dashboard.css`. Edit these to instantly retheme the whole dashboard:

```css
:root {
  --accent: #7c6cff;      /* primary accent color  */
  --accent-2: #43d9ad;    /* secondary accent color */
  --radius-lg: 22px;      /* corner radius scale    */
}
```

<br/>

## 🌐 Browser Support

| Browser | Supported |
|---|---|
| Chrome / Edge (Chromium) | ✅ |
| Firefox | ✅ |
| Safari 16+ | ✅ |
| Mobile Safari / Chrome Android | ✅ |

<br/>

## 📄 License

Licensed under the **MIT License** — free to use, modify, and distribute for personal or commercial projects.

<br/>

<div align="center">

Built with ♥ using nothing but HTML, CSS & JavaScript.

</div>