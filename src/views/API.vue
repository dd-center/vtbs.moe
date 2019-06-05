<template>
<el-container>
  <el-main>
    <h2>Public API <small>api.vtbs.moe</small></h2>
    <p>vtbs.moe does provide some public APIs. Please do not abuse.</p>

    <h3>V1 <small>api.vtbs.moe/v1</small></h3>

    <h4>vtbs <small>api.vtbs.moe/v1/vtbs</small></h4>
    <p>=> Array, [{mid, note}]</p>
    <p>Return list of vtbs, without any further information.</p>

    <h4>info <small>api.vtbs.moe/v1/info</small></h4>
    <p>=> Array, [{mid, uname, ...}]</p>
    <p>Return records of all vtbs.</p>

    <h4>Detail <small>api.vtbs.moe/v1/detail/:mid</small></h4>
    <p>=> Object, {mid, uname, ...}</p>
    <p>Return record of certain vtb based on given mid.</p>

    <h4>All Guards <small>api.vtbs.moe/v1/guard/all</small></h4>
    <p>=> Object, {...[mid]: {uname, face, ...}}</p>
    <p>Return all the Guards.</p>

    <h4>Some Guards <small>api.vtbs.moe/v1/guard/some</small></h4>
    <p>=> Object, {...[mid]: {uname, face, ...}}</p>
    <p>Return some of the Guards, who is at least「提督」or DD.</p>

    <h4>Guards <small>api.vtbs.moe/v1/guard/:mid</small></h4>
    <p>=> Array, [{mid, uname, ...}]</p>
    <p>Return the Guards of certain vtb based on given mid.</p>

    <h4>Guards update time <small>api.vtbs.moe/v1/guard/time</small></h4>
    <p>=> Number</p>
    <p>Timestamp, when guards list updated</p>

    <h3>vdMonster <small>api.vtbs.moe/vd</small></h3>
    <p>Document: <a href="https://github.com/bilibili-dd-center/bilibili-vtuber-danmaku/#json格式">https://github.com/bilibili-dd-center/bilibili-vtuber-danmaku/#json格式</a> </p>
    <h4>rooms() <small>api.vtbs.moe/vd/rooms</small></h4>
    <p>=> Array</p>
    <h4>records() <small>api.vtbs.moe/vd/records/:roomid</small></h4>
    <p>=> Array</p>
    <h4>roomsRecords() <small>api.vtbs.moe/vd/rr</small></h4>
    <p>=> Object</p>
    <h4>read() <small>api.vtbs.moe/vd/read/:roomid/:date</small></h4>
    <p>=> Object</p>

    <h3>Socket.IO <small>api.vtbs.moe/socket.io/</small></h3>
    <p>Advanced interface, please reference the source code available on GitHub.</p>
  </el-main>
</el-container>
</template>

<style scoped>
.el-main {
  word-wrap: break-word;
}

h3:before {
  content: '';
  display: inline-block;
  width: 7px;
  height: 7px;
  background-color: #000;
  vertical-align: middle;
  margin-right: 8px;
  border-radius: 7px;
}

h4>small {
  text-decoration: underline;
}

h4 {
  margin-left: 6px;
}

p {
  margin-left: 16px;
}
</style>
