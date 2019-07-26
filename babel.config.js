module.exports = {
  presets: [
    '@vue/app',
  ],
  plugins: [
    '@babel/plugin-proposal-optional-chaining',
    [
      'component',
      {
        libraryName: 'element-ui',
        styleLibraryName: 'theme-chalk',
      },
    ],
  ],
}
