const API_URL = "https://faizan-bot-worker.fai1ggj.workers.dev/"

const chatBox = document.getElementById("chat-box");
const input = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");

function addMessage(text, sender) {
  const msg = document.createElement("div");
  msg.classList.add("message", sender);

  // --- Decode any accidental HTML entities like %3C/a%3E ---
  try {
    text = decodeURIComponent(text);
  } catch (_) {
    // if it’s not URI-encoded, ignore
  }

  // --- Convert markdown links [text](url) ---
  let html = text.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
  );

  // --- Convert plain URLs ---
  html = html.replace(
    /(?<!href=")(https?:\/\/[^\s]+)/g,
    '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
  );

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
    addMessage(data.reply || "Sorry, I couldn’t understand that.", "bot");
  } catch (err) {
    document.querySelector(".bot:last-child").remove();
    addMessage("⚠️ Error connecting to Faizan's AI. Try again.", "bot");
  }
}

sendBtn.addEventListener("click", sendMessage);
input.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});