/**
 * 
 * OLD
 * 
 */

// import { defineConfig } from 'vite';
// import react from '@vitejs/plugin-react-swc'; // ✅ Usando o plugin SWC

// export default defineConfig({
//   plugins: [react()],
//   server: {
//     host: '0.0.0.0',
//     port: 3000,
//     proxy: {
//       '/api': {
//         target: process.env.VITE_API_URL || 'http://localhost:8000',
//         changeOrigin: true,
//       },
//       '/uploads': {
//         target: process.env.VITE_API_URL || 'http://localhost:8000',
//         changeOrigin: true,
//       }
//     }
//   }
// });

import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';

export default defineConfig(({ command, mode }) => {
  // Carrega variáveis de ambiente do arquivo .env
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    
    // Configurações do servidor apenas em desenvolvimento
    server: command === 'serve' ? {
      host: 'localhost', // Restringe ao localhost (não expõe na rede)
      port: 3000,
      strictPort: true, // Impede fallback para outras portas
      proxy: {
        '/api': {
          target: env.VITE_API_URL || 'http://localhost:8000',
          changeOrigin: true,
          secure: false,
        },
        '/uploads': {
          target: env.VITE_API_URL || 'http://localhost:8000',
          changeOrigin: true,
          secure: false,
        }
      }
    } : undefined, // Ignora em produção
  };
});