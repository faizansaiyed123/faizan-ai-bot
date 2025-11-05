const API_URL = "https://faizan-bot-worker.fai1ggj.workers.dev/";

const chatBox = document.getElementById("chat-box");
const input = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");

// Generate a simple user ID for conversation continuity
const userId = localStorage.getItem("userId") || `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
localStorage.setItem("userId", userId);

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

function addResumeDownloadButton() {
  const btnContainer = document.createElement("div");
  btnContainer.classList.add("message", "bot");
  btnContainer.style.display = "flex";
  btnContainer.style.alignItems = "center";
  btnContainer.style.gap = "10px";

  const downloadBtn = document.createElement("button");
  downloadBtn.textContent = "📄 Download Resume";
  downloadBtn.classList.add("resume-download-btn");
  downloadBtn.style.cssText = `
    background: linear-gradient(90deg, #10b981, #059669);
    border: none;
    padding: 10px 16px;
    border-radius: 8px;
    cursor: pointer;
    color: white;
    font-weight: 600;
    font-size: 14px;
    transition: all 0.3s ease;
    box-shadow: 0 2px 6px rgba(16, 185, 129, 0.3);
  `;

  downloadBtn.addEventListener("mouseenter", () => {
    downloadBtn.style.background = "linear-gradient(90deg, #059669, #047857)";
    downloadBtn.style.transform = "scale(1.05)";
  });

  downloadBtn.addEventListener("mouseleave", () => {
    downloadBtn.style.background = "linear-gradient(90deg, #10b981, #059669)";
    downloadBtn.style.transform = "scale(1)";
  });

  downloadBtn.addEventListener("click", async () => {
    downloadBtn.textContent = "⏳ Downloading...";
    downloadBtn.disabled = true;

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ downloadResume: true }),
      });

      if (!response.ok) {
        throw new Error("Failed to download resume");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Faizan_Saiyed_Resume.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      downloadBtn.textContent = "✅ Downloaded!";
      setTimeout(() => {
        downloadBtn.textContent = "📄 Download Again";
        downloadBtn.disabled = false;
      }, 2000);
    } catch (err) {
      console.error("Resume download error:", err);
      downloadBtn.textContent = "❌ Download Failed";
      setTimeout(() => {
        downloadBtn.textContent = "📄 Try Again";
        downloadBtn.disabled = false;
      }, 2000);
    }
  });

  btnContainer.appendChild(downloadBtn);
  chatBox.appendChild(btnContainer);
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
      body: JSON.stringify({ 
        message: userText,
        userId: userId 
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    typingMsg.remove();
    
    addMessage(data.reply || "Sorry, I couldn't understand that.", "bot");
    
    // If resume download is available, show the download button
    if (data.showResumeDownload) {
      addResumeDownloadButton();
    }
  } catch (err) {
    console.error("Chat error:", err);
    typingMsg.remove();
    addMessage("⚠️ Error connecting to Faizan's AI. Try again.", "bot");
  }
}

sendBtn.addEventListener("click", sendMessage);
input.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});

// Welcome message on load
window.addEventListener("load", () => {
  setTimeout(() => {
    addMessage("Hi! I'm Faizan's AI assistant. Feel free to ask me anything about Faizan's skills, projects, or experience! 😊", "bot");
  }, 500);
});