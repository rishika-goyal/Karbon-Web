# 🎨 Karbon AI

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen?style=for-the-badge&logo=github-actions&logoColor=white)]()
[![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge&logo=github)]()
[![Vercel](https://img.shields.io/badge/deployed_on-Vercel-black?style=for-the-badge&logo=vercel&logoColor=white)]()
[![Made with JS](https://img.shields.io/badge/made_with-JavaScript-yellow?style=for-the-badge&logo=javascript&logoColor=white)]()

Karbon AI is a **web app** frontend to generate complete frontend apps via FastAPI. Simply describe your app idea and get working HTML/CSS/JS—all in one click!

---

## 🚀 Features

- **Prompt-based generation** — powered by your FastAPI backend at `https://agentic-ai-wine.vercel.app/generate?q=...`
- **Live preview** in an `iframe`, fully responsive across devices
- **Clean UI** with loading animation & error handling
- Modular structure: `index.html`, `css/styles.css`, `js/script.js`, `assets/loader.html`

---

## 📂 Project Structure

```

karbon-ai-frontend/
├── index.html
├── css/
│   └── styles.css
├── js/
│   └── script.js
├── assets/
│   └── loader.html
└── README.md

````

---

## 📦 Getting Started

1. Clone the repo:
   ```bash
   git clone https://github.com/yourusername/karbon-ai-frontend.git
   cd karbon-ai-frontend
    ````

2. (Optional) Host on GitHub Pages, Vercel, or Netlify — just serve the files statically.

3. Open `index.html` in your browser and start generating!

---

## ⚙️ How It Works

1. User enters a prompt describing the desired frontend app.
2. Click **Generate**, then:

   * Loader animation is shown (`assets/loader.html`).
   * Frontend calls the FastAPI backend via fetch.
3. Backend returns HTML + inline CSS/JS combined.
4. The response is rendered inside the `iframe`.

---

## ✅ Usage Example

Task: `A to-do list app with dark mode`

**Result:** A working HTML/CSS/JS app is generated and rendered directly in the preview pane.

---

## 🧩 Customize It

* Update **styles.css** to tweak or replace the loading spinner.
* Modify **script.js** to add features like input history or error logging.
* Redirect `BASE_URL` to your own deployed backend.

---

![Build Status](https://img.shields.io/badge/build-passing-brightgreen?style=for-the-badge&logo=github-actions)



## 🔗 Contributing & License

Contributions welcome! Simply fork, edit, and submit a PR.
Licensed under the **MIT License**. See the badge above.

---

Enjoy creating with **Karbon AI**!

---

*Generated with love and JavaScript 💛*

[1]: https://shields.io/?utm_source=chatgpt.com "Shields.io"
[2]: https://github.com/alexandresanlim/Badges4-README.md-Profile?utm_source=chatgpt.com "Welcome! Badges 4 README.md Profile - GitHub"
[3]: https://shields.io/badges?utm_source=chatgpt.com "Static Badge - Shields.io"
