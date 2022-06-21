const path = require('path')

module.exports = env => {
  console.log('Production', env.production)
  return {
    entry: './src/index.js',
    output: {
      filename: 'pimex-chat.js',
      path: path.resolve(__dirname, 'dist')
    }
  }
}
