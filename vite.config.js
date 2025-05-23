import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'streamingChatWidget.js'), // We will create this main entry file
      name: 'StreamingChatWidget', // The global variable name for UMD build
      fileName: (format) => `streaming-chat-widget.${format === 'umd' ? 'min.js' : 'js'}`, // Output as streaming-chat-widget.js for es, and .min.js for umd
      formats: ['es', 'umd'] // ES module and UMD
    },
    rollupOptions: {
      // Externalize deps that shouldn't be bundled
      // e.g., if you expect 'marked' and 'dompurify' to be loaded separately by the user
      external: ['marked', 'dompurify'],
      output: {
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {
          marked: 'marked',
          dompurify: 'DOMPurify'
        },
        // We want the output directly in the current directory for the .js and .min.js files
        // Vite's default is 'dist', but we can override that by not setting `outDir`
        // and relying on fileName to place it correctly.
        // However, to be explicit and ensure it goes to the root of v2:
        dir: path.resolve(__dirname, './'), 
      }
    },
    // To output directly to the project root (streaming-chat-widget-v2) instead of a 'dist' folder
    // We set `outDir` to './' relative to the vite.config.js location.
    // This is handled by `rollupOptions.output.dir` above.
    // outDir: './', // This might conflict with rollupOptions.output.dir, let's rely on rollupOptions
    emptyOutDir: false, // Important: do not clear the directory, as other files exist
    minify: 'terser', // Use terser for minification for the UMD build
  },
});
