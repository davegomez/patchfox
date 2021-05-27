let config = require('./common-config');

require('esbuild').buildSync({
  entryPoints: ['src/core/platforms/ssb/ssb.js'],
  bundle: true,
  outfile: 'dist/ssb.js',
  ...config,
});
