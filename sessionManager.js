// addMessage will be imported in the main class and passed in ctx
// For now, this module assumes addMessage is part of the passed context (ctx)

/**
 * Initialize session with the backend.
 * Makes an HTTP request to get a session token and assistant ID.
 * @param {object} ctx - The context from the StreamingChatWidget instance (this)
 *                       Expected properties: config, isSessionInitialized, sessionToken, assistantId,
 *                                          addMessage (method from uiManager)
 */
export async function initSession(ctx) {
    const { config, addMessage } = ctx; // Properties like isSessionInitialized, sessionToken, assistantId will be mutated on ctx directly

    if (ctx.isSessionInitialized) {
        // console.log('Session already initialized.');
        return;
    }
    if (!config.chatId || !config.sessionEndpointUrl) {
        console.error('StreamingChatWidget: Cannot init session. Missing chatId or sessionEndpointUrl in config.');
        addMessage(ctx, 'system', 'Chat initialization failed: Configuration error.');
        return;
    }

    try {
        addMessage(ctx, 'system', 'Initializing chat session...'); // Inform user
        const response = await fetch(config.sessionEndpointUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ chatid: config.chatId }),
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({ detail: response.statusText }));
            throw new Error(errData.detail || `HTTP error ${response.status}`);
        }

        const data = await response.json();
        ctx.sessionToken = data.session_token;
        ctx.assistantId = data.assistant_id;
        ctx.isSessionInitialized = true;

        // console.log('Session initialized. Token:', ctx.sessionToken, 'Assistant ID:', ctx.assistantId);
        addMessage(ctx, 'system', 'Chat session started.'); // Clear "Initializing..."
    } catch (error) {
        console.error('Error initiating chat session:', error);
        addMessage(ctx, 'system', 'Failed to start chat session: ' + error.message);
        ctx.isSessionInitialized = false; // Ensure it's marked as not initialized
    }
}
