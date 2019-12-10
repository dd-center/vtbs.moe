module.exports = api => {
  api.cache(true)

  const presets = ['@vue/cli-plugin-babel/preset']
  const plugins = [
    '@babel/plugin-proposal-optional-chaining',
    '@babel/plugin-transform-runtime',
    ['@babel/plugin-proposal-pipeline-operator', { proposal: 'smart' }],
    ['component', { libraryName: 'element-ui', styleLibraryName: 'theme-chalk' }],
  ]

  return {
    presets,
    plugins,
  }
}
