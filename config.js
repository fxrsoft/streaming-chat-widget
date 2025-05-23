export const DEFAULT_CONFIG = {
  chatId: '', // Required - identifies which assistant to use
  sessionEndpointUrl: '', // Required - URL for backend to initialize session
  backendStreamUrl: '', // Required - URL for backend to stream messages
  theme: {
    primaryColor: '#2563eb',     // Main theme color (button, header, etc)
    secondaryColor: '#1e40af',   // Secondary color (user avatar)
    userMessageBg: '#dbeafe',    // User message background
    userMessageText: '#1e40af',  // User message text
    botMessageBg: '#f3f4f6',     // Bot message background
    botMessageText: '#1f2937',   // Bot message text
    systemMessageBg: '#f3f4f6',  // System message background
    systemMessageText: '#4b5563' // System message text
  },
  size: {
    width: '380px',      // Widget width
    height: '550px',     // Widget height
    buttonSize: '60px'   // Chat button size
  },
  position: {
    bottom: '20px',      // Distance from bottom
    right: '20px'        // Distance from right
  },
  text: {
    headerTitle: 'Chat Support',
    welcomeMessage: 'Welcome! How can I help you today?',
    inputPlaceholder: 'Type your message...',
    connectionError: 'Connection error. Please try again later.',
    sendError: 'Failed to send message. Please try again.'
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
    position: 'top', // 'top', 'bottom', or 'welcome'
    style: 'button', // 'button' or 'pill'
    questions: [
      // Examples:
      // { text: "What are your business hours?", value: "What are your business hours?" },
      // { text: "How do I reset my password?", value: "I need help resetting my password" }
    ],
    buttonColor: '#3b82f6',  // Background color
    textColor: '#ffffff',    // Text color
    hoverColor: '#2563eb',   // Color on hover
    hideAfterSelection: false // Whether to hide buttons after a selection
  },
  sanitization: {
    input: 'basic', // 'none', 'basic', or 'strict'
    output: true    // Whether to sanitize received messages
  }
};
