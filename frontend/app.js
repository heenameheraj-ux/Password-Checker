const passwordInput = document.getElementById("passwordInput");
const checkBtn = document.getElementById("checkBtn");
const toggleVisibility = document.getElementById("toggleVisibility");
const resultBox = document.getElementById("resultBox");
const strengthBox = document.getElementById("strengthBox");
 
// Smooth-scroll nav links
document.querySelectorAll(".nav-link").forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    document.querySelectorAll(".nav-link").forEach((l) => l.classList.remove("active"));
    link.classList.add("active");
    const targetId = link.getAttribute("href").slice(1);
    document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth" });
  });
});
 
// Show/hide password text
toggleVisibility.addEventListener("click", () => {
  passwordInput.type = passwordInput.type === "password" ? "text" : "password";
});
 
// Allow pressing Enter to check
passwordInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") checkPassword();
});
 
checkBtn.addEventListener("click", checkPassword);
 
async function checkPassword() {
  const password = passwordInput.value;
 
  if (!password) {
    showResult("Please enter a password first.", "danger");
    return;
  }
 
  checkBtn.disabled = true;
  checkBtn.textContent = "Checking...";
 
  try {
    const res = await fetch("/api/check-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password })
    });
 
    if (!res.ok) throw new Error("Request failed");
 
    const data = await res.json();
    renderResult(data);
    renderStrength(data.strength);
  } catch (err) {
    showResult("Something went wrong. Please try again in a moment.", "danger");
  } finally {
    checkBtn.disabled = false;
    checkBtn.textContent = "Check Password";
  }
}
 
function renderResult(data) {
  if (data.breached) {
    showResult(
      `⚠️ This password has appeared in ${data.breachCount.toLocaleString()} known data breach(es). Stop using it immediately, especially anywhere else.`,
      "danger",
      "Compromised Password!"
    );
  } else {
    showResult(
      `This exact password wasn't found in any known breach database. That doesn't guarantee it's strong — just that it hasn't leaked (yet).`,
      "safe",
      "Not Found in Breaches"
    );
  }
}
 
function showResult(message, type, title) {
  resultBox.classList.remove("hidden", "result-safe", "result-danger");
  resultBox.classList.add(type === "safe" ? "result-safe" : "result-danger");
  resultBox.innerHTML = title
    ? `<strong>${title}</strong>${message}`
    : message;
}
 
function renderStrength(strength) {
  if (!strength) return;
 
  strengthBox.classList.remove("hidden");
 
  const percent = (strength.score / strength.maxScore) * 100;
  const colors = ["#ff5d5d", "#ff5d5d", "#ffb547", "#ffb547", "#3ddc97", "#3ddc97"];
  const barColor = colors[strength.score] || "#ff5d5d";
 
  let feedbackHtml = "";
  if (strength.feedback.length > 0) {
    feedbackHtml = `<ul class="strength-feedback">${strength.feedback
      .map((f) => `<li>• ${f}</li>`)
      .join("")}</ul>`;
  }
 
  strengthBox.innerHTML = `
    <div class="strength-label">Password Strength: ${strength.label}</div>
    <div class="strength-bar-track">
      <div class="strength-bar-fill" style="width:${percent}%; background:${barColor};"></div>
    </div>
    ${feedbackHtml}
  `;
}
 