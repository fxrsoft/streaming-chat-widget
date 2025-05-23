import { darkenColor, createIconElement } from './utils.js';

/**
 * Create all widget DOM elements
 * @param {object} ctx - The context from the StreamingChatWidget instance (this)
 *                       Expected properties: config, namespace, elements
 */
export function createWidgetElements(ctx) {
  const { config, namespace, elements } = ctx;

  // Create chat button
  const chatButton = document.createElement('button');
  chatButton.id = `${namespace}-button`;
  chatButton.className = `${namespace}-button`;
  chatButton.innerHTML = createIconElement(config.icons.chatButton); // from utils.js
  document.body.appendChild(chatButton);
  elements.chatButton = chatButton;
  
  // Create chat panel
  const chatPanel = document.createElement('div');
  chatPanel.id = `${namespace}-panel`;
  chatPanel.className = `${namespace}-panel`;
  document.body.appendChild(chatPanel);
  elements.chatPanel = chatPanel;
  
  // Create header
  const chatHeader = document.createElement('div');
  chatHeader.className = `${namespace}-header`;
  
  const headerTitle = document.createElement('div');
  headerTitle.textContent = config.text.headerTitle;
  
  const closeButton = document.createElement('div');
  closeButton.className = `${namespace}-close`;
  closeButton.innerHTML = '&times;';
  
  chatHeader.appendChild(headerTitle);
  chatHeader.appendChild(closeButton);
  chatPanel.appendChild(chatHeader);
  elements.chatHeader = chatHeader;
  elements.closeButton = closeButton;
  
  // Create messages container
  const chatMessages = document.createElement('div');
  chatMessages.className = `${namespace}-messages`;
  chatPanel.appendChild(chatMessages);
  elements.chatMessages = chatMessages;
  
  // Add welcome message
  if (config.text.welcomeMessage) {
    const welcomeWrapper = document.createElement('div');
    welcomeWrapper.className = `${namespace}-message-with-avatar ${namespace}-bot-message-container`;
    
    const botAvatar = document.createElement('div');
    botAvatar.className = `${namespace}-avatar ${namespace}-bot-avatar`;
    botAvatar.innerHTML = createIconElement(config.icons.botAvatar); // from utils.js
    
    const welcomeMsg = document.createElement('div');
    welcomeMsg.className = `${namespace}-message ${namespace}-bot-message`;
    welcomeMsg.textContent = config.text.welcomeMessage;
    
    welcomeWrapper.appendChild(botAvatar);
    welcomeWrapper.appendChild(welcomeMsg);
    chatMessages.appendChild(welcomeWrapper);
  }
  
  // Create input container
  const inputContainer = document.createElement('div');
  inputContainer.className = `${namespace}-input-container`;
  
  const chatInput = document.createElement('input');
  chatInput.type = 'text';
  chatInput.className = `${namespace}-input`;
  chatInput.placeholder = config.text.inputPlaceholder;
  
  const sendButton = document.createElement('button');
  sendButton.className = `${namespace}-send-button`;
  sendButton.innerHTML = createIconElement(config.icons.sendButton); // from utils.js
  
  inputContainer.appendChild(chatInput);
  inputContainer.appendChild(sendButton);
  chatPanel.appendChild(inputContainer);
  
  // Create "powered by" element
  const poweredBy = document.createElement('div');
  poweredBy.className = `${namespace}-powered-by`;
  poweredBy.innerHTML = 'powered by <a href="https://www.fxrsoft.com" target="_blank">fxrsoft</a>';
  chatPanel.appendChild(poweredBy);
  
  elements.inputContainer = inputContainer;
  elements.chatInput = chatInput;
  elements.sendButton = sendButton;
  elements.poweredBy = poweredBy;
}

/**
 * Create predefined question buttons
 * @param {object} ctx - The context from the StreamingChatWidget instance (this)
 *                       Expected properties: config, namespace, elements, _handlePredefinedQuestion (method)
 */
export function createPredefinedButtons(ctx) {
  const { config, namespace, elements, _handlePredefinedQuestion } = ctx;

  if (!config.predefinedQuestions.enabled || 
      !config.predefinedQuestions.questions ||
      config.predefinedQuestions.questions.length === 0) {
    return;
  }
  
  const container = document.createElement('div');
  container.className = `${namespace}-predefined-container`;
  container.classList.add(`${namespace}-predefined-${config.predefinedQuestions.position}`);
  
  config.predefinedQuestions.questions.forEach(question => {
    const button = document.createElement('button');
    button.className = `${namespace}-predefined-button`;
    button.classList.add(`${namespace}-predefined-${config.predefinedQuestions.style}`);
    const questionText = question.text && typeof question.text === 'object' 
        ? '' 
        : String(question.text || '');
    
    button.textContent = questionText;
    
    button.addEventListener('click', () => {
      let value = question.value || question.text;
      if (typeof value === 'object') {
        value = questionText;
      }
      // Call the method from the main class instance context
      // _handlePredefinedQuestion is expected to be bound or called with correct 'this'
      ctx._handlePredefinedQuestion(value); 
    });
    
    container.appendChild(button);
  });
  
  if (config.predefinedQuestions.position === 'top') {
    elements.chatMessages.insertBefore(container, elements.chatMessages.firstChild);
  } else if (config.predefinedQuestions.position === 'bottom') {
    elements.chatPanel.insertBefore(container, elements.inputContainer);
  } else if (config.predefinedQuestions.position === 'welcome') {
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

/**
 * Generate and inject CSS styles
 * @param {object} ctx - The context from the StreamingChatWidget instance (this)
 *                       Expected properties: config, namespace
 */
export function injectStyles(ctx) {
  const { config, namespace } = ctx;
  const { theme, size, position } = config;
  
  let buttonBgStyle = `background-color: ${theme.primaryColor};`;
  
  if (config.iconStyles && config.iconStyles.chatButton) {
    const btnStyles = config.iconStyles.chatButton;
    if (btnStyles.transparent) {
      buttonBgStyle = 'background-color: transparent !important;';
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
      font-size: ${config.predefinedQuestions.fontSize || '14px'};
      cursor: pointer;
      transition: background-color 0.2s;
      ${config.predefinedQuestions.allowTextWrapping ? 
        'white-space: nowrap; ' :
        'white-space: nowrap; text-overflow: ellipsis; overflow: hidden; max-width: 200px;'}
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
  
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);
}
