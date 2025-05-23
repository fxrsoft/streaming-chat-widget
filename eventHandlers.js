/**
 * Attach event listeners to widget elements
 * @param {object} ctx - The context from the StreamingChatWidget instance (this)
 *                       Expected properties: elements, toggleChat, hideChat, sendMessage (methods)
 */
export function attachEventListeners(ctx) {
  const { elements, toggleChat, hideChat, sendMessage } = ctx;

  // Toggle chat panel when chat button is clicked
  elements.chatButton.addEventListener('click', () => {
    toggleChat.call(ctx); // Call in the context of the instance
  });
  
  // Close chat panel when close button is clicked
  elements.closeButton.addEventListener('click', () => {
    hideChat.call(ctx); // Call in the context of the instance
  });
  
  // Send message when send button is clicked
  elements.sendButton.addEventListener('click', () => {
    sendMessage.call(ctx); // Call in the context of the instance
  });
  
  // Send message when Enter key is pressed in input
  elements.chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      sendMessage.call(ctx); // Call in the context of the instance
    }
  });
}

/**
 * Handle predefined question click
 * This function is passed to uiBuilder.createPredefinedButtons and called from there.
 * It needs to be a method of the main class or bound to it to have access to `this.sendMessage`.
 * For modularity, we define it here and the main class will pass its bound version or call it with context.
 * @param {object} ctx - The context from the StreamingChatWidget instance (this)
 * @param {string|object} questionText - The question text/value to send
 */
export async function handlePredefinedQuestion(ctx, questionText) {
  const { config, elements, sendMessage } = ctx;

  const messageText = typeof questionText === 'object' ? 
    (questionText.toString && questionText.toString() !== '[object Object]' ? questionText.toString() : '') : 
    String(questionText || '');
  
  // sendMessage will handle adding the user message to UI and clearing input
  await sendMessage.call(ctx, messageText); // Call in the context of the instance
  
  if (config.predefinedQuestions.hideAfterSelection && elements.predefinedContainer) {
    elements.predefinedContainer.style.display = 'none';
  }
}
