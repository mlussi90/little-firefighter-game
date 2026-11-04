import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base './' macht den Build später überall hostbar (z. B. GitHub Pages)
export default defineConfig({ plugins: [react()], base: './' })
