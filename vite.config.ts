import tailwindcss from '@tailwindcss/postcss';
import vinext from 'vinext';
import { defineConfig } from 'vite';
export default defineConfig({
  css: { postcss: { plugins: [tailwindcss()] } },
  resolve: { dedupe: ['react', 'react-dom', 'three'] },
  optimizeDeps: {
    include: [
      'react',
      'react-dom/client',
      'gsap',
      'lucide-react',
      'three',
      '@react-three/fiber',
      '@react-three/drei',
    ],
  },
  plugins: [vinext()],
});
