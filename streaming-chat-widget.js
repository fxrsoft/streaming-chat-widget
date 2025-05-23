const DEFAULT_CONFIG = {
  chatId: "",
  // Required - identifies which assistant to use
  sessionEndpointUrl: "",
  // Required - URL for backend to initialize session
  backendStreamUrl: "",
  // Required - URL for backend to stream messages
  theme: {
    primaryColor: "#2563eb",
    // Main theme color (button, header, etc)
    secondaryColor: "#1e40af",
    // Secondary color (user avatar)
    userMessageBg: "#dbeafe",
    // User message background
    userMessageText: "#1e40af",
    // User message text
    botMessageBg: "#f3f4f6",
    // Bot message background
    botMessageText: "#1f2937",
    // Bot message text
    systemMessageBg: "#f3f4f6",
    // System message background
    systemMessageText: "#4b5563"
    // System message text
  },
  size: {
    width: "380px",
    // Widget width
    height: "550px",
    // Widget height
    buttonSize: "60px"
    // Chat button size
  },
  position: {
    bottom: "20px",
    // Distance from bottom
    right: "20px"
    // Distance from right
  },
  text: {
    headerTitle: "Chat Support",
    welcomeMessage: "Welcome! How can I help you today?",
    inputPlaceholder: "Type your message...",
    connectionError: "Connection error. Please try again later.",
    sendError: "Failed to send message. Please try again."
  },
  icons: {
    // Default chat button icon
    chatButton: '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>',
    // Default user avatar icon
    userAvatar: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="7" r="4"></circle><path d="M12 11c-2.21 0-4 1.79-4 4v5h8v-5c0-2.21-1.79-4-4-4z"></path></svg>',
    // Default bot avatar icon
    botAvatar: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="5"></circle><path d="M20 21v-2a7 7 0 0 0-14 0v2"></path></svg>',
    // Default send button icon
    sendButton: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>'
  },
  predefinedQuestions: {
    enabled: false,
    position: "top",
    // 'top', 'bottom', or 'welcome'
    style: "button",
    // 'button' or 'pill'
    questions: [
      // Examples:
      // { text: "What are your business hours?", value: "What are your business hours?" },
      // { text: "How do I reset my password?", value: "I need help resetting my password" }
    ],
    buttonColor: "#3b82f6",
    // Background color
    textColor: "#ffffff",
    // Text color
    hoverColor: "#2563eb",
    // Color on hover
    hideAfterSelection: false
    // Whether to hide buttons after a selection
  },
  sanitization: {
    input: "basic",
    // 'none', 'basic', or 'strict'
    output: true
    // Whether to sanitize received messages
  }
};
function darkenColor(hex, percent) {
  hex = hex.replace(/^#/, "");
  let r = parseInt(hex.substring(0, 2), 16);
  let g = parseInt(hex.substring(2, 4), 16);
  let b = parseInt(hex.substring(4, 6), 16);
  r = Math.floor(r * (100 - percent) / 100);
  g = Math.floor(g * (100 - percent) / 100);
  b = Math.floor(b * (100 - percent) / 100);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}
function mergeConfig(defaults, custom) {
  const merged = JSON.parse(JSON.stringify(defaults));
  for (const key in custom) {
    if (custom.hasOwnProperty(key)) {
      if (typeof custom[key] === "object" && custom[key] !== null && typeof merged[key] === "object" && merged[key] !== null && !Array.isArray(custom[key])) {
        merged[key] = mergeConfig(merged[key], custom[key]);
      } else {
        merged[key] = custom[key];
      }
    }
  }
  return merged;
}
function isUrl(str) {
  if (typeof str !== "string") return false;
  try {
    return str.startsWith("http://") || str.startsWith("https://") || str.startsWith("data:") || /^(www\.)[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)$/i.test(str);
  } catch (e) {
    return false;
  }
}
function parseIconConfig(str) {
  if (typeof str !== "string") return null;
  try {
    const config = JSON.parse(str);
    if (config && typeof config === "object" && config.url) {
      return config;
    }
    return null;
  } catch (e) {
    return null;
  }
}
function createIconElement(iconContent, size = null) {
  if (!iconContent) return "";
  const iconConfig = parseIconConfig(iconContent);
  if (iconConfig) {
    const width = iconConfig.size || size || "24";
    const height = iconConfig.size || size || "24";
    let styles = `max-width: 100%; height: auto;`;
    return `<img src="${iconConfig.url}" width="${width.replace("px", "")}" height="${height.replace("px", "")}" alt="Icon" style="${styles}">`;
  }
  if (isUrl(iconContent)) {
    const width = size || "24";
    const height = size || "24";
    return `<img src="${iconContent}" width="${width.replace("px", "")}" height="${height.replace("px", "")}" alt="Icon" style="max-width: 100%; height: auto;">`;
  }
  return iconContent;
}
function createWidgetElements(ctx) {
  const { config, namespace, elements } = ctx;
  const chatButton = document.createElement("button");
  chatButton.id = `${namespace}-button`;
  chatButton.className = `${namespace}-button`;
  chatButton.innerHTML = createIconElement(config.icons.chatButton);
  document.body.appendChild(chatButton);
  elements.chatButton = chatButton;
  const chatPanel = document.createElement("div");
  chatPanel.id = `${namespace}-panel`;
  chatPanel.className = `${namespace}-panel`;
  document.body.appendChild(chatPanel);
  elements.chatPanel = chatPanel;
  const chatHeader = document.createElement("div");
  chatHeader.className = `${namespace}-header`;
  const headerTitle = document.createElement("div");
  headerTitle.textContent = config.text.headerTitle;
  const closeButton = document.createElement("div");
  closeButton.className = `${namespace}-close`;
  closeButton.innerHTML = "&times;";
  chatHeader.appendChild(headerTitle);
  chatHeader.appendChild(closeButton);
  chatPanel.appendChild(chatHeader);
  elements.chatHeader = chatHeader;
  elements.closeButton = closeButton;
  const chatMessages = document.createElement("div");
  chatMessages.className = `${namespace}-messages`;
  chatPanel.appendChild(chatMessages);
  elements.chatMessages = chatMessages;
  if (config.text.welcomeMessage) {
    const welcomeWrapper = document.createElement("div");
    welcomeWrapper.className = `${namespace}-message-with-avatar ${namespace}-bot-message-container`;
    const botAvatar = document.createElement("div");
    botAvatar.className = `${namespace}-avatar ${namespace}-bot-avatar`;
    botAvatar.innerHTML = createIconElement(config.icons.botAvatar);
    const welcomeMsg = document.createElement("div");
    welcomeMsg.className = `${namespace}-message ${namespace}-bot-message`;
    welcomeMsg.textContent = config.text.welcomeMessage;
    welcomeWrapper.appendChild(botAvatar);
    welcomeWrapper.appendChild(welcomeMsg);
    chatMessages.appendChild(welcomeWrapper);
  }
  const inputContainer = document.createElement("div");
  inputContainer.className = `${namespace}-input-container`;
  const chatInput = document.createElement("input");
  chatInput.type = "text";
  chatInput.className = `${namespace}-input`;
  chatInput.placeholder = config.text.inputPlaceholder;
  const sendButton = document.createElement("button");
  sendButton.className = `${namespace}-send-button`;
  sendButton.innerHTML = createIconElement(config.icons.sendButton);
  inputContainer.appendChild(chatInput);
  inputContainer.appendChild(sendButton);
  chatPanel.appendChild(inputContainer);
  const poweredBy = document.createElement("div");
  poweredBy.className = `${namespace}-powered-by`;
  poweredBy.innerHTML = 'powered by <a href="https://www.fxrsoft.com" target="_blank">fxrsoft</a>';
  chatPanel.appendChild(poweredBy);
  elements.inputContainer = inputContainer;
  elements.chatInput = chatInput;
  elements.sendButton = sendButton;
  elements.poweredBy = poweredBy;
}
function createPredefinedButtons(ctx) {
  const { config, namespace, elements, _handlePredefinedQuestion } = ctx;
  if (!config.predefinedQuestions.enabled || !config.predefinedQuestions.questions || config.predefinedQuestions.questions.length === 0) {
    return;
  }
  const container = document.createElement("div");
  container.className = `${namespace}-predefined-container`;
  container.classList.add(`${namespace}-predefined-${config.predefinedQuestions.position}`);
  config.predefinedQuestions.questions.forEach((question) => {
    const button = document.createElement("button");
    button.className = `${namespace}-predefined-button`;
    button.classList.add(`${namespace}-predefined-${config.predefinedQuestions.style}`);
    const questionText = question.text && typeof question.text === "object" ? "" : String(question.text || "");
    button.textContent = questionText;
    button.addEventListener("click", () => {
      let value = question.value || question.text;
      if (typeof value === "object") {
        value = questionText;
      }
      ctx._handlePredefinedQuestion(value);
    });
    container.appendChild(button);
  });
  if (config.predefinedQuestions.position === "top") {
    elements.chatMessages.insertBefore(container, elements.chatMessages.firstChild);
  } else if (config.predefinedQuestions.position === "bottom") {
    elements.chatPanel.insertBefore(container, elements.inputContainer);
  } else if (config.predefinedQuestions.position === "welcome") {
    container.classList.remove(`${namespace}-predefined-welcome`);
    container.classList.add(`${namespace}-predefined-top`);
    elements.chatMessages.insertBefore(container, elements.chatMessages.firstChild);
    const firstMsg = elements.chatMessages.querySelector(`.${namespace}-bot-message-container`);
    if (firstMsg) {
      container.classList.remove(`${namespace}-predefined-top`);
      container.classList.add(`${namespace}-predefined-welcome`);
      elements.chatMessages.insertBefore(container, firstMsg.nextSibling);
    }
  }
  elements.predefinedContainer = container;
}
function injectStyles(ctx) {
  const { config, namespace } = ctx;
  const { theme, size, position } = config;
  let buttonBgStyle = `background-color: ${theme.primaryColor};`;
  if (config.iconStyles && config.iconStyles.chatButton) {
    const btnStyles = config.iconStyles.chatButton;
    if (btnStyles.transparent) {
      buttonBgStyle = "background-color: transparent !important;";
    } else if (btnStyles.backgroundColor) {
      buttonBgStyle = `background-color: ${btnStyles.backgroundColor};`;
    }
  }
  const css = `
    /* Chat Widget Styles */
    .${namespace}-button {
      position: fixed;
      bottom: ${position.bottom};
      right: ${position.right};
      width: ${size.buttonSize};
      height: ${size.buttonSize};
      border-radius: 50%;
      ${buttonBgStyle}
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      border: none;
      box-shadow: 0 2px 10px rgba(0,0,0,0.2);
      z-index: 9999;
      transition: transform 0.2s;
    }
    
    .${namespace}-button:hover {
      transform: scale(1.05);
    }
    
    .${namespace}-panel {
      position: fixed;
      bottom: calc(${position.bottom} + 80px);
      right: ${position.right};
      width: ${size.width};
      height: ${size.height};
      background: white;
      border-radius: 10px;
      box-shadow: 0 5px 15px rgba(0,0,0,0.2);
      display: none;
      flex-direction: column;
      overflow: hidden;
      z-index: 9998;
    }
    
    .${namespace}-header {
      background: ${theme.primaryColor};
      color: white;
      padding: 15px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: bold;
    }
    
    .${namespace}-close {
      cursor: pointer;
      font-size: 20px;
    }
    
    .${namespace}-messages {
      flex: 1;
      padding: 15px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
    }
    
    .${namespace}-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    
    .${namespace}-bot-avatar {
      background-color: ${theme.primaryColor};
      margin-right: 10px;
    }
    
    .${namespace}-user-avatar {
      background-color: ${theme.secondaryColor};
      margin-left: 10px;
    }
    
    .${namespace}-message-with-avatar {
      display: flex;
      align-items: flex-start;
      max-width: 85%;
      margin-bottom: 10px;
      gap: 16px;
    }
    
    .${namespace}-bot-message-container {
      align-self: flex-start;
    }
    
    .${namespace}-user-message-container {
      align-self: flex-end;
      flex-direction: row-reverse;
      gap: 20px;
    }
    
    .${namespace}-message {
      max-width: 100%;
      margin-bottom: 0;
      padding: 10px 15px;
      border-radius: 18px;
      overflow-wrap: break-word;
      overflow: hidden;
    }
    
    .${namespace}-message p {
      margin: 0 0 10px 0;
    }
    
    .${namespace}-message p:last-child {
      margin-bottom: 0;
    }
    
    .${namespace}-system-message {
      align-self: center;
      background-color: ${theme.systemMessageBg};
      color: ${theme.systemMessageText};
      text-align: center;
      border-radius: 8px;
      padding: 8px 12px;
      margin: 10px 0;
      font-size: 0.875rem;
      max-width: 85%;
    }
    
    .${namespace}-connected-status {
      color: #10b981; /* Green color for connected status */
      font-weight: 500;
      animation: fadeIn 0.3s ease-in;
    }
    
    @keyframes fadeIn {
      0% { opacity: 0; }
      100% { opacity: 1; }
    }
    
    .${namespace}-user-message {
      align-self: flex-end;
      background-color: ${theme.userMessageBg};
      color: ${theme.userMessageText};
      border-radius: 18px 18px 0 18px;
    }
    
    .${namespace}-bot-message {
      align-self: flex-start;
      background-color: ${theme.botMessageBg};
      color: ${theme.botMessageText};
      border-radius: 18px 18px 18px 0;
    }
    
    .${namespace}-input-container {
      display: flex;
      padding: 10px;
      border-top: 1px solid #e5e7eb;
    }
    
    .${namespace}-input {
      flex: 1;
      padding: 10px 15px;
      border-radius: 24px;
      border: 1px solid #d1d5db;
      margin-right: 10px;
      outline: none;
      font-size: 16px;
    }
    
    .${namespace}-input:focus {
      border-color: ${theme.primaryColor};
    }
    
    .${namespace}-send-button {
      background: ${theme.primaryColor};
      color: white;
      border: none;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .${namespace}-send-button:hover {
      background: ${darkenColor(theme.primaryColor, 10)}; /* from utils.js */
    }
    
    /* Typing indicator */
    .${namespace}-typing-indicator {
      display: flex;
      align-items: center;
      margin-bottom: 10px;
      align-self: flex-start;
    }
    
    .${namespace}-typing-indicator span {
      height: 8px;
      width: 8px;
      background-color: #6b7280;
      border-radius: 50%;
      display: inline-block;
      margin-right: 2px;
      animation: ${namespace}-typing 1.4s infinite both;
    }
    
    .${namespace}-typing-indicator span:nth-child(2) {
      animation-delay: 0.2s;
    }
    
    .${namespace}-typing-indicator span:nth-child(3) {
      animation-delay: 0.4s;
    }
    
    @keyframes ${namespace}-typing {
      0% { transform: translateY(0px); }
      30% { transform: translateY(-5px); }
      60%, 100% { transform: translateY(0px); }
    }
    
    /* Sending spinner */
    .${namespace}-sending-spinner {
      display: flex;
      align-items: center;
      align-self: flex-end;
      margin: 8px 20px 8px 0;
      opacity: 0;
      transition: opacity 0.3s ease;
    }
    
    .${namespace}-sending-spinner.${namespace}-active {
      opacity: 1;
    }
    
    .${namespace}-sending-spinner-dots {
      display: flex;
    }
    
    .${namespace}-sending-spinner-dots span {
      height: 8px;
      width: 8px;
      background-color: ${theme.primaryColor};
      border-radius: 50%;
      margin-right: 4px;
      animation: ${namespace}-sending-pulse 1.5s infinite ease-in-out both;
    }
    
    .${namespace}-sending-spinner-dots span:nth-child(2) {
      animation-delay: 0.2s;
    }
    
    .${namespace}-sending-spinner-dots span:nth-child(3) {
      animation-delay: 0.4s;
      margin-right: 0;
    }
    
    @keyframes ${namespace}-sending-pulse {
      0%, 80%, 100% { transform: scale(0.8); opacity: 0.6; }
      40% { transform: scale(1.2); opacity: 1; }
    }
    
    /* Predefined questions */
    .${namespace}-predefined-container {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      padding: 10px 15px;
    }
    
    .${namespace}-predefined-top {
      border-bottom: 1px solid rgba(0,0,0,0.1);
    }
    
    .${namespace}-predefined-bottom {
      border-top: 1px solid rgba(0,0,0,0.1);
    }
    
    .${namespace}-predefined-welcome {
      margin-top: 5px;
      margin-bottom: 10px;
      background-color: rgba(0,0,0,0.02);
      border-radius: 10px;
    }
    
    .${namespace}-predefined-button {
      border: none;
      padding: 8px 16px;
      font-size: ${config.predefinedQuestions.fontSize || "14px"};
      cursor: pointer;
      transition: background-color 0.2s;
      ${config.predefinedQuestions.allowTextWrapping ? "white-space: nowrap; " : "white-space: nowrap; text-overflow: ellipsis; overflow: hidden; max-width: 200px;"}
      background-color: ${config.predefinedQuestions.buttonColor};
      color: ${config.predefinedQuestions.textColor};
    }
    
    .${namespace}-predefined-button:hover {
      background-color: ${config.predefinedQuestions.hoverColor};
    }
    
    .${namespace}-predefined-button {
      border-radius: 16px;
    }
    
    .${namespace}-predefined-pill {
      border-radius: 24px;
    }
    
    /* Powered by section */
    .${namespace}-powered-by {
      text-align: center;
      font-size: 12px;
      color: #9ca3af;
      padding: 5px 0;
      border-top: 1px solid #e5e7eb;
    }
    
    .${namespace}-powered-by a {
      color: ${theme.primaryColor};
      text-decoration: none;
    }
    
    .${namespace}-powered-by a:hover {
      text-decoration: underline;
    }
    
    /* Markdown formatting for messages */
    .${namespace}-message a {
      color: ${theme.primaryColor};
      text-decoration: none;
    }
    .${namespace}-message a:hover {
      text-decoration: underline;
    }
    .${namespace}-message code {
      font-family: monospace;
      background-color: rgba(0,0,0,0.05);
      padding: 2px 4px;
      border-radius: 4px;
    }
    .${namespace}-message pre {
      background-color: rgba(0,0,0,0.05);
      padding: 10px;
      border-radius: 4px;
      overflow-x: auto;
    }
    
    /* Image formatting for messages */
    .${namespace}-message img {
      max-width: 100%;
      height: auto;
      border-radius: 4px;
      margin: 4px 0;
      display: block;
    }
    
    /* Responsive styles for small screens (less than 800px width) */
    @media (max-width: 800px) {
      .${namespace}-panel {
        width: calc(100% - 20px);
        max-width: 100%;
        right: 10px;
        left: 10px;
        height: 70vh;
        max-height: 550px;
        bottom: 70px;
      }
      
      .${namespace}-button {
        width: 50px;
        height: 50px;
        bottom: 10px;
        right: 10px;
      }
      
      .${namespace}-messages {
        max-height: calc(70vh - 120px);
      }
      
      .${namespace}-input-container {
        padding: 8px;
      }
      
      .${namespace}-input {
        padding: 8px 12px;
        font-size: 14px;
      }
      
      .${namespace}-message-with-avatar {
        max-width: 95%;
      }
      
      .${namespace}-predefined-container {
        padding: 8px;
        gap: 5px;
      }
      
      .${namespace}-predefined-button {
        padding: 6px 12px;
        font-size: 13px;
      }
    }
  `;
  const style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);
}
function addMessage(ctx, type, content) {
  const { config, namespace, elements } = ctx;
  if (!elements.chatMessages) return;
  if (type === "system") {
    const systemMsg = document.createElement("div");
    systemMsg.className = `${namespace}-system-message`;
    systemMsg.textContent = content;
    elements.chatMessages.appendChild(systemMsg);
    if (content === "Initializing chat session..." || content === "Chat session started." || content === "Initializing session before sending...") {
      setTimeout(() => {
        if (systemMsg && systemMsg.parentNode) {
          systemMsg.parentNode.removeChild(systemMsg);
        }
      }, 3e3);
    }
  } else if (type === "user") {
    const wrapper = document.createElement("div");
    wrapper.className = `${namespace}-message-with-avatar ${namespace}-user-message-container`;
    const avatar = document.createElement("div");
    avatar.className = `${namespace}-avatar ${namespace}-user-avatar`;
    avatar.innerHTML = createIconElement(config.icons.userAvatar);
    const message = document.createElement("div");
    message.className = `${namespace}-message ${namespace}-user-message`;
    message.textContent = content;
    wrapper.appendChild(avatar);
    wrapper.appendChild(message);
    elements.chatMessages.appendChild(wrapper);
  } else if (type === "bot") {
    const wrapper = document.createElement("div");
    wrapper.className = `${namespace}-message-with-avatar ${namespace}-bot-message-container`;
    const avatar = document.createElement("div");
    avatar.className = `${namespace}-avatar ${namespace}-bot-avatar`;
    avatar.innerHTML = createIconElement(config.icons.botAvatar);
    const message = document.createElement("div");
    message.className = `${namespace}-message ${namespace}-bot-message`;
    let htmlContent = marked.parse(content || "");
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = htmlContent;
    const images = tempDiv.querySelectorAll("img");
    images.forEach((img) => {
      const title = img.getAttribute("title");
      if (title) {
        const styleRegex = /style="([^"]*)"/;
        const match = title.match(styleRegex);
        if (match && match[1]) {
          const styleValue = match[1];
          img.style.cssText = img.style.cssText ? img.style.cssText.replace(/;$/, "") + ";" + styleValue : styleValue;
          let newTitle = title.replace(styleRegex, "").replace(/\s*\/[\s)]*$/, "").trim();
          if (newTitle) {
            img.setAttribute("title", newTitle);
          } else {
            img.removeAttribute("title");
          }
        }
      }
    });
    htmlContent = tempDiv.innerHTML;
    if (config.sanitization.output) {
      message.innerHTML = DOMPurify.sanitize(htmlContent, {
        ADD_TAGS: ["iframe", "video", "source"],
        ALLOW_TAGS: ["b", "i", "em", "strong", "a", "p", "ul", "ol", "li", "br", "img", "pre", "code", "blockquote", "h1", "h2", "h3", "h4", "h5", "h6", "hr", "span"],
        ALLOW_ATTR: ["href", "src", "alt", "title", "target", "rel", "class", "style", "controls", "autoplay", "loop", "muted", "poster", "preload", "width", "height", "type", "frameborder", "allowfullscreen", "allow"],
        ADD_ATTR: ["target", "rel"]
      });
    } else {
      message.innerHTML = htmlContent;
    }
    const youtubeEmbedDiv = document.createElement("div");
    youtubeEmbedDiv.innerHTML = message.innerHTML;
    youtubeEmbedDiv.querySelectorAll("a").forEach((link) => {
      try {
        const url = new URL(link.href);
        let videoId = null;
        if (url.hostname === "www.youtube.com" || url.hostname === "youtube.com") {
          if (url.pathname === "/watch") {
            videoId = url.searchParams.get("v");
          } else if (url.pathname.startsWith("/embed/")) {
            videoId = url.pathname.substring("/embed/".length);
          }
        } else if (url.hostname === "youtu.be") {
          videoId = url.pathname.substring(1);
        }
        if (videoId) {
          const iframe = document.createElement("iframe");
          iframe.setAttribute("src", `https://www.youtube.com/embed/${videoId}`);
          iframe.setAttribute("width", "100%");
          const parentWidth = message.offsetWidth || 300;
          iframe.setAttribute("height", `${Math.round(parentWidth * 9 / 16)}`);
          iframe.setAttribute("frameborder", "0");
          iframe.setAttribute("allow", "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture");
          iframe.setAttribute("allowfullscreen", "");
          if (link.parentNode && link.parentNode !== youtubeEmbedDiv) {
            link.parentNode.replaceChild(iframe, link);
          } else if (link.parentNode === youtubeEmbedDiv) {
            youtubeEmbedDiv.replaceChild(iframe, link);
          }
        }
      } catch (e) {
        console.warn("Could not process link for YouTube embed (initial):", link.href, e);
      }
    });
    message.innerHTML = youtubeEmbedDiv.innerHTML;
    wrapper.appendChild(avatar);
    wrapper.appendChild(message);
    elements.chatMessages.appendChild(wrapper);
  }
  scrollToBottom(ctx);
}
function updateStreamedMessage(ctx, newContentFragment) {
  const { config, streamState, namespace } = ctx;
  if (!streamState.currentBotMessage && ctx.elements.chatMessages) {
    addMessage(ctx, "bot", "");
    const lastBotMessageContainer = ctx.elements.chatMessages.querySelector(`.${namespace}-bot-message-container:last-child`);
    if (lastBotMessageContainer) {
      streamState.currentBotMessage = lastBotMessageContainer.querySelector(`.${namespace}-bot-message`);
    }
  }
  if (streamState.currentBotMessage && newContentFragment) {
    streamState.activeMessageContent += newContentFragment;
    let htmlContent = marked.parse(streamState.activeMessageContent);
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = htmlContent;
    const images = tempDiv.querySelectorAll("img");
    images.forEach((img) => {
      const title = img.getAttribute("title");
      if (title) {
        const styleRegex = /style="([^"]*)"/;
        const match = title.match(styleRegex);
        if (match && match[1]) {
          const styleValue = match[1];
          img.style.cssText = img.style.cssText ? img.style.cssText.replace(/;$/, "") + ";" + styleValue : styleValue;
          let newTitle = title.replace(styleRegex, "").replace(/\s*\/[\s)]*$/, "").trim();
          if (newTitle) {
            img.setAttribute("title", newTitle);
          } else {
            img.removeAttribute("title");
          }
        }
      }
    });
    htmlContent = tempDiv.innerHTML;
    if (config.sanitization.output) {
      streamState.currentBotMessage.innerHTML = DOMPurify.sanitize(htmlContent, {
        ADD_TAGS: ["iframe", "video", "source"],
        ALLOW_TAGS: ["b", "i", "em", "strong", "a", "p", "ul", "ol", "li", "br", "img", "pre", "code", "blockquote", "h1", "h2", "h3", "h4", "h5", "h6", "hr", "span"],
        ALLOW_ATTR: ["href", "src", "alt", "title", "target", "rel", "class", "style", "controls", "autoplay", "loop", "muted", "poster", "preload", "width", "height", "type", "frameborder", "allowfullscreen", "allow"],
        ADD_ATTR: ["target", "rel"]
      });
    } else {
      streamState.currentBotMessage.innerHTML = htmlContent;
    }
    const youtubeEmbedDiv = document.createElement("div");
    youtubeEmbedDiv.innerHTML = streamState.currentBotMessage.innerHTML;
    youtubeEmbedDiv.querySelectorAll("a").forEach((link) => {
      try {
        const url = new URL(link.href);
        let videoId = null;
        if (url.hostname === "www.youtube.com" || url.hostname === "youtube.com") {
          if (url.pathname === "/watch") {
            videoId = url.searchParams.get("v");
          } else if (url.pathname.startsWith("/embed/")) {
            videoId = url.pathname.substring("/embed/".length);
          }
        } else if (url.hostname === "youtu.be") {
          videoId = url.pathname.substring(1);
        }
        if (videoId) {
          const iframe = document.createElement("iframe");
          iframe.setAttribute("src", `https://www.youtube.com/embed/${videoId}`);
          iframe.setAttribute("width", "100%");
          const parentWidth = streamState.currentBotMessage.offsetWidth || 300;
          iframe.setAttribute("height", `${Math.round(parentWidth * 9 / 16)}`);
          iframe.setAttribute("frameborder", "0");
          iframe.setAttribute("allow", "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture");
          iframe.setAttribute("allowfullscreen", "");
          if (link.parentNode && link.parentNode !== youtubeEmbedDiv) {
            link.parentNode.replaceChild(iframe, link);
          } else if (link.parentNode === youtubeEmbedDiv) {
            youtubeEmbedDiv.replaceChild(iframe, link);
          }
        }
      } catch (e) {
        console.warn("Could not process link for YouTube embed (incremental):", link.href, e);
      }
    });
    streamState.currentBotMessage.innerHTML = youtubeEmbedDiv.innerHTML;
    scrollToBottom(ctx);
  }
}
function showSendingSpinner(ctx) {
  const { namespace, elements, streamState } = ctx;
  removeSendingSpinner(ctx);
  const spinner = document.createElement("div");
  spinner.className = `${namespace}-sending-spinner`;
  const dots = document.createElement("div");
  dots.className = `${namespace}-sending-spinner-dots`;
  for (let i = 0; i < 3; i++) {
    const dot = document.createElement("span");
    dots.appendChild(dot);
  }
  spinner.appendChild(dots);
  elements.chatMessages.appendChild(spinner);
  streamState.sendingSpinner = spinner;
  setTimeout(() => {
    if (spinner && spinner.parentNode) {
      spinner.classList.add(`${namespace}-active`);
    }
  }, 10);
}
function removeSendingSpinner(ctx) {
  const { streamState } = ctx;
  if (streamState.sendingSpinner && streamState.sendingSpinner.parentNode) {
    streamState.sendingSpinner.parentNode.removeChild(streamState.sendingSpinner);
    streamState.sendingSpinner = null;
  }
}
function showTypingIndicator(ctx) {
  const { namespace, elements, streamState } = ctx;
  if (streamState.typingIndicator && streamState.typingIndicator.parentNode) {
    return;
  }
  const typingIndicator = document.createElement("div");
  typingIndicator.className = `${namespace}-typing-indicator`;
  for (let i = 0; i < 3; i++) {
    const dot = document.createElement("span");
    typingIndicator.appendChild(dot);
  }
  elements.chatMessages.appendChild(typingIndicator);
  streamState.typingIndicator = typingIndicator;
  scrollToBottom(ctx);
}
function removeTypingIndicator(ctx) {
  const { streamState } = ctx;
  if (streamState.typingIndicator && streamState.typingIndicator.parentNode) {
    streamState.typingIndicator.parentNode.removeChild(streamState.typingIndicator);
    streamState.typingIndicator = null;
  }
}
function scrollToBottom(ctx) {
  const { elements } = ctx;
  if (elements.chatMessages) {
    elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
  }
}
function attachEventListeners(ctx) {
  const { elements, toggleChat, hideChat, sendMessage } = ctx;
  elements.chatButton.addEventListener("click", () => {
    toggleChat.call(ctx);
  });
  elements.closeButton.addEventListener("click", () => {
    hideChat.call(ctx);
  });
  elements.sendButton.addEventListener("click", () => {
    sendMessage.call(ctx);
  });
  elements.chatInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      sendMessage.call(ctx);
    }
  });
}
async function handlePredefinedQuestion(ctx, questionText) {
  const { config, elements, sendMessage } = ctx;
  const messageText = typeof questionText === "object" ? questionText.toString && questionText.toString() !== "[object Object]" ? questionText.toString() : "" : String(questionText || "");
  await sendMessage.call(ctx, messageText);
  if (config.predefinedQuestions.hideAfterSelection && elements.predefinedContainer) {
    elements.predefinedContainer.style.display = "none";
  }
}
async function initSession(ctx) {
  const { config, addMessage: addMessage2 } = ctx;
  if (ctx.isSessionInitialized) {
    return;
  }
  if (!config.chatId || !config.sessionEndpointUrl) {
    console.error("StreamingChatWidget: Cannot init session. Missing chatId or sessionEndpointUrl in config.");
    addMessage2(ctx, "system", "Chat initialization failed: Configuration error.");
    return;
  }
  try {
    addMessage2(ctx, "system", "Initializing chat session...");
    const response = await fetch(config.sessionEndpointUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ chatid: config.chatId })
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({ detail: response.statusText }));
      throw new Error(errData.detail || `HTTP error ${response.status}`);
    }
    const data = await response.json();
    ctx.sessionToken = data.session_token;
    ctx.assistantId = data.assistant_id;
    ctx.isSessionInitialized = true;
    addMessage2(ctx, "system", "Chat session started.");
  } catch (error) {
    console.error("Error initiating chat session:", error);
    addMessage2(ctx, "system", "Failed to start chat session: " + error.message);
    ctx.isSessionInitialized = false;
  }
}
function handleStreamEvent(ctx, eventName, data) {
  const { streamState, addMessage: addMessage2, updateStreamedMessage: updateStreamedMessage2, removeTypingIndicator: removeTypingIndicator2 } = ctx;
  if (eventName === "thread.message.delta" && data.type === "text_delta") {
    if (data.content) {
      updateStreamedMessage2(ctx, data.content);
    }
  } else if (eventName === "thread.run.completed") {
    streamState.isStreaming = false;
    removeTypingIndicator2(ctx);
    streamState.currentBotMessage = null;
    streamState.activeMessageContent = "";
  } else if (eventName === "thread.run.failed" || eventName === "error") {
    addMessage2(ctx, "system", `Error: ${data.error || data.detail || "An unknown error occurred."}`);
    streamState.isStreaming = false;
    removeTypingIndicator2(ctx);
    streamState.currentBotMessage = null;
    streamState.activeMessageContent = "";
  } else if (eventName === "stream_end") {
    streamState.isStreaming = false;
    removeTypingIndicator2(ctx);
    if (streamState.currentBotMessage && streamState.activeMessageContent === "") ;
    streamState.currentBotMessage = null;
    streamState.activeMessageContent = "";
  }
}
async function streamResponseFromServer(ctx, messageText) {
  const {
    config,
    streamState,
    sessionToken,
    isSessionInitialized,
    addMessage: addMessage2,
    removeSendingSpinner: removeSendingSpinner2,
    showTypingIndicator: showTypingIndicator2
  } = ctx;
  if (!isSessionInitialized || !sessionToken) {
    addMessage2(ctx, "system", "Session not initialized. Please try again.");
    removeSendingSpinner2(ctx);
    return;
  }
  if (!config.backendStreamUrl) {
    console.error("StreamingChatWidget: backendStreamUrl is not configured.");
    addMessage2(ctx, "system", "Chat stream endpoint not configured.");
    removeSendingSpinner2(ctx);
    return;
  }
  streamState.isStreaming = true;
  streamState.activeMessageContent = "";
  streamState.currentBotMessage = null;
  try {
    const response = await fetch(config.backendStreamUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session_token: sessionToken,
        message: messageText
      })
    });
    removeSendingSpinner2(ctx);
    if (!response.ok || !response.body) {
      const errorData = await response.json().catch(() => ({ detail: response.statusText }));
      addMessage2(ctx, "system", `Error: ${errorData.detail || "Failed to connect to stream"}`);
      streamState.isStreaming = false;
      return;
    }
    showTypingIndicator2(ctx);
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    while (true) {
      const { value, done } = await reader.read();
      if (done) {
        if (buffer.trim().length > 0) {
          console.warn("Stream ended with unprocessed buffer:", buffer);
        }
        if (streamState.isStreaming) {
          handleStreamEvent(ctx, "stream_end", { message: "Stream closed by server." });
        }
        break;
      }
      buffer += decoder.decode(value, { stream: true });
      let boundary = buffer.indexOf("\\n\\n");
      while (boundary !== -1) {
        const rawSseEvent = buffer.substring(0, boundary);
        buffer = buffer.substring(boundary + 2);
        let eventName = "message";
        let eventDataLines = [];
        rawSseEvent.split("\\n").forEach((line) => {
          if (line.startsWith("event:")) {
            eventName = line.substring("event:".length).trim();
          } else if (line.startsWith("data:")) {
            eventDataLines.push(line.substring("data:".length).trim());
          }
        });
        const eventData = eventDataLines.join("");
        if (eventData) {
          try {
            const parsedData = JSON.parse(eventData);
            if (eventName === "cached_message") {
              if (parsedData.role && parsedData.content) {
                const messageType = parsedData.role === "assistant" ? "bot" : parsedData.role;
                addMessage2(ctx, messageType, parsedData.content);
              } else {
              }
            } else {
              handleStreamEvent(ctx, eventName, parsedData);
            }
          } catch (e) {
            console.error("Error parsing SSE data:", eventData, e);
          }
        }
        boundary = buffer.indexOf("\\n\\n");
      }
    }
  } catch (error) {
    console.error("Streaming fetch error:", error);
    addMessage2(ctx, "system", "Connection error during streaming.");
    streamState.isStreaming = false;
    ctx.removeTypingIndicator(ctx);
    removeSendingSpinner2(ctx);
  }
}
if (!window.DOMPurify) {
  console.error("StreamingChatWidget requires DOMPurify. Please include it in your page.");
}
if (!window.marked) {
  console.error("StreamingChatWidget requires marked.js. Please include it in your page.");
}
class StreamingChatWidget {
  constructor(config) {
    if (!window.DOMPurify || !window.marked) {
      return;
    }
    if (!config || !config.chatId) {
      console.error("StreamingChatWidget: chatId is required.");
      return;
    }
    if (!config.sessionEndpointUrl) {
      console.error("StreamingChatWidget: sessionEndpointUrl is required.");
      return;
    }
    if (!config.backendStreamUrl) {
      console.error("StreamingChatWidget: backendStreamUrl is required.");
      return;
    }
    this.config = mergeConfig(DEFAULT_CONFIG, config);
    this.sessionToken = null;
    this.assistantId = null;
    this.isSessionInitialized = false;
    this.streamState = {
      currentBotMessage: null,
      activeMessageContent: "",
      isStreaming: false,
      typingIndicator: null,
      sendingSpinner: null
    };
    this.elements = {};
    this.namespace = "sse-chat-" + Math.random().toString(36).substr(2, 9);
    this.addMessage = this._addMessage.bind(this);
    this._updateStreamedMessage = this._updateStreamedMessage.bind(this);
    this._showTypingIndicator = this._showTypingIndicator.bind(this);
    this._removeTypingIndicator = this._removeTypingIndicator.bind(this);
    this._showSendingSpinner = this._showSendingSpinner.bind(this);
    this._removeSendingSpinner = this._removeSendingSpinner.bind(this);
    this._scrollToBottom = this._scrollToBottom.bind(this);
    this._handlePredefinedQuestion = this._handlePredefinedQuestion.bind(this);
    this._setupDependencies();
    this._initUI();
  }
  _setupDependencies() {
    marked.setOptions({
      gfm: true,
      breaks: true,
      sanitize: false,
      highlight: function(code, lang) {
        return code;
      },
      renderer: new marked.Renderer()
    });
  }
  _initUI() {
    createWidgetElements(this);
    injectStyles(this);
    attachEventListeners(this);
    if (this.config.predefinedQuestions.enabled) {
      createPredefinedButtons(this);
    }
  }
  // UI Manager methods (bound to this instance)
  _addMessage(type, content) {
    addMessage(this, type, content);
  }
  _updateStreamedMessage(contentFragment) {
    updateStreamedMessage(this, contentFragment);
  }
  _showTypingIndicator() {
    showTypingIndicator(this);
  }
  _removeTypingIndicator() {
    removeTypingIndicator(this);
  }
  _showSendingSpinner() {
    showSendingSpinner(this);
  }
  _removeSendingSpinner() {
    removeSendingSpinner(this);
  }
  _scrollToBottom() {
    scrollToBottom(this);
  }
  // Event Handler methods (bound to this instance)
  // _handlePredefinedQuestion is called by createPredefinedButtons
  async _handlePredefinedQuestion(questionText) {
    await handlePredefinedQuestion(this, questionText);
  }
  // Session Manager methods
  async initSession() {
    await initSession(this);
  }
  // Stream Manager methods
  async _streamResponseFromServer(messageText) {
    await streamResponseFromServer(this, messageText);
  }
  // Public API
  async sendMessage(text) {
    let messageText = text;
    if (typeof messageText === "undefined") {
      messageText = this.elements.chatInput.value.trim();
      if (!messageText) return;
      this.elements.chatInput.value = "";
    }
    this.addMessage("user", messageText);
    if (!this.isSessionInitialized) {
      this.addMessage("system", "Initializing session before sending...");
      await this.initSession();
      if (!this.isSessionInitialized) {
        this.addMessage("system", "Session initialization failed. Cannot send message.");
        this._removeSendingSpinner();
        return;
      }
    }
    this._showSendingSpinner();
    this._streamResponseFromServer(messageText);
  }
  toggleChat() {
    const panel = this.elements.chatPanel;
    if (panel.style.display === "flex") {
      this.hideChat();
    } else {
      this.showChat();
    }
  }
  showChat() {
    const panel = this.elements.chatPanel;
    panel.style.display = "flex";
    setTimeout(() => {
      if (this.elements.chatInput) this.elements.chatInput.focus();
    }, 100);
    this._scrollToBottom();
  }
  hideChat() {
    const panel = this.elements.chatPanel;
    panel.style.display = "none";
  }
  destroy() {
    if (this.elements && typeof this.elements === "object") {
      Object.values(this.elements).forEach((element) => {
        if (element && element.parentNode) {
          element.parentNode.removeChild(element);
        }
      });
      this.elements = {};
    }
    const styleElements = document.querySelectorAll("style");
    styleElements.forEach((style) => {
      if (style.textContent && style.textContent.includes(this.namespace)) {
        if (style.parentNode) style.parentNode.removeChild(style);
      }
    });
    this.streamState = {
      currentBotMessage: null,
      activeMessageContent: "",
      isStreaming: false,
      typingIndicator: null,
      sendingSpinner: null
    };
  }
  on(event, callback) {
    console.log(`Event '${event}' registered but handling not implemented yet`);
  }
}
if (typeof window !== "undefined") {
  window.StreamingChatWidget = StreamingChatWidget;
}
export {
  StreamingChatWidget as default
};
