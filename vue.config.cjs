const webpack = require('webpack')
const CopyPlugin = require('copy-webpack-plugin')
const GitRevisionPlugin = require('git-revision-webpack-plugin')
const gitRevisionPlugin = new GitRevisionPlugin()

module.exports = {
  css: {
    sourceMap: true
  },
  lintOnSave: false,
  pwa: {
    iconPaths: {
      favicon32: null,
      favicon16: null,
      faviconSVG: 'favicon.svg',
      appleTouchIcon: 'favicon.svg',
      maskIcon: 'favicon.svg',
    },
    themeColor: '#afd4e3',
    name: 'VTBs in bilibili!',
    appleMobileWebAppCapable: 'yes',
    workboxPluginMode: 'InjectManifest',
    workboxOptions: {
      swSrc: './src/service-worker.js',
    },
  },
  chainWebpack: config => {
    config.module.rule('js').exclude.add(/\.worker\.js$/)
  },
  configureWebpack: {
    devtool: 'source-map',
    module: {
      rules: [
        {
          test: /\.worker\.js$/,
          use: {
            loader: 'worker-loader',
            options: { inline: true },
          },
        },
      ],
    },
    plugins: [
      new webpack.ContextReplacementPlugin(
        /moment[/\\]locale$/,
        /zh-cn/,
      ),
      new CopyPlugin([
        { from: 'BiliChat/docs', to: 'BiliChat' },
      ]),
      new webpack.DefinePlugin({ COMMIT_HASH: JSON.stringify(gitRevisionPlugin.commithash()) }),
    ],
  },
}
