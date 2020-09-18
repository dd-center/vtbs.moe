import { getPending as stateGetPending } from './state.js'

const wait = ms => new Promise(resolve => setTimeout(resolve, ms))

export { socket as stateSocket, cState } from './state.js'
export { vd, vdSocket } from './vd.js'
export * as vdb from './vdb.js'
export { hawk } from './hawk.js'
export { race as biliAPI } from './biliapi.js'
export { io } from './io.js'

export const waitStatePending = async (n = 256) => {
  while (await stateGetPending() > n) {
    await wait(233)
  }
}
