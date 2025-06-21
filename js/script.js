const BASE_URL = "https://agentic-ai-wine.vercel.app";

const generateBtn = document.getElementById("generateBtn");
const taskInput = document.getElementById("task");
const iframe = document.getElementById("preview");
const errorDiv = document.getElementById("error");

generateBtn.addEventListener("click", async () => {
  const task = taskInput.value.trim();

  if (!task) {
    errorDiv.textContent = "⚠️ Please enter a description for your frontend app.";
    return;
  }

  errorDiv.textContent = "";
  generateBtn.disabled = true;

  try {
    // Load loading animation or fallback text
    try {
      const loaderHtml = await fetch("components/loader.html").then(res => res.text());
      iframe.srcdoc = loaderHtml;
    } catch {
      iframe.srcdoc = "<p style='padding:2rem;text-align:center;'>Loading...</p>";
    }

    const response = await fetch(`${BASE_URL}/generate?q=${encodeURIComponent(task)}`);
    const contentType = response.headers.get("content-type") || "";

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    if (!contentType.includes("application/json")) {
      throw new Error("Unexpected response format");
    }

    const data = await response.json();

    if (!data.code) {
      throw new Error("No code returned from server.");
    }

    iframe.srcdoc = data.code;
  } catch (err) {
    console.error("Generation error:", err);
    iframe.srcdoc = ""; // Clear preview
    errorDiv.textContent = "❌ Something went wrong. Please try again.";
  } finally {
    generateBtn.disabled = false;
  }
});
