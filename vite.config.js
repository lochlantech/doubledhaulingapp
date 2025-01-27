import { defineConfig } from 'vite';

export default defineConfig({
    root: './web', // Set the root to the "web" folder
    build: {
        outDir: '../dist', // Output folder for production builds
        emptyOutDir: true,
    },
    server: {
        port: 3001, // Change the development server port if needed
    },
});