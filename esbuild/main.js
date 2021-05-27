let sveltePlugin = require('esbuild-svelte');
let sassPlugin = require('esbuild-sass-plugin').sassPlugin;
let config = require('./common-config');

require('esbuild').build({
  entryPoints: ['src/main.js'],
  outfile: 'dist/bundle.js',
  bundle: true,
  plugins: [
    sveltePlugin(), 
    sassPlugin({
      type: "css-text",
    })
  ],
  ...config,
});
