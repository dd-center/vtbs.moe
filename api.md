# vtbs.moe Open API

vtbs.moe does provide some public APIs. Please do not abuse.

CDN:

`api.vtbs.moe` aws

(recommend 推荐) `api.aws.vtbs.moe` aws, same as the one above

(recommend 推荐) `cfapi.vtbs.moe` cloudflare

`api.hk.vtbs.moe` hongkong -> aws

(depreciated 别用) `api.tokyo.vtbs.moe` tokyo -> aws

## V1 (JSON)

	Simple JSON API.

* #### vtbs <https://api.vtbs.moe/v1/vtbs>

  => Array, `[...{mid, note}]`

  Return list of vtbs, without any further information.

  简单v列表

  **Example:** <https://api.vtbs.moe/v1/vtbs>

  ```json
  [{
      "mid": 197,
      "uuid": "948ae126-061d-5245-a280-82423b5a5b7b"
    },
    {
      "mid": 4052,
      "uuid": "502bb1fb-5c01-57f7-bf63-315903559483"
    },
    {
      "mid": 5730,
      "uuid": "ffec77db-17ec-5e10-a809-68bc4d3f7a78"
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

  完整v列表

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

* #### Short info <https://api.vtbs.moe/v1/short>

  => Array, `[...{mid, uname, roomid}]`

  Return short records

  信息较少的列表

  **Example:** <https://api.vtbs.moe/v1/short>

  ```json
  [
    {
      "mid": 392101937,
      "uname": "-水梨若official-",
      "roomid": 21745906
    },
    {
      "mid": 15656417,
      "uname": "贰三3三",
      "roomid": 2802408
    },
    {
      "mid": 145913,
      "uname": "3000biubiubiu",
      "roomid": 21574518
    },
    ...
  ]
  ```

* #### Full info <https://api.vtbs.moe/v1/fullInfo>

  => Array, `[...{mid, uname, vdb, ...}]`

  Info with vdb data

  包括vdb数据的列表

  **Example**: <https://api.vtbs.moe/v1/fullInfo>

  ```json
  [
    {
      "mid": 5450477,
      "uname": "-可乐KORA-",
      "video": 4,
      "roomid": 7194103,
      "sign": "Egolive所属还未出道的四期生，虚拟考拉的可乐！是一只家里蹲！！\nTwitter:KORA_egolive",
      "notice": "",
      "face": "http://i2.hdslb.com/bfs/face/c412945daeaf056b081a5ba8ec7a9a8de9a38101.jpg",
      "rise": 0,
      "topPhoto": "http://i0.hdslb.com/bfs/space/aa4f6ea29d15397eb3791b0e27c31de391e94093.png",
      "archiveView": 0,
      "follower": 486,
      "liveStatus": 0,
      "recordNum": 382,
      "guardNum": 5,
      "lastLive": { "online": 4236, "time": 1617175669737 },
      "guardChange": 29,
      "guardType": [0, 0, 5],
      "areaRank": 1000,
      "online": 0,
      "title": "【杂谈】来和家里蹲聊天吧oO",
      "time": 1617282221988,
      "liveStartTime": 0,
      "uuid": "9b44e2a9-3334-5792-b57d-1bf0939afe49",
      "vdb": { "uuid": "9b44e2a9-3334-5792-b57d-1bf0939afe49", "type": "vtuber", "bot": false, "accounts": [{ "id": "5450477", "type": "official", "platform": "bilibili" }], "name": { "extra": [], "cn": "-可乐KORA-", "default": "cn" }, "group": "ee2d6579-f7b2-59e4-be05-ca88f4bdff7d" }
    },
    ...
  ]
  ```

* #### Detail <https://api.vtbs.moe/v1/detail/:mid>

  => Object, `{mid, uname, …}`

  Return record of certain vtb based on given mid.

  单个v数据

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

  返回所有舰长

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

  过滤掉只有一个舰长的

  **Example:** <https://api.vtbs.moe/v1/guard/some>

  Same as the one above.

* #### Guards <https://api.vtbs.moe/v1/guard/:mid>

  => Array, `[{mid, uname, ...}]`

  Return the Guards of certain vtb based on given mid.

  按照v的id查询舰长

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

  舰长列表更新时间

  **Example:** <https://api.vtbs.moe/v1/guard/time>

  ```json
  1560050332931
  ```

* #### List of living rooms <https://api.vtbs.moe/v1/living>

  => Array, `[...roomid]`, `number[]`

  Roomids of living rooms

  直播中

  **Examble:** <https://api.vtbs.moe/v1/living>

  ```json
  [746929,21665984,3012597,179883,6760154,7038458
  // , ...
  ]
  ```

* #### Room info <https://api.vtbs.moe/v1/room/:roomid>

  => Object, `{}`

  room info

  直播信息

  **Example:** <https://api.vtbs.moe/v1/room/8899503>
  
  ```json
  {
    "uid":286179206,
    "roomId":"8899503",
    "title":"【时乃空生日会】我，20岁啦！！！",
    "popularity":272839,
    "live_time":1589536953000
  }
  ```
  
* #### Hawk <https://api.vtbs.moe/v1/hawk>

  => `{day: [...{word, weight}], h: [...{word, weight}]}`

  Danmaku keyword from current Stream

  Day: today (last 24h)

  h: last hour

  直播热词

  **Example <https://api.vtbs.moe/v1/hawk>**
  
  ```json
  {
    "day": [
      { "word": "哈哈哈", "weight": 416573.43336737226 }, { "word": "？？？", "weight": 326972.0575651979 }, ...],
    "h": [
      { "word": "哈哈哈", "weight": 81216.98377892945 }, { "word": "哭哭", "weight": 77225.85928327849 }, ...]
  }
  ```
  
  

## V2 (JSON)

	Simple JSON API with Bulk Historical Data.

* #### Active <https://api.vtbs.moe/v2/bulkActive/:mid>

  => Array, `[...{archiveView, follower, time}]`

  History of video views and follower counts.

  关注历史

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
  
  关注历史，但是只有最近的一部分
  
* #### Guard <https://api.vtbs.moe/v2/bulkGuard/:mid>

  => Array, `[...{guardNum, areaRank, time}]`

  History of guard changes.
  
  舰长历史
  
* #### Online <https://api.vtbs.moe/v2/bulkOnline>

  => Array, [...{liveStatus, online, time}]

  History of sum from all liver

  * liveStatus: How many streaming now
  * online: sum of online (人气)
  * time: timestamp

  全站人气历史

  **Example**: <https://api.vtbs.moe/v2/bulkOnline>
  
  ```json
  [
    ...
    { "liveStatus": 457, "online": 8783729, "time": 1617282137538 },
    { "liveStatus": 472, "online": 9024976, "time": 1617282437539 },
    { "liveStatus": 484, "online": 9287726, "time": 1617282737540 }
  ]
  ```
  
  

## V3 (Buffer)

	"Not so simple" Buffer API with Bulk Historical Data.

* #### All Active <https://api.vtbs.moe/v3/allActive>

  => Buffer:

  ```
         /-----------------------------------\
         |   (32bit UInt) [archiveView]      |
  data:  |   (32bit UInt) [follower]         |
         |   (64bit UInt) [time]             |
         \-----------------------------------/
  
         /------------------------------------\
         |  (32bit UInt) [size of this pack]  |
  pack:  |  (32bit UInt) [mid]                |
         |  [data][data][data][data...        |
         \------------------------------------/
  
  Buffer returned by API: [pack][pack][pack][pack...
  
  (Big Endian)
  ```

  All active data.
  
  Node.js decode example:
  
  ```javascript
  const decodeData = buffer => {
    const data = []
    while (buffer.length) {
      const archiveView = buffer.readUInt32BE()
      const follower = buffer.readUInt32BE(4)
      const time = Number(buffer.readBigUInt64BE(8))
      data.push({ archiveView, follower, time })
      buffer = buffer.slice(16)
    }
    return data
  }
  
  const decodePack = buffer => {
    const actives = []
    while (buffer.length) {
      const size = buffer.readUInt32BE()
      const mid = buffer.readUInt32BE(4)
      const data = decodeData(buffer.slice(8, size))
      buffer = buffer.slice(size)
      actives.push({ mid, data })
    }
    return actives
  }
  
  decodePack(buffer)
  ```
  
  

## Meta

Metadata

* ### ping

  <https://api.vtbs.moe/meta/ping>

  `pong`

* ### cdn

  <https://api.vtbs.moe/meta/cdn>

  `['https://api.vtbs.moe', 'https://api.aws.vtbs.moe', 'https://cfapi.vtbs.moe', 'https://api.hk.vtbs.moe', 'https://api.tokyo.vtbs.moe']`

* ### timestamp

  <https://api.vtbs.moe/meta/timestamp>

  `1590850640669`

## vdSocket

	Live danmaku integrated WebSocket.
	
	Use Socket.io connect to `https://api.vtbs.moe/vds` // const socket = io('https://api.vtbs.moe', { path: '/vds' })
	
	Document: https://github.com/dd-center/vtuber-danmaku#socketio

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

## endpoint

	Endpoint, used for `shields.io` endpoint

* Number of vtubers <https://api.vtbs.moe/endpoint/vtbs>
* Number of guards <https://api.vtbs.moe/endpoint/guardNum>
* Streaming now <https://api.vtbs.moe/endpoint/live>
* Total online <https://api.vtbs.moe/endpoint/onlineSum>

## vtbs.moe api (Socket.IO)

Advanced interface, please reference the source code available on GitHub.

## DD@Home

<https://github.com/dd-center/Cluster-center>

