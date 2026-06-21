const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");
const crypto = require("crypto");
const path = require("path");
 
const app = express();
const PORT = process.env.PORT || 3000;
 
app.use(cors());
app.use(express.json());
 
// Serve the frontend folder as static files
app.use(express.static(path.join(__dirname, "frontend")));
 
// -------------------------------------------
// MAIN ENDPOINT: Check password exposure
// -------------------------------------------
app.post("/api/check-password", async (req, res) => {
  try {
    const { password } = req.body;
 
    if (!password || typeof password !== "string") {
      return res.status(400).json({ error: "Password is required" });
    }
 
    // STEP 1: Hash the password using SHA-1 (required format for this API)
    const sha1Hash = crypto
      .createHash("sha1")
      .update(password, "utf8")
      .digest("hex")
      .toUpperCase();
 
    const prefix = sha1Hash.slice(0, 5); // first 5 chars sent to HIBP
    const suffix = sha1Hash.slice(5);    // rest stays only on our server
 
    // STEP 2: Call the free, keyless HIBP Pwned Passwords range API
    const url = `https://api.pwnedpasswords.com/range/${prefix}`;
    const response = await fetch(url, {
      headers: {
        // HIBP recommends (and sometimes requires) a User-Agent header
        "User-Agent": "PassCheck-Hackathon-Project"
      }
    });
 
    if (!response.ok) {
      throw new Error(`HIBP API returned status ${response.status}`);
    }
 
    const text = await response.text();
 
    // STEP 3: Search locally for our suffix among the returned hashes
    // Each line looks like: SUFFIX:COUNT
    const lines = text.split("\n");
    let breachCount = 0;
    let found = false;
 
    for (const line of lines) {
      const [lineSuffix, lineCount] = line.trim().split(":");
      if (lineSuffix === suffix) {
        found = true;
        breachCount = parseInt(lineCount, 10) || 0;
        break;
      }
    }
 
    // STEP 4: Calculate a simple password strength score (separate from breach check)
    const strength = calculateStrength(password);
 
    res.json({
      breached: found,
      breachCount,
      strength
    });
  } catch (err) {
    console.error("Password check error:", err.message);
    res.status(500).json({ error: "Failed to check password right now. Please try again." });
  }
});
 
// -------------------------------------------
// Simple rule-based password strength calculator
// (Runs entirely on our server, no external API needed)
// -------------------------------------------
function calculateStrength(password) {
  let score = 0;
  const feedback = [];
 
  if (password.length >= 8) score++;
  else feedback.push("Use at least 8 characters");
 
  if (password.length >= 12) score++;
 
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  else feedback.push("Mix uppercase and lowercase letters");
 
  if (/[0-9]/.test(password)) score++;
  else feedback.push("Add at least one number");
 
  if (/[^a-zA-Z0-9]/.test(password)) score++;
  else feedback.push("Add a special character (!@#$ etc.)");
 
  const labels = ["Very Weak", "Weak", "Fair", "Good", "Strong", "Very Strong"];
  const label = labels[score] || "Very Weak";
 
  return { score, maxScore: 5, label, feedback };
}
 
// -------------------------------------------
// Start server
// -------------------------------------------
app.listen(PORT, () => {
  console.log(`✅ PassCheck server running at http://localhost:${PORT}`);
});