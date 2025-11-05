const API_URL = "https://faizan-bot-worker.fai1ggj.workers.dev/"

const chatBox = document.getElementById("chat-box");
const input = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");

function addMessage(text, sender) {
  const msg = document.createElement("div");
  msg.classList.add("message", sender);

  // 🧹 Clean up any encoded or malformed HTML first
  let cleanText = text
    // Remove any HTML tags
    .replace(/<\/?[^>]+(>|$)/g, "")
    // Decode URL-encoded characters
    .replace(/%3C/g, "<")
    .replace(/%3E/g, ">")
    .replace(/%20/g, " ")
    .replace(/%22/g, '"')
    // Decode HTML entities
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    // Remove any trailing encoded tags from URLs
    .replace(/(https?:\/\/[^\s]+?)(%3C[^%]*%3E|<[^>]*>)/gi, "$1");

  // 1️⃣ Convert markdown-style bold **text**
  let html = cleanText.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

  // 2️⃣ Convert markdown links [label](url)
  html = html.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
  );

  // 3️⃣ Convert plain URLs (but not ones already in href attributes)
  html = html.replace(
    /(?<!href="|">)(https?:\/\/[^\s<>"]+)/g,
    '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
  );

  // 4️⃣ Convert line breaks to <br>
  html = html.replace(/\n/g, '<br>');

  msg.innerHTML = html;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}

async function sendMessage() {
  const userText = input.value.trim();
  if (!userText) return;

  addMessage(userText, "user");
  input.value = "";

  addMessage("Typing...", "bot");

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userText }),
    });

    const data = await response.json();
    document.querySelector(".bot:last-child").remove();
    addMessage(data.reply || "Sorry, I couldn't understand that.", "bot");
  } catch (err) {
    document.querySelector(".bot:last-child").remove();
    addMessage("⚠️ Error connecting to Faizan's AI. Try again.", "bot");
  }
}

sendBtn.addEventListener("click", sendMessage);
input.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});