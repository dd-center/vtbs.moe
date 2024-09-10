<h1 align="center">
  vtbs.moe
</h1>

<h3 align="center">
  VTBs on bilibili - B站虚拟主播统计网站
</h3>

<p align="center">
  <a href="https://github.com/dd-center/vtbs.moe/commits/master">
    <img src="https://img.shields.io/github/commit-activity/w/dd-center/vtbs.moe.svg?color=green">
  </a>
  <a href="https://github.com/dd-center/vtbs.moe/graphs/contributors">
    <img src="https://img.shields.io/github/contributors/dd-center/vtbs.moe.svg">
  </a>
  <br>
  <a href="https://vtbs.moe/">
    <img src="https://img.shields.io/endpoint.svg?url=https://api.vtbs.moe/endpoint/vtbs">
  </a>
  <a href="https://vtbs.moe/live">
    <img src="https://img.shields.io/endpoint.svg?url=https://api.vtbs.moe/endpoint/live">
  </a>
  <a href="https://vtbs.moe/macro">
    <img src="https://img.shields.io/endpoint.svg?url=https://api.vtbs.moe/endpoint/guardNum">
  </a>
  <a href="https://vtbs.moe/macro">
    <img src="https://img.shields.io/endpoint.svg?url=https://api.vtbs.moe/endpoint/onlineSum">
  </a>
</p>

你好呀→\_→

欢迎来到 <https://vtbs.moe> 的 Github 项目主页

前后端包括数据库都在这个 repository

## 介绍

这是我自娱自乐做出来的 Bilibili 虚拟主播状态记录页面 [vtbs.moe](https://vtbs.moe/)

<img alt="demo" src="./assets/demo.png" width="420" align="right" style="max-width: 50%">

网站用到的部分开源软件:

* 前端
  * 框架: [Vue.js](https://vuejs.org)
    * [Vue CLI](https://cli.vuejs.org/)
    * [Vuex](https://vuex.vuejs.org/)
  * 组件库: [Element](https://element.eleme.cn/)
  * 图表: [ECharts](https://echarts.baidu.com)
    * [v-charts](https://v-charts.js.org)
* 后端
  * 数据库: [level](https://github.com/Level/level)
  * 数据采集: [Bili-api](https://github.com/simon300000/bili-api)
  * 前后端API通讯: [socket.io](https://socket.io)
  * Open JSON API: [koa](https://koajs.com)
  * 万能的: [Node.js](https://nodejs.org/zh-cn/)

## Open API

vtbs.moe does provide some public APIs. Please do not abuse.

[api.md](api.md)


### DD Center org, Some internal relationship.

详情: https://dd-center.github.io

![dependency](https://dd-center.github.io/dependency.svg)

## 开发

[development.md](development.md)

## 贡献

想要加什么大功能可以先发 issue 讨论讨论，其他的比如vtb列表补全，修BUG什么的可以直接 Pull request

有什么问题可以开 issue

聊天也可以开 issue →\_→

This project is tested with BrowserStack