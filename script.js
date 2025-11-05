const API_URL = "https://faizan-bot-worker.fai1ggj.workers.dev/";

const chatBox = document.getElementById("chat-box");
const input = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");

function addMessage(text, sender) {
  const msg = document.createElement("div");
  msg.classList.add("message", sender);

  let cleanText = text
    .replace(/<\/?[^>]+(>|$)/g, "")
    .replace(/%3C/g, "<")
    .replace(/%3E/g, ">")
    .replace(/%20/g, " ")
    .replace(/%22/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"');

  let html = cleanText.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
  html = html.replace(/(?<!href="|">)(https?:\/\/[^\s<>"]+)/g, '<a href="$1" target="_blank">$1</a>');
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

  // Typing animation
  const typingMsg = document.createElement("div");
  typingMsg.classList.add("message", "bot");
  typingMsg.innerHTML = "Typing...";
  chatBox.appendChild(typingMsg);
  chatBox.scrollTop = chatBox.scrollHeight;

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userText }),
    });

    const data = await response.json();
    typingMsg.remove();
    addMessage(data.reply || "Sorry, I couldn't understand that.", "bot");
  } catch (err) {
    typingMsg.remove();
    addMessage("⚠️ Error connecting to Faizan's AI. Try again.", "bot");
  }
}

sendBtn.addEventListener("click", sendMessage);
input.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});