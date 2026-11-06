import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Procura recursivamente por arquivos .test.ts ou .spec.ts
    include: ['src/**/*.test.ts', 'src/**/*.spec.ts'],
    // Executa os arquivos em paralelo por padrão
    fileParallelism: true,
  },
});