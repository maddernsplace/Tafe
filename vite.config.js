import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages deploys to https://<username>.github.io/<repo-name>/
// Set base to '/' for a user/org site, or '/<repo-name>/' for a project site.
// The VITE_BASE_PATH env var lets you override this at build time.
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE_PATH || '/',
})
