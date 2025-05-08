# Streaming Chat Widget

A customizable Streaming (SSE) chat widget for websites.

## Features

- Easy to integrate into any website.
- Customizable theme and text.
- Uses Server-Sent Events (SSE) for real-time communication.
- Markdown support for messages (via `marked.js`).
- HTML sanitization (via `DOMPurify`).

## Files

- `streaming-chat-widget.js`: The main widget JavaScript file.
- `streaming-chat-widget.min.js`: Minified version of the widget JavaScript.
- `streaming-chat-widget.css`: The CSS styles for the widget.
- `index.html`: An example implementation.

## Prerequisites

This widget relies on two external libraries for full functionality:

- **Marked.js**: For rendering Markdown in chat messages.
- **DOMPurify**: For sanitizing HTML in chat messages to prevent XSS attacks.

You should include these in your HTML before the chat widget script. You can use CDN links:

```html
<script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/dompurify/dist/purify.min.js"></script>
```

## How to Use

1.  **Include CSS and JS:**
    Add the widget's CSS file to the `<head>` of your HTML page and the JavaScript file (either `streaming-chat-widget.js` or the minified `streaming-chat-widget.min.js`) before the closing `</body>` tag, after the prerequisites.

    ```html
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Chat Widget Example</title>
        <link rel="stylesheet" href="streaming-chat-widget.css">
        <!-- Prerequisites -->
        <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/dompurify/dist/purify.min.js"></script>
    </head>
    <body>
        <!-- Your page content -->

        <button id="toggleChatButton">Toggle Chat</button>

        <script src="streaming-chat-widget.min.js"></script> <!-- Or streaming-chat-widget.js -->
        <script>
            // Initialize and use the widget (see below)
        </script>
    </body>
    </html>
    ```

2.  **Initialize the Widget:**
    Create a new instance of `StreamingChatWidget` with your desired configuration options.

    ```javascript
    const chatWidget = new StreamingChatWidget({
        // Required: Used by sessionEndpointUrl to identify the chat session
        chatId: 'YOUR_UNIQUE_CHAT_ID', 

        // Required: Endpoint to initialize or retrieve session details (e.g., user ID, session token)
        // This endpoint should typically return a JSON object with session information.
        // The widget will POST to this URL with { chatId: "YOUR_UNIQUE_CHAT_ID" }
        sessionEndpointUrl: 'YOUR_SESSION_ENDPOINT_URL', 

        // Required: The URL for the Server-Sent Events (SSE) stream
        // The widget will append query parameters like `userId` and `sessionToken` (if returned by sessionEndpointUrl)
        backendStreamUrl: 'YOUR_SSE_BACKEND_STREAM_URL', 

        // Optional: Customize the appearance
        theme: {
            primaryColor: '#3B82F6',
            secondaryColor: '#1E40AF',
            userMessageBg: '#EFF6FF',
            userMessageText: '#1E40AF',
            botMessageBg: '#F9FAFB',
            botMessageText: '#111827',
            systemMessageBg: '#F3F4F6',
            systemMessageText: '#4B5563'
            // Add other theme properties as needed
        },

        // Optional: Customize the default text
        text: {
            headerTitle: 'Chat with Us',
            welcomeMessage: 'Hello! How can we help you today?',
            inputPlaceholder: 'Type your message...'
            // Add other text properties as needed
        },
        
        // Optional: Initial visibility of the chat widget (default: false)
        // openOnInit: false,

        // Optional: Element to which the widget will be appended (default: document.body)
        // appendTo: document.getElementById('my-chat-container'),

        // Optional: Callback function when a message is received from the stream
        // onMessageReceived: function(message) {
        //     console.log('Message received from stream:', message);
        // },

        // Optional: Callback function when a message is sent by the user
        // onMessageSent: function(message) {
        //     console.log('Message sent by user:', message);
        // }
    });
    ```

3.  **Control the Widget:**
    You can control the widget using its methods. For example, to toggle its visibility:

    ```javascript
    // Example: Toggle chat when a button is clicked
    document.getElementById('toggleChatButton').addEventListener('click', async () => {
        // Initialize session on first toggle if not already done
        if (!chatWidget.isSessionInitialized) {
            console.log('Initiating chat session...');
            await chatWidget.initSession(); 
        }
        chatWidget.toggleChat();
    });

    // You can also initialize the session on page load if preferred:
    // async function initializeChat() {
    //     if (chatWidget && !chatWidget.isSessionInitialized) {
    //         await chatWidget.initSession();
    //     }
    // }
    // initializeChat();
    ```

    Available methods on the `chatWidget` instance typically include:
    - `initSession()`: Initializes the chat session by calling the `sessionEndpointUrl`.
    - `toggleChat()`: Toggles the visibility of the chat widget.
    - `openChat()`: Opens the chat widget.
    - `closeChat()`: Closes the chat widget.
    - `sendMessage(text)`: Sends a message programmatically. (Note: The primary way to send messages is via the widget's input field).
    - `isSessionInitialized` (property): Boolean indicating if the session has been initialized.

## Example

See `index.html` in this directory for a working example. You will need to update the `chatId`, `sessionEndpointUrl`, and `backendStreamUrl` in `index.html` to point to your actual backend services.

## Using with jsDelivr CDN

Once these files are pushed to a GitHub repository, you can use jsDelivr to serve them.

For example, if your GitHub repository is `https://github.com/your-username/streaming-chat-widget/`:

-   CSS: `https://cdn.jsdelivr.net/gh/your-username/streaming-chat-widget@latest/streaming-chat-widget.css`
-   JS (minified): `https://cdn.jsdelivr.net/gh/your-username/streaming-chat-widget@latest/streaming-chat-widget.min.js`

Replace `your-username` with your GitHub username and `streaming-chat-widget` with your repository name. You can also pin to a specific version/tag/commit instead of `@latest`.
