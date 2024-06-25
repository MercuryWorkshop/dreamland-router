import typescript from 'rollup-plugin-typescript2';

const commonPlugins = () => [
  typescript(),
];

const configs = [
  // import
  {
    input: 'src/index.ts',
    output: {
      file: `dist/index.js`,
      format: 'esm',
      sourcemap: true,
      exports: 'named',
    },
    plugins: commonPlugins(),
  },
  // require
  {
    input: 'src/index.ts',
    output: {
      file: `dist/router.cjs`,
      format: 'umd',
      name: 'router',
      sourcemap: true,
      exports: 'auto',
    },
    plugins: commonPlugins(),
  },
];

export default configs;
