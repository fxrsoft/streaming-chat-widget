import { createIconElement } from './utils.js';
// DOMPurify and marked will be available globally via CDN as per user's setup

/**
 * Add a message to the chat
 * @param {object} ctx - The context from the StreamingChatWidget instance (this)
 * @param {string} type - Message type ('bot', 'user', or 'system')
 * @param {string} content - Message content
 */
export function addMessage(ctx, type, content) {
  const { config, namespace, elements } = ctx;

  if (!elements.chatMessages) return;

  if (type === 'system') {
    const systemMsg = document.createElement('div');
    systemMsg.className = `${namespace}-system-message`;
    systemMsg.textContent = content;
    elements.chatMessages.appendChild(systemMsg);

    if (content === 'Initializing chat session...' || content === 'Chat session started.' || content === 'Initializing session before sending...') {
      setTimeout(() => {
        if (systemMsg && systemMsg.parentNode) {
          systemMsg.parentNode.removeChild(systemMsg);
        }
      }, 3000);
    }
  } else if (type === 'user') {
    const wrapper = document.createElement('div');
    wrapper.className = `${namespace}-message-with-avatar ${namespace}-user-message-container`;
    
    const avatar = document.createElement('div');
    avatar.className = `${namespace}-avatar ${namespace}-user-avatar`;
    avatar.innerHTML = createIconElement(config.icons.userAvatar);
    
    const message = document.createElement('div');
    message.className = `${namespace}-message ${namespace}-user-message`;
    message.textContent = content; // User messages are plain text
    
    wrapper.appendChild(avatar);
    wrapper.appendChild(message);
    elements.chatMessages.appendChild(wrapper);
  } else if (type === 'bot') {
    const wrapper = document.createElement('div');
    wrapper.className = `${namespace}-message-with-avatar ${namespace}-bot-message-container`;
    
    const avatar = document.createElement('div');
    avatar.className = `${namespace}-avatar ${namespace}-bot-avatar`;
    avatar.innerHTML = createIconElement(config.icons.botAvatar);
    
    const message = document.createElement('div');
    message.className = `${namespace}-message ${namespace}-bot-message`;
    
    // Initial content for bot message, might be empty if streaming
    let htmlContent = marked.parse(content || ''); 

    // Post-process HTML for image styles (if any in initial content)
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    const images = tempDiv.querySelectorAll('img');
    images.forEach(img => {
        const title = img.getAttribute('title');
        if (title) {
            const styleRegex = /style="([^"]*)"/;
            const match = title.match(styleRegex);
            if (match && match[1]) {
                const styleValue = match[1];
                img.style.cssText = img.style.cssText ? img.style.cssText.replace(/;$/, '') + ';' + styleValue : styleValue;
                let newTitle = title.replace(styleRegex, '').replace(/\s*\/[\s)]*$/, '').trim();
                if (newTitle) {
                    img.setAttribute('title', newTitle);
                } else {
                    img.removeAttribute('title');
                }
            }
        }
    });
    htmlContent = tempDiv.innerHTML;

    if (config.sanitization.output) {
      message.innerHTML = DOMPurify.sanitize(htmlContent, {
        ADD_TAGS: ['iframe', 'video', 'source'], 
        ALLOW_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'ul', 'ol', 'li', 'br', 'img', 'pre', 'code', 'blockquote', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hr', 'span'], 
        ALLOW_ATTR: ['href', 'src', 'alt', 'title', 'target', 'rel', 'class', 'style', 'controls', 'autoplay', 'loop', 'muted', 'poster', 'preload', 'width', 'height', 'type', 'frameborder', 'allowfullscreen', 'allow'],
        ADD_ATTR: ['target', 'rel'] 
      });
    } else {
      message.innerHTML = htmlContent;
    }

    // --- BEGIN YouTube Embed Logic (Applied to initial content) ---
    const youtubeEmbedDiv = document.createElement('div');
    youtubeEmbedDiv.innerHTML = message.innerHTML; 

    youtubeEmbedDiv.querySelectorAll('a').forEach(link => {
        try {
            const url = new URL(link.href);
            let videoId = null;

            if (url.hostname === 'www.youtube.com' || url.hostname === 'youtube.com') {
                if (url.pathname === '/watch') {
                    videoId = url.searchParams.get('v');
                } else if (url.pathname.startsWith('/embed/')) {
                    videoId = url.pathname.substring('/embed/'.length);
                }
            } else if (url.hostname === 'youtu.be') {
                videoId = url.pathname.substring(1);
            }

            if (videoId) {
                const iframe = document.createElement('iframe');
                iframe.setAttribute('src', `https://www.youtube.com/embed/${videoId}`);
                iframe.setAttribute('width', '100%'); 
                const parentWidth = message.offsetWidth || 300; 
                iframe.setAttribute('height', `${Math.round(parentWidth * 9 / 16)}`); 
                iframe.setAttribute('frameborder', '0');
                iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
                iframe.setAttribute('allowfullscreen', '');
               
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
    // --- END YouTube Embed Logic ---
    
    wrapper.appendChild(avatar);
    wrapper.appendChild(message);
    elements.chatMessages.appendChild(wrapper);
  }
  
  scrollToBottom(ctx);
}

/**
 * Update an existing message's content (typically for streaming bot messages)
 * @param {object} ctx - The context from the StreamingChatWidget instance (this)
 * @param {string} type - Message type (should be 'bot')
 * @param {string} newContentFragment - The new fragment of content to append/render
 */
export function updateStreamedMessage(ctx, newContentFragment) {
  const { config, streamState, namespace } = ctx;

  if (!streamState.currentBotMessage && ctx.elements.chatMessages) {
      // Create a new bot message bubble if one isn't active
      addMessage(ctx, 'bot', ''); // Add an empty bot message, content will be filled
      const lastBotMessageContainer = ctx.elements.chatMessages.querySelector(`.${namespace}-bot-message-container:last-child`);
      if (lastBotMessageContainer) {
          streamState.currentBotMessage = lastBotMessageContainer.querySelector(`.${namespace}-bot-message`);
      }
  }

  if (streamState.currentBotMessage && newContentFragment) {
      streamState.activeMessageContent += newContentFragment;
      
      let htmlContent = marked.parse(streamState.activeMessageContent);

      // Post-process HTML for image styles
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlContent;
      const images = tempDiv.querySelectorAll('img');
      images.forEach(img => {
          const title = img.getAttribute('title');
          if (title) {
              const styleRegex = /style="([^"]*)"/;
              const match = title.match(styleRegex);
              if (match && match[1]) {
                  const styleValue = match[1];
                  img.style.cssText = img.style.cssText ? img.style.cssText.replace(/;$/, '') + ';' + styleValue : styleValue;
                  let newTitle = title.replace(styleRegex, '').replace(/\s*\/[\s)]*$/, '').trim();
                  if (newTitle) {
                      img.setAttribute('title', newTitle);
                  } else {
                      img.removeAttribute('title');
                  }
              }
          }
      });
      htmlContent = tempDiv.innerHTML;

      if (config.sanitization.output) {
          streamState.currentBotMessage.innerHTML = DOMPurify.sanitize(htmlContent, {
              ADD_TAGS: ['iframe', 'video', 'source'],
              ALLOW_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'ul', 'ol', 'li', 'br', 'img', 'pre', 'code', 'blockquote', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hr', 'span'],
              ALLOW_ATTR: ['href', 'src', 'alt', 'title', 'target', 'rel', 'class', 'style', 'controls', 'autoplay', 'loop', 'muted', 'poster', 'preload', 'width', 'height', 'type', 'frameborder', 'allowfullscreen', 'allow'],
              ADD_ATTR: ['target', 'rel']
          });
      } else {
          streamState.currentBotMessage.innerHTML = htmlContent;
      }

      // --- BEGIN YouTube Embed Logic (Applied incrementally) ---
      const youtubeEmbedDiv = document.createElement('div');
      youtubeEmbedDiv.innerHTML = streamState.currentBotMessage.innerHTML; 

      youtubeEmbedDiv.querySelectorAll('a').forEach(link => {
          try {
              const url = new URL(link.href);
              let videoId = null;

              if (url.hostname === 'www.youtube.com' || url.hostname === 'youtube.com') {
                  if (url.pathname === '/watch') {
                      videoId = url.searchParams.get('v');
                  } else if (url.pathname.startsWith('/embed/')) {
                      videoId = url.pathname.substring('/embed/'.length);
                  }
              } else if (url.hostname === 'youtu.be') {
                  videoId = url.pathname.substring(1);
              }

              if (videoId) {
                  const iframe = document.createElement('iframe');
                  iframe.setAttribute('src', `https://www.youtube.com/embed/${videoId}`);
                  iframe.setAttribute('width', '100%'); 
                  const parentWidth = streamState.currentBotMessage.offsetWidth || 300; 
                  iframe.setAttribute('height', `${Math.round(parentWidth * 9 / 16)}`); 
                  iframe.setAttribute('frameborder', '0');
                  iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
                  iframe.setAttribute('allowfullscreen', '');
                 
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
      // --- END YouTube Embed Logic ---
     
      scrollToBottom(ctx);
  }
}


/**
 * Show sending spinner
 * @param {object} ctx - The context from the StreamingChatWidget instance (this)
 */
export function showSendingSpinner(ctx) {
  const { namespace, elements, streamState } = ctx;
  removeSendingSpinner(ctx); // Remove existing spinner if any
  
  const spinner = document.createElement('div');
  spinner.className = `${namespace}-sending-spinner`;
  
  const dots = document.createElement('div');
  dots.className = `${namespace}-sending-spinner-dots`;
  
  for (let i = 0; i < 3; i++) {
    const dot = document.createElement('span');
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

/**
 * Remove sending spinner
 * @param {object} ctx - The context from the StreamingChatWidget instance (this)
 */
export function removeSendingSpinner(ctx) {
  const { streamState } = ctx;
  if (streamState.sendingSpinner && streamState.sendingSpinner.parentNode) {
    streamState.sendingSpinner.parentNode.removeChild(streamState.sendingSpinner);
    streamState.sendingSpinner = null;
  }
}

/**
 * Show typing indicator
 * @param {object} ctx - The context from the StreamingChatWidget instance (this)
 */
export function showTypingIndicator(ctx) {
  const { namespace, elements, streamState } = ctx;
  if (streamState.typingIndicator && streamState.typingIndicator.parentNode) {
    return;
  }
  
  const typingIndicator = document.createElement('div');
  typingIndicator.className = `${namespace}-typing-indicator`;
  
  for (let i = 0; i < 3; i++) {
    const dot = document.createElement('span');
    typingIndicator.appendChild(dot);
  }
  
  elements.chatMessages.appendChild(typingIndicator);
  streamState.typingIndicator = typingIndicator;
  scrollToBottom(ctx);
}

/**
 * Remove typing indicator
 * @param {object} ctx - The context from the StreamingChatWidget instance (this)
 */
export function removeTypingIndicator(ctx) {
  const { streamState } = ctx;
  if (streamState.typingIndicator && streamState.typingIndicator.parentNode) {
    streamState.typingIndicator.parentNode.removeChild(streamState.typingIndicator);
    streamState.typingIndicator = null;
  }
}

/**
 * Scroll the messages container to the bottom
 * @param {object} ctx - The context from the StreamingChatWidget instance (this)
 */
export function scrollToBottom(ctx) {
  const { elements } = ctx;
  if (elements.chatMessages) {
    elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
  }
}
