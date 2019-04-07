const biliAPI = require('bili-api')
const { init } = require('./database')

const vtbs = require('./vtbs')

;
(async () => {
  let { site, info, active, live } = await init()
  let vtb = await biliAPI(vtbs[0], ['mid', 'uname', 'roomid', 'sign', 'notice', 'follower', 'archiveView', 'guardNum', 'liveStatus', 'online'])
  console.log('mid', vtb.mid)
  console.log('uname', vtb.uname)
  console.log('roomid', vtb.roomid)
  console.log('sign', vtb.sign)
  console.log('notice', vtb.notice)
  console.log('follower', vtb.follower)
  console.log('archiveView', vtb.archiveView)
  console.log('guardNum', vtb.guardNum)
  console.log('liveStatus', vtb.liveStatus)
  console.log('online', vtb.online)
})()
