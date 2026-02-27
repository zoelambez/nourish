# ✦ NourishAI — Your Personal Food Guide

A beautifully designed, fully personalized nutrition guide app built with React. No backend, no API keys, no subscriptions — just answer a few questions and get a precision food focus plan built for your body.

![NourishAI](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react) ![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat&logo=vite) ![No API keys](https://img.shields.io/badge/No%20API%20keys-required-4ade80?style=flat)

---

## What it does

NourishAI takes a short quiz about your body, goals, hormones, and food sensitivities — then generates a fully personalized food focus guide including:

- **BMI calculation** with visual scale and category
- **Calorie target** calculated from your BMR + activity level (Mifflin-St Jeor formula)
- **Macro split** (protein / fat / carbs) tailored to your diet style and goals
- **Specific daily quantities** — e.g. *"42g protein/day · 25% of your 1550 kcal"*
- **Cycle-phase nutrition** for menstrual, follicular, ovulation, and luteal phases
- **PMDD, PCOS, thyroid, endometriosis** awareness built in
- **FODMAP filtering** — removes your specific triggers from all food suggestions
- **Histamine intolerance**, salicylates, oxalates, and more
- **Dietary styles**: keto, carnivore, plant-based, high protein, Mediterranean, paleo, intermittent fasting
- **Saved profiles** via localStorage — reload any past profile instantly
- **Dynamic theming** — the app's colors shift based on your cycle phase and diet style

---

## Tech stack

- **React 18** + hooks
- **Vite 5** for bundling
- **Zero external dependencies** — no UI library, no state manager, no CSS framework
- All styles injected dynamically, Google Fonts loaded via `@import`
- Profiles saved to `localStorage`

---

## Getting started

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/nourish-ai.git
cd nourish-ai
```

### 2. Install dependencies

```bash
npm install
```

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### 4. Build for production

```bash
npm run build
```

---

## Deploy to Vercel (free, one click)

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) and sign in with GitHub
3. Click **"Add New Project"** → select this repo
4. Click **Deploy** — that's it

Vercel auto-detects Vite and deploys correctly with zero configuration.

---

## Project structure

```
nourish-ai/
├── public/
│   └── favicon.svg
├── src/
│   ├── App.jsx        ← entire app lives here
│   └── main.jsx       ← React entry point
├── index.html
├── package.json
├── vite.config.js
└── .gitignore
```

---

## Disclaimer

NourishAI is an educational tool and does not constitute medical or dietary advice. Always consult a registered dietitian or healthcare professional for clinical nutrition guidance.

---

*Built with ✦ and a lot of care for anyone trying to understand what their body actually needs.*
