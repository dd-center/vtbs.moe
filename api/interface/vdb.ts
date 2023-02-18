import got from 'got'
import { Server } from 'socket.io'

const SECRET_UUID = '9c1b7e15-a13a-51f3-88be-bd923b746474'

let vdb: VDB
let vdbTable: ReturnType<typeof vtb2Table>
let vtbs: ReturnType<typeof vtb2moe>
let io: Server

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

type VDB = {
  meta: {
    UUID_NAMESPACE: string
    linkSyntax: { [K in string]: string }
    timestamp: number
  }
  vtbs: {
    uuid: string
    type: string
    bot: boolean
    accounts: {
      id: string
      type: string
      platform: string
    }[]
    name: {
      [K in string]: string
    }
  }[]
}

const vtb2Table = (vdb: VDB) => Object.fromEntries(vdb.vtbs.map(v => [v.uuid, v]))
const vtb2moe = (vdb: VDB) => vdb.vtbs.flatMap(({ accounts, uuid }) => accounts
  .filter(({ platform }) => platform === 'bilibili')
  .map(({ id }) => {
    return {
      mid: Number(id),
      uuid,
    }
  }))
  .filter((_, index) => {
    if (process.env.MOCK) { // 如果使用node api/mock来运行后端
      return index < 5      // 返回少于5条数据
    } else {
      return true
    }
  })

export const update = async (): Promise<{ moe: typeof vtbs, vdb: VDB, vdbTable: typeof vdbTable }> => {
  const body: VDB | void = await got('https://vdb.vtbs.moe/json/list.json').json<VDB>().catch(console.error)
  const secretList = await got('https://master.vtbs.moe/private.json').json().catch(console.error) as Array<string>
  if (body) {
    body.vtbs.push({
      uuid: SECRET_UUID,
      type: 'vtuber',
      bot: false,
      accounts: secretList.map(id => ({ id, type: 'official', platform: 'bilibili' })),
      name: {
        en: "hide",
        default: "en"
      }
    })
    console.log('vdb update')
    vdb = body
    vdbTable = vtb2Table(body)
    const moe = vtb2moe(body)
    vtbs = moe
    if (vtbs && vtbs.length !== moe.length) {
      if (io) {
        io.emit('vtbs', await getPure())
        io.emit('log', 'vdb Change')
      }
      console.log('vdb Change')
    }
    return { moe, vdb, vdbTable }
  } else {
    console.error('vdb error')
    await wait(1000)
    return update()
  }
}

console.log('vdb init')
await update()
console.log('vdb init done')

export const get = async (filterfn?: (vtbs: ReturnType<typeof vtb2moe>) => ReturnType<typeof vtb2moe>) => {
  if (vtbs) {
    if (filterfn !== undefined) {
      return filterfn(vtbs)
    }
    return vtbs
  } else {
    if (filterfn !== undefined) {
      return filterfn((await update()).moe)
    }
    return (await update()).moe
  }
}

export const getPure = async () => (await get()).filter(({ uuid }) => uuid !== SECRET_UUID)
export const getSecret = async () => (await get()).filter(({ uuid }) => uuid === SECRET_UUID)

export const getVdbTable = async () => {
  if (vdbTable) {
    return vdbTable
  } else {
    return (await update()).vdbTable
  }
}

setInterval(update, 1000 * 60)

export const bind = (server: Server) => {
  io = server
}
