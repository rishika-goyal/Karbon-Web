const BASE_URL = "https://karbon-web.netlify.app";

const generateBtn = document.getElementById("generateBtn");
const taskInput = document.getElementById("task");
const iframe = document.getElementById("preview");
const errorDiv = document.getElementById("error");

const showCodeToggle = document.getElementById("showCodeToggle");
const copyCodeBtn = document.getElementById("copyCodeBtn");
const downloadCodeBtn = document.getElementById("downloadCodeBtn");

const historySelect = document.getElementById("historySelect");
const appThemeToggle = document.getElementById("appThemeToggle");

let latestCode = "";

const HISTORY_KEY = "karbon_history";
const THEME_KEY = "karbon_theme";

loadTheme();
loadHistoryDropdown();

generateBtn.addEventListener("click", async () => {
  const task = taskInput.value.trim();
  if (!task) {
    errorDiv.textContent = "⚠️ Please enter a description for your frontend app.";
    return;
  }

  errorDiv.textContent = "";
  generateBtn.disabled = true;
  latestCode = "";
  copyCodeBtn.disabled = true;
  downloadCodeBtn.disabled = true;

  try {
    iframe.srcdoc = "<p style='padding:2rem;text-align:center;'>Loading...</p>";

    const response = await fetch(`${BASE_URL}/generate?q=${encodeURIComponent(task)}`);
    const contentType = response.headers.get("content-type") || "";

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    if (!contentType.includes("application/json")) throw new Error("Unexpected response format");

    const data = await response.json();
    if (!data.code) throw new Error("No code returned from server.");

    latestCode = data.code;
    copyCodeBtn.disabled = false;
    downloadCodeBtn.disabled = false;

    updateIframeView();
    storeHistory(task, latestCode);
  } catch (err) {
    console.error("Generation error:", err);
    iframe.srcdoc = "";
    errorDiv.textContent = "❌ Something went wrong. Please try again.";
  } finally {
    generateBtn.disabled = false;
  }
});

showCodeToggle.addEventListener("change", updateIframeView);
appThemeToggle.addEventListener("change", toggleTheme);
historySelect.addEventListener("change", () => {
  const val = historySelect.value;
  if (!val) return;
  const history = JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
  const item = history.find(h => h.timestamp === val);
  if (item) {
    taskInput.value = item.prompt;
    latestCode = item.code;
    copyCodeBtn.disabled = false;
    downloadCodeBtn.disabled = false;
    updateIframeView();
  }
});

function updateIframeView() {
  if (!latestCode) return;

  const isDark = appThemeToggle.checked;

  if (showCodeToggle.checked) {
    const escaped = latestCode
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    iframe.srcdoc = `
      <style>
        body {
          font-family: monospace;
          padding: 1rem;
          background: ${isDark ? '#1e1e1e' : '#f7f7f7'};
          color: ${isDark ? '#ddd' : '#333'};
          white-space: pre-wrap;
        }
        code {
          display: block;
          background: ${isDark ? '#2d2d2d' : '#eee'};
          padding: 1rem;
          border-radius: 6px;
          overflow-x: auto;
        }
      </style>
      <code>${escaped}</code>
    `;
  } else {
    iframe.srcdoc = isDark
      ? `<html><body style="background:#1e1e1e;color:#ddd;">${latestCode}</body></html>`
      : latestCode;
  }
}

copyCodeBtn.addEventListener("click", () => {
  if (!latestCode) return;
  navigator.clipboard.writeText(latestCode)
    .then(() => {
      copyCodeBtn.textContent = "Copied!";
      setTimeout(() => (copyCodeBtn.textContent = "Copy Code"), 2000);
    })
    .catch(() => alert("❌ Failed to copy code."));
});

downloadCodeBtn.addEventListener("click", () => {
  if (!latestCode) return;
  const blob = new Blob([latestCode], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "karbon-generated.html";
  a.click();
  URL.revokeObjectURL(url);
});

function storeHistory(prompt, code) {
  const history = JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
  const entry = {
    timestamp: Date.now().toString(),
    prompt,
    code
  };
  const updated = [entry, ...history.slice(0, 4)];
  localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  loadHistoryDropdown();
}

function loadHistoryDropdown() {
  const history = JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
  historySelect.innerHTML = '<option value="">⏳ History</option>';
  history.forEach(h => {
    const option = document.createElement("option");
    option.value = h.timestamp;
    option.textContent = h.prompt.slice(0, 40);
    historySelect.appendChild(option);
  });
}

function toggleTheme() {
  const isDark = appThemeToggle.checked;
  document.body.classList.toggle("dark", isDark);
  localStorage.setItem(THEME_KEY, isDark ? "dark" : "light");
  updateIframeView();
}

function loadTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  const isDark = saved === "dark";
  document.body.classList.toggle("dark", isDark);
  appThemeToggle.checked = isDark;
}
