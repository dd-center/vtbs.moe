const webpack = require('webpack')
const CopyPlugin = require('copy-webpack-plugin')

module.exports = {
  lintOnSave: false,
  pwa: {
    iconPaths: {
      favicon32: 'img/icons/favicon-32x32.png',
      favicon16: 'img/icons/favicon-16x16.png',
      appleTouchIcon: 'img/icons/apple-touch-icon-1024x1024.png',
      maskIcon: 'img/icons/safari-pinned-tab.svg',
    },
    themeColor: '#afd4e3',
    name: 'VTBs in bilibili!',
    appleMobileWebAppCapable: 'yes',
    workboxPluginMode: 'InjectManifest',
    workboxOptions: {
      swSrc: 'src/service-worker.js',
    },
  },
  chainWebpack: config => {
    config.module.rule('js').exclude.add(/\.worker\.js$/)
  },
  configureWebpack: {
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
    ],
  },
}
