import { DEFAULT_CONFIG } from './config.js';
import { mergeConfig } from './utils.js';
import { createWidgetElements, injectStyles, createPredefinedButtons } from './uiBuilder.js';
import { 
    addMessage as uiAddMessage, 
    updateStreamedMessage as uiUpdateStreamedMessage,
    showTypingIndicator as uiShowTypingIndicator, 
    removeTypingIndicator as uiRemoveTypingIndicator, 
    showSendingSpinner as uiShowSendingSpinner, 
    removeSendingSpinner as uiRemoveSendingSpinner,
    scrollToBottom as uiScrollToBottom 
} from './uiManager.js';
import { attachEventListeners, handlePredefinedQuestion as ehHandlePredefinedQuestion } from './eventHandlers.js';
import { initSession as smInitSession } from './sessionManager.js';
import { streamResponseFromServer as smStreamResponseFromServer } from './streamManager.js';

// Ensure DOMPurify and marked are available (they are loaded via CDN by the user)
if (!window.DOMPurify) {
  console.error('StreamingChatWidget requires DOMPurify. Please include it in your page.');
  // Potentially stop execution or provide a non-functional widget
}
if (!window.marked) {
  console.error('StreamingChatWidget requires marked.js. Please include it in your page.');
  // Potentially stop execution
}

class StreamingChatWidget {
  constructor(config) {
    if (!window.DOMPurify || !window.marked) {
        // Dependencies not loaded, do not proceed with full initialization.
        // A message might have already been logged.
        return; 
    }
    if (!config || !config.chatId) {
      console.error('StreamingChatWidget: chatId is required.');
      return;
    }
    if (!config.sessionEndpointUrl) {
      console.error('StreamingChatWidget: sessionEndpointUrl is required.');
      return;
    }
    if (!config.backendStreamUrl) {
      console.error('StreamingChatWidget: backendStreamUrl is required.');
      return;
    }
    
    this.config = mergeConfig(DEFAULT_CONFIG, config);
    
    this.sessionToken = null;
    this.assistantId = null;
    this.isSessionInitialized = false;

    this.streamState = {
      currentBotMessage: null,
      activeMessageContent: '',
      isStreaming: false,
      typingIndicator: null,
      sendingSpinner: null
    };
    
    this.elements = {};
    this.namespace = 'sse-chat-' + Math.random().toString(36).substr(2, 9);
    
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
    // Pass 'this' as context to the imported functions
    createWidgetElements(this);
    injectStyles(this);
    attachEventListeners(this); // toggleChat, hideChat, sendMessage are methods of this class
    
    if (this.config.predefinedQuestions.enabled) {
      // createPredefinedButtons needs access to _handlePredefinedQuestion method of this instance
      createPredefinedButtons(this);
    }
  }

  // UI Manager methods (bound to this instance)
  _addMessage(type, content) { uiAddMessage(this, type, content); }
  _updateStreamedMessage(contentFragment) { uiUpdateStreamedMessage(this, contentFragment); }
  _showTypingIndicator() { uiShowTypingIndicator(this); }
  _removeTypingIndicator() { uiRemoveTypingIndicator(this); }
  _showSendingSpinner() { uiShowSendingSpinner(this); }
  _removeSendingSpinner() { uiRemoveSendingSpinner(this); }
  _scrollToBottom() { uiScrollToBottom(this); }

  // Event Handler methods (bound to this instance)
  // _handlePredefinedQuestion is called by createPredefinedButtons
  async _handlePredefinedQuestion(questionText) { await ehHandlePredefinedQuestion(this, questionText); }

  // Session Manager methods
  async initSession() { await smInitSession(this); }

  // Stream Manager methods
  async _streamResponseFromServer(messageText) { await smStreamResponseFromServer(this, messageText); }
  
  // Public API
  async sendMessage(text) {
    let messageText = text;
    if (typeof messageText === 'undefined') { // Check if text is explicitly passed
      messageText = this.elements.chatInput.value.trim();
      if (!messageText) return;
      this.elements.chatInput.value = '';
    }
    
    this._addMessage('user', messageText);

    if (!this.isSessionInitialized) {
      this._addMessage('system', 'Initializing session before sending...');
      await this.initSession();
      if (!this.isSessionInitialized) {
        this._addMessage('system', 'Session initialization failed. Cannot send message.');
        this._removeSendingSpinner();
        return;
      }
    }
    
    this._showSendingSpinner();
    this._streamResponseFromServer(messageText);
  }
  
  toggleChat() {
    const panel = this.elements.chatPanel;
    if (panel.style.display === 'flex') {
      this.hideChat();
    } else {
      this.showChat();
    }
  }
  
  showChat() {
    const panel = this.elements.chatPanel;
    panel.style.display = 'flex';
    setTimeout(() => {
      if (this.elements.chatInput) this.elements.chatInput.focus();
    }, 100);
    this._scrollToBottom();
  }
  
  hideChat() {
    const panel = this.elements.chatPanel;
    panel.style.display = 'none';
  }
  
  destroy() {
    if (this.elements && typeof this.elements === 'object') {
      Object.values(this.elements).forEach(element => {
        if (element && element.parentNode) {
          element.parentNode.removeChild(element);
        }
      });
      this.elements = {};
    }
    
    const styleElements = document.querySelectorAll('style');
    styleElements.forEach(style => {
      if (style.textContent && style.textContent.includes(this.namespace)) {
        if (style.parentNode) style.parentNode.removeChild(style);
      }
    });
    
    this.streamState = {
      currentBotMessage: null,
      activeMessageContent: '',
      isStreaming: false,
      typingIndicator: null,
      sendingSpinner: null
    };
    // Any other cleanup if necessary
  }
  
  on(event, callback) {
    console.log(`Event '${event}' registered but handling not implemented yet`);
    // Basic event emitter can be added here if needed
  }
}

// Expose to window for CDN usage
if (typeof window !== 'undefined') {
  window.StreamingChatWidget = StreamingChatWidget;
}

export default StreamingChatWidget; // For module usage if imported directly
