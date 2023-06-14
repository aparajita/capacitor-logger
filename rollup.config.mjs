import json from '@rollup/plugin-json'
// eslint-disable-next-line import/named
import { defineConfig } from 'rollup'

export default defineConfig({
  plugins: [
    json({
      include: '**/info.json',
      indent: '  ',
      namedExports: false,
    }),
  ],
  input: 'dist/esm/index.js',
  output: [
    {
      file: 'dist/plugin.js',
      format: 'iife',
      name: 'capacitorLogger',
      globals: {
        '@capacitor/core': 'capacitorExports',
      },
      sourcemap: !!process.env.SOURCE_MAP,
      inlineDynamicImports: true,
    },
    {
      file: 'dist/plugin.cjs.js',
      format: 'cjs',
      sourcemap: !!process.env.SOURCE_MAP,
      inlineDynamicImports: true,
    },
  ],
  external: ['@capacitor/core'],
})
