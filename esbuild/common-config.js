let isDevelopment = process.argv.includes('--dev');

module.exports = {
  define: { 'process.env.NODE_ENV': isDevelopment ? '"development"' : '"production"' },
  minify: !isDevelopment,
  sourcemap: isDevelopment && 'inline',
}
