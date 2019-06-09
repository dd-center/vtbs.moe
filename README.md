# vtbs.moe

你好呀→\_→

欢迎来到 <https://vtbs.moe> 的 Github 项目主页

前后端包括数据库都在这个 repository

## 介绍

这是我自娱自乐做出来的 Bilibili 虚拟主播状态记录页面，目前只在NGA宣传过

现在 vtb.simon3k.moe 和 vtbs.moe 两个地址都能用，内容没有区别；推荐用 vtbs.moe

网站用到的部分开源软件:

* 前端架构: [Vue.js](https://cn.vuejs.org)
  * [Vue CLI](https://cli.vuejs.org/zh/)
  * [Vuex](https://vuex.vuejs.org/zh/)
* 组件库: [Element](https://element.eleme.cn/)
* 图表: [ECharts](https://echarts.baidu.com)
  * [v-charts](https://v-charts.js.org)
* 数据库: [level](https://github.com/Level/level)
* 数据采集: [Bili-api](https://github.com/simon300000/bili-api)
* 前后端API通讯: [socket.io](https://socket.io)
* 万能的: [Node.js](https://nodejs.org/zh-cn/)

### Bilibili DD Center, Some internal Relationship

![](bilibili-dd-center.github.io/dependency.svg)

## 开发

安装依赖:

```
npm install
```

### 前端

#### Compiles and hot-reloads for development
```
npm run serve
```

#### Compiles and minifies for production
```
npm run build
```

#### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

### 后端API

```
node index
```

* Socket 服务端口: `8001`
* Vtuber/Vup 列表 见 [api/vtbs.js](api/vtbs.js)

#### 其他

* 检查 `vtbs.js` 列表有没有重复的指令: `npm run repeat`

* 把数据库导出为 json 文件: `node script/db2json`

## 贡献

想要加什么大功能可以先发 issue 讨论讨论，其他的比如vtb列表补全，修BUG什么的可以直接 Pull request

有什么问题可以开 issue

聊天也可以开 issue →\_→
