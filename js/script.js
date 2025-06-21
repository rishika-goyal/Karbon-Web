const BASE_URL = "https://agentic-ai-wine.vercel.app";

document.getElementById("generateBtn").addEventListener("click", async () => {
  const taskInput = document.getElementById("task");
  const iframe = document.getElementById("preview");
  const errorDiv = document.getElementById("error");

  const task = taskInput.value.trim();
  if (!task) {
    errorDiv.textContent = "Please enter a description for your frontend app.";
    return;
  }

  errorDiv.textContent = "";

  // Show loader from loader.html
  try {
    const loaderHtml = await fetch("assets/loader.html").then(res => res.text());
    iframe.srcdoc = loaderHtml;
  } catch {
    iframe.srcdoc = "<p style='padding:2rem;text-align:center;'>Loading...</p>";
  }

  try {
    const res = await fetch(`${BASE_URL}/generate?q=${encodeURIComponent(task)}`);
    const data = await res.json();

    if (!res.ok || !data.code) {
      throw new Error("Failed to generate code.");
    }

    iframe.srcdoc = data.code;
  } catch (err) {
    errorDiv.textContent = "Something went wrong. Please try again.";
    console.error(err);
    iframe.srcdoc = ""; // Clear preview on error
  }
});
