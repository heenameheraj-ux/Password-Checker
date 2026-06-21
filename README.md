# Password-Checker
Password Checker 
🔒 PassCheck — Is Your Password Safe?

A web app that checks whether your password has appeared in known data breaches — without ever sending your actual password over the internet.

Built for the Creative Showcase Hackathon under the Cybersecurity theme.


 The Problem

Every year, companies get hacked and millions of passwords leak online. If you've ever reused a password across multiple sites, you might be exposed right now without knowing it. Most people have no easy way to check this.

✅ The Solution

PassCheck lets anyone type a password and instantly find out:


Has this exact password ever leaked in a known data breach? (and how many times)
How strong is this password, based on length and character variety?


All of this happens without your real password ever leaving our server — see "Privacy & Security" below for exactly how.

🌟 Features


✅ Check any password against a database of known data breaches (free Have I Been Pwned Pwned Passwords API)
✅ Privacy-safe k-anonymity model — your password is never sent in full to any external service
✅ Built-in password strength meter with actionable feedback
✅ Clean, responsive dashboard UI
✅ Educational "How It Works" section explaining the privacy method in plain English
✅ Quick safety tips section



🔐 Privacy & Security — How It Actually Works

This is the most important part of the project, so here it is in detail:


You type a password into the browser.
The browser sends it to our own backend (never to a third party directly).
Our backend converts the password into a SHA-1 hash — a scrambled, irreversible code.
We take only the first 5 characters of that hash and send just those to the Have I Been Pwned API.
HIBP responds with a list of hundreds of possible hash suffixes that share that same 5-character prefix — not just ours.
Our backend checks locally whether our specific hash is among that list.
If found, the API also tells us how many breaches contained that exact password.


Because HIBP only ever receives a 5-character prefix shared by hundreds of other unrelated passwords, it has no way of knowing which exact password you searched for. This technique is called k-anonymity, and it's the same privacy method used by major password managers and web browsers.

We never log, store, or save any password you type — checked or not.


🛠️ Tech Stack


Backend: Node.js + Express
Frontend: Plain HTML, CSS, JavaScript (no framework needed)
External API: Have I Been Pwned — Pwned Passwords API (free, no API key required)