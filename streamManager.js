// uiManager functions (addMessage, updateStreamedMessage, removeTypingIndicator, etc.)
// will be available on the ctx object passed from the main class.

/**
 * Handles Server-Sent Events from the backend.
 * @param {object} ctx - The context from the StreamingChatWidget instance (this)
 * @param {string} eventName - The name of the SSE event.
 * @param {object} data - The parsed data from the SSE event.
 */
function handleStreamEvent(ctx, eventName, data) {
    const { streamState, addMessage, updateStreamedMessage, removeTypingIndicator } = ctx;

    // console.log('SSE Event:', eventName, data);
    if (eventName === 'thread.message.delta' && data.type === 'text_delta') {
        // updateStreamedMessage from uiManager.js now handles creating the message bubble if needed
        // and incrementally rendering the content.
        if (data.content) { // Check if data.content exists
            updateStreamedMessage(ctx, data.content);
        }
    } else if (eventName === 'thread.run.completed') {
        // console.log('Thread run completed. Finalizing stream state.');
        streamState.isStreaming = false;
        removeTypingIndicator(ctx);
        streamState.currentBotMessage = null; 
        streamState.activeMessageContent = ''; 
    } else if (eventName === 'thread.run.failed' || eventName === 'error') {
        addMessage(ctx, 'system', `Error: ${data.error || data.detail || 'An unknown error occurred.'}`);
        streamState.isStreaming = false;
        removeTypingIndicator(ctx);
        streamState.currentBotMessage = null;
        streamState.activeMessageContent = '';
    } else if (eventName === 'stream_end') {
        streamState.isStreaming = false;
        removeTypingIndicator(ctx);
        if (streamState.currentBotMessage && streamState.activeMessageContent === '') {
            // Optional: remove empty bot message bubble if stream ended abruptly
            // This might need more specific handling if the bubble was created by updateStreamedMessage
        }
        streamState.currentBotMessage = null;
        streamState.activeMessageContent = '';
    }
}

/**
 * Fetches and processes the SSE stream from the backend.
 * @param {object} ctx - The context from the StreamingChatWidget instance (this)
 * @param {string} messageText - The user's message.
 */
export async function streamResponseFromServer(ctx, messageText) {
    const { config, streamState, sessionToken, isSessionInitialized, 
            addMessage, removeSendingSpinner, showTypingIndicator } = ctx;

    if (!isSessionInitialized || !sessionToken) {
        addMessage(ctx, 'system', 'Session not initialized. Please try again.');
        removeSendingSpinner(ctx);
        return;
    }
    if (!config.backendStreamUrl) {
        console.error('StreamingChatWidget: backendStreamUrl is not configured.');
        addMessage(ctx, 'system', 'Chat stream endpoint not configured.');
        removeSendingSpinner(ctx);
        return;
    }

    streamState.isStreaming = true;
    streamState.activeMessageContent = ''; // Reset active content for new stream
    streamState.currentBotMessage = null;  // Reset current bot message for new stream

    try {
        const response = await fetch(config.backendStreamUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                session_token: sessionToken,
                message: messageText
            })
        });

        removeSendingSpinner(ctx); // Remove spinner once fetch is initiated or fails quickly

        if (!response.ok || !response.body) {
            const errorData = await response.json().catch(() => ({ detail: response.statusText }));
            addMessage(ctx, 'system', `Error: ${errorData.detail || 'Failed to connect to stream'}`);
            streamState.isStreaming = false;
            return;
        }
        
        showTypingIndicator(ctx);

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
            const { value, done } = await reader.read();
            if (done) {
                if (buffer.trim().length > 0) {
                    console.warn("Stream ended with unprocessed buffer:", buffer);
                }
                if(streamState.isStreaming) { 
                    handleStreamEvent(ctx, 'stream_end', { message: 'Stream closed by server.' });
                }
                break;
            }

            buffer += decoder.decode(value, { stream: true });
            let boundary = buffer.indexOf('\\n\\n'); // SSE events are separated by double newlines

            while (boundary !== -1) {
                const rawSseEvent = buffer.substring(0, boundary);
                buffer = buffer.substring(boundary + 2); // Skip the '\n\n'
                
                let eventName = 'message'; 
                let eventDataLines = [];

                rawSseEvent.split('\\n').forEach(line => { // Split individual lines of an event
                    if (line.startsWith('event:')) {
                        eventName = line.substring('event:'.length).trim();
                    } else if (line.startsWith('data:')) {
                        eventDataLines.push(line.substring('data:'.length).trim());
                    }
                });
                
                const eventData = eventDataLines.join('');

                if (eventData) {
                    try {
                        const parsedData = JSON.parse(eventData);
                        if (eventName === 'cached_message') {
                            // console.log('[DEBUG cached_message_handler] Received event. Parsed data:', parsedData);
                            if (parsedData.role && parsedData.content) {
                                const messageType = parsedData.role === 'assistant' ? 'bot' : parsedData.role;
                                // console.log(`[DEBUG cached_message_handler] Attempting to call addMessage with type: "${messageType}" ...`);
                                addMessage(ctx, messageType, parsedData.content);
                            } else {
                                // console.warn('[DEBUG cached_message_handler] Parsed data missing role or content:', parsedData);
                            }
                        } else { 
                            handleStreamEvent(ctx, eventName, parsedData);
                        }
                    } catch (e) {
                        console.error('Error parsing SSE data:', eventData, e);
                    }
                }
                boundary = buffer.indexOf('\\n\\n');
            }
        }
    } catch (error) {
        console.error('Streaming fetch error:', error);
        addMessage(ctx, 'system', 'Connection error during streaming.');
        streamState.isStreaming = false;
        ctx.removeTypingIndicator(ctx); // Ensure this is called correctly
        removeSendingSpinner(ctx);
    }
}
