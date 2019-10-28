const vue = require('@vue/cli-plugin-babel/preset')()

module.exports = {
  presets: [
    ...vue.presets,
  ],
  plugins: [
    ...vue.plugins,
    '@babel/plugin-proposal-optional-chaining',
    ['@babel/plugin-proposal-pipeline-operator', { proposal: 'smart' }],
    [
      'component',
      {
        libraryName: 'element-ui',
        styleLibraryName: 'theme-chalk',
      },
    ],
  ],
}
