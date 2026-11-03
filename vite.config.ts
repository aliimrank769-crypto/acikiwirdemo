import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { localTourismApiPlugin } from './server/apiPlugin';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  Object.assign(process.env, env);

  return {
    plugins: [react(), localTourismApiPlugin()],
    server: {
      port: 5173,
      host: true,
    },
  };
});

