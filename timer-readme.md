# 📚 UPHSD Molino Campus — Exam Timer

> **University of Perpetual Help System DALTA – Molino Campus**  
> College of Computer Studies  
> *Character Building is Nation Building*

---

## 📋 Overview

A fully-featured, browser-based **Exam Timer** for use by faculty of the College of Computer Studies. Inspired by the MathsStarters Exam Timer, styled with the UPHSD Molino Campus brand palette (navy blue and gold), and built as a clean, maintainable static web application suitable for hosting on **GitHub Pages**.

---

## 🗂 Project Structure

```
exam-timer/
├── index.html          ← Main HTML entry point
├── css/
│   └── styles.css      ← All styles (design tokens, layout, components, responsive, dark mode)
├── js/
│   └── timer.js        ← All JavaScript logic (state, engine, UI, storage)
└── README.md           ← This file
```

---

## ✨ Features

| Feature | Description |
|---|---|
| ▶️ Start / ⏸ Pause / 🔄 Reset | Full timer control buttons |
| ⚙️ Setup Modal | Configure exam title, duration, reading time, and display options |
| 🕐 Reading Time Phase | Optional reading period before the exam countdown begins |
| 📋 Exam Instructions | Editable on-screen instructions (toggled in Setup) |
| 🔔 Time Expired Overlay | Full-screen alert with audio alarm when time runs out |
| ⏰ Auto-Start | Schedule the timer to start automatically at a set time |
| 🌙 Dark / ☀️ Light Theme | Toggle with persistence via `localStorage` |
| 💾 Persistent Settings | All settings saved to `localStorage` across reloads |
| ⌨️ Keyboard Shortcuts | Space/Enter (Start/Pause), R (Reset), S (Setup), D (Dark), Esc (Dismiss) |
| ⚠️ Visual Warnings | Amber pulse under 5 min; red flash under 1 min |
| ♿ Accessible | ARIA roles, labels, live regions, and keyboard navigation |
| 📱 Responsive | Adapts gracefully to mobile, tablet, and desktop screens |

---

## 🚀 GitHub Pages Deployment

1. Push this folder to the **root** of a GitHub repository (or a `/docs` folder).
2. Go to **Settings → Pages** in your repository.
3. Under **Source**, select:
   - Branch: `main` (or `master`)
   - Folder: `/ (root)` (or `/docs` if placed there)
4. Click **Save**.
5. Your timer will be live at:  
   `https://<your-username>.github.io/<repository-name>/`

---

## 🎨 Brand / Theme

The color palette mirrors the **UPHSD Molino Campus** website:

| Token | Value | Usage |
|---|---|---|
| `--color-brand-navy` | `#1B3A6B` | Header, card accent, headings |
| `--color-brand-gold` | `#F5A623` | Accent, badge, expired icon |
| `--color-start` | `#217A3C` | Start time display, Start button |
| `--color-finish` | `#C0392B` | Finish time display |

---

## 🖥️ Browser Support

Works in all modern browsers (Chrome, Firefox, Edge, Safari).  
Requires JavaScript enabled.

---

## ⚠️ Disclaimer

Like any technology, things can go wrong. Do not solely rely on this exam timer; ensure you have a backup/alternative. The University of Perpetual Help System DALTA – Molino Campus takes no responsibility for the impact a problem with the Exam Timer may have on an examination.

---

*© University of Perpetual Help System DALTA – Molino Campus*  
*Molino Road, Molino III, City of Bacoor, Cavite 4102*