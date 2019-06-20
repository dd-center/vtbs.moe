<h1 align="center">
  <img src="./dd-left.png" width=24>
  vtbs.moe
  <img src="./dd-right.png" width=24>
</h1>

<h3 align="center">
  VTBs on bilibili - B站虚拟主播统计网站
</h3>

<p align="center">
  <img src="https://img.shields.io/github/commit-activity/w/bilibili-dd-center/vtbs.moe.svg?color=green">
  <img src="https://img.shields.io/badge/dynamic/json.svg?label=vtubers&query=%24.length&url=https%3A%2F%2Fapi.vtbs.moe%2Fv1%2Fvtbs?color=blue">
  <img src="https://img.shields.io/github/contributors/bilibili-dd-center/vtbs.moe.svg">
</p>

你好呀→\_→

欢迎来到 <https://vtbs.moe> 的 Github 项目主页

前后端包括数据库都在这个 repository

## 介绍

这是我自娱自乐做出来的 Bilibili 虚拟主播状态记录页面

> 现在 vtb.simon3k.moe 和 vtbs.moe 两个地址都能用，内容没有区别；推荐用 [vtbs.moe](https://vtbs.moe/)

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

### V1 (JSON)

​	Simple JSON API.

* #### vtbs <https://api.vtbs.moe/v1/vtbs>

  => Array, `[...{mid, note}]`

  Return list of vtbs, without any further information.

  **Example:** <https://api.vtbs.moe/v1/vtbs>

  ```json
  [{
      "mid": 1576121,
      "note": ["Paryi", "p妈"]
    }, {
      "mid": 372984197,
      "note": ["Shiori", "大姐"]
    }, {
      "mid": 349991143,
      "note": ["Kagura Mea", "咩咩", "田中庄司", "屑女仆", "tekoki", "手冲", "口区"]
    }, {
      "mid": 8119834,
      "note": ["Hana"]
    },
    ...
  ]
  ```

  Keys:

  * mid: Number

    The numbered user ID, appeared after <https://space.bilibili.com/>.

  * note: Array

    Just some Note...

* #### info <https://api.vtbs.moe/v1/info>

  => Array, `[...{mid, uname, …}]`

  Return records of all vtbs.

  **Example:** <https://api.vtbs.moe/v1/info>

  ```json
  [{
      "mid": 1576121,
      "uname": "帕里_Paryi",
      "video": 55,
      "roomid": 4895312,
      "sign": "我是paryipro的画师paryi~中国朋友们好~请大家关注我~paryi审核群：439902287",
      "notice": "",
      "face": "http://i2.hdslb.com/bfs/face/0f1f65edca3d354a974edb7a6bec01646bcfa4db.jpg",
      "rise": 1302,
      "topPhoto": "http://i0.hdslb.com/bfs/space/81a39f45e49364646274f6e6d4f406d18fdb6afd.png",
      "archiveView": 2691646,
      "follower": 94667,
      "liveStatus": 0,
      "recordNum": 958,
      "guardNum": 22,
      "liveNum": 1100,
      "lastLive": {
        "online": 121883,
        "time": 1560088457424
      },
      "averageLive": 42276996.14747928,
      "weekLive": 45900000,
      "guardChange": 270,
      "guardType": [0, 0, 22],
      "areaRank": 1000,
      "online": 0,
      "title": "b限定】明日方舟",
      "time": 1560102857468
    }
    ...
  ]
  ```

* #### Detail <https://api.vtbs.moe/v1/detail/:mid>

  => Object, `{mid, uname, …}`

  Return record of certain vtb based on given mid.

  **Example:** <https://api.vtbs.moe/v1/detail/349991143>

  ```json
  {
    "mid": 349991143,
    "uname": "神楽めあOfficial",
    "video": 188,
    "roomid": 12235923,
    "sign": "这里是神楽めあ(KaguraMea)！来自日本的清楚系虚拟YouTuber～weibo:@kaguramea　",
    "notice": "",
    "face": "http://i2.hdslb.com/bfs/face/49e143e1cae7f9e51b36c6c670976a95cc41ce12.jpg",
    "rise": 998,
    "topPhoto": "http://i0.hdslb.com/bfs/space/cde2a0fe3273ae4466d135541d965e21c58a7454.png",
    "archiveView": 21543188,
    "follower": 366159,
    "liveStatus": 0,
    "recordNum": 1268,
    "guardNum": 970,
    "liveNum": 559,
    "lastLive": {
      "online": 354234,
      "time": 1558976168120
    },
    "averageLive": 21271218.38426421,
    "weekLive": 0,
    "guardChange": 953,
    "guardType": [1, 15, 960],
    "areaRank": 2,
    "online": 0,
    "title": "【B限】MeAqua 協力お料理!!!!",
    "time": 1560103157470
  }
  ```

* #### All Guards <https://api.vtbs.moe/v1/guard/all>

  => Object, `{...[mid]: {uname, face, …}}`

  Return all the Guards.

  **Example:** <https://api.vtbs.moe/v1/guard/all>

  ```json
  {
    "119": {
      "uname": "狂气的芙兰",
      "face": "https://i0.hdslb.com/bfs/face/12020cb3bfc0dc7f2a2c47007b204b9559d492f0.jpg",
      "mid": 119,
      "dd": [
        [],
        [],
        [349991143]
      ]
    },
    "436": {
      "uname": "海星参上",
      "face": "https://i0.hdslb.com/bfs/face/a72b138ecd138f230ebe546bcc129ddac5f49c05.gif",
      "mid": 436,
      "dd": [
        [],
        [],
        [349991143, 380829248, 375504219]
      ]
    },
  	...
  }
  ```

  Keys:

  * dd: Array
    * 总督
    * 提督
    * 舰长

* #### Some Guards <https://api.vtbs.moe/v1/guard/some>

  => Object, `{...[mid]: {uname, face, …}}`

  Return some of the Guards, who is at least「提督」or DD.

  **Example:** <https://api.vtbs.moe/v1/guard/some>

  Same as the one above.

* #### Guards <https://api.vtbs.moe/v1/guard/:mid>

  => Array, `[{mid, uname, ...}]`

  Return the Guards of certain vtb based on given mid.

  **Example:** <https://api.vtbs.moe/v1/guard/1576121>

  ```json
  [{
      "mid": 110129,
      "uname": "朔海鸣音",
      "face": "https://i0.hdslb.com/bfs/face/862b9d84e0210c2c0c5b155bd95fb69d4c5c9cfa.jpg",
      "level": 2
    }, {
      "mid": 110232,
      "uname": "星野悠馬",
      "face": "https://i1.hdslb.com/bfs/face/5254186bdee6000da9ccae8c23f699abdb11ebcb.jpg",
      "level": 2
    },
    ...
  ]
  ```

  Keys:

  * level: Number

    `0`: 总督

    `1`: 提督

    `2`: 舰长

* #### Guards update time <https://api.vtbs.moe/v1/guard/time>

  => Number, `Number`

  Timestamp, when guards list updated.
  
  **Example:** <https://api.vtbs.moe/v1/guard/time>
  
  ```json
  1560050332931
  ```

### V2 (JSON)

​	Simple JSON API with Bulk Historical Data.

* #### Active <https://api.vtbs.moe/v2/bulkActive/:mid>

  => Array, `[...{archiveView, follower, time}]`

  History of video views and follower counts.

  **Example:** https://api.vtbs.moe/v2/bulkActive/349991143

  ```json
  [{
      "archiveView": 16222668,
      "follower": 298364,
      "time": 1555247781729
    }, {
      "archiveView": 16222668,
      "follower": 298942,
      "time": 1555276084544
    },
    ...
  ]
  ```

  Keys:

  * archiveView: Number

    Video views

  * follower: Number

    Followers

  * time: Number

    Timestamp

* #### Some active <https://api.vtbs.moe/v2/bulkActiveSome/:mid>

  => Array, `[...{archiveView, follower, time}]`

  History of video views and follower count;

  Same as above, but limited to recent `512` entries.

* #### Live <https://api.vtbs.moe/v2/bulkLive/:mid>

  => Array, `[...{online, time}]`

  History of live streams on bilibili.

  **Example:** https://api.vtbs.moe/v2/bulkLive/349991143

  ```json
  [{
      "online": 16579,
      "time": 1555334979260
    }, {
      "online": 70715,
      "time": 1555335279261
    },
    ...
  ]
  ```

* #### Some live <https://api.vtbs.moe/v2/bulkLiveSome/:mid>

  => Array, `[...{online, time}]`

  History of live streams on bilibili,

  Same as above, but limited to recent `2016` entries.

### vdMonster (JSON)

​	Live Danmaku Analyze.

​	Document: <https://github.com/bilibili-dd-center/bilibili-vtuber-danmaku#json>

* #### rooms() <https://api.vtbs.moe/vd/rooms>

  => Array

* #### records() <https://api.vtbs.moe/vd/records/:roomid>

  => Array

* #### roomsRecords() <https://api.vtbs.moe/vd/rr>

  => Object

* #### read() <https://api.vtbs.moe/vd/read/:roomid/:date>

  => Object

### vdSocket

​	Live danmaku integrated WebSocket.

​	Use Socket.io connect to `https://api.vtbs.moe/vds`

​	Document: https://github.com/bilibili-dd-center/bilibili-vtuber-danmaku#socketio

* #### Subscribe (join)

  ```javascript
  socket.emit('join', roomid)
  // or join all:
  socket.emit('join', 'all')
  ```

* #### Unsubscribe (leave)

  ```javascript
  socket.emit('leave', roomid)
  /// or leave all:
  socket.emit('leave', 'all')
  ```

* #### Danmaku

  ```javascript
  socket.on('danmaku')
  // {message: "233", roomid: 12235923, mid: 3499295}
  ```

### vtbs.moe api (Socket.IO)

Advanced interface, please reference the source code available on GitHub.

### Bilibili DD Center org, Some internal relationship.

详情: https://bilibili-dd-center.github.io

![dependency](https://bilibili-dd-center.github.io/dependency.svg)

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
