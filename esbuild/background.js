let config = require('./common-config');

require('esbuild').build({
  entryPoints: ['src/core/background/background.js'],
  outfile: 'dist/background.js',
  bundle: true,
  ...config,
});
