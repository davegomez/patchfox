let config = require('./common-config');

require('esbuild').build({
  entryPoints: ['src/core/browserAction/browserAction.js'],
  outfile: 'dist/browserAction.js',
  ...config,
});
