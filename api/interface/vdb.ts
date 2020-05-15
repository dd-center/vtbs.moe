import got from 'got'
import { Server } from 'socket.io'

let vdb: VDB
let vdbTable: ReturnType<typeof vtb2Table>
let vtbs: ReturnType<typeof vtb2moe>
let io: Server

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
  .filter(({ mid }, index) => {
    if (mid === 286179206) {
      return true
    }
    if (process.env.MOCK) {
      return index < 5
    } else {
      return true
    }
  })

export const update = async (): Promise<{ moe: typeof vtbs, vdb: VDB, vdbTable: typeof vdbTable }> => {
  const body: VDB | void = await got('https://vdb.vtbs.moe/json/list.json').json<VDB>().catch(console.error)
  if (body) {
    console.log('vdb update')
    vdb = body
    vdbTable = vtb2Table(body)
    const moe = vtb2moe(body)
    if (vtbs && vtbs.length !== moe.length) {
      if (io) {
        io.emit('vtbs', moe)
        io.emit('log', 'vdb Change')
      }
      console.log('vdb Change')
    }
    vtbs = moe
    return { moe, vdb, vdbTable }
  } else {
    console.error('vdb error')
    return update()
  }
}

export const get = async () => {
  if (vtbs) {
    return vtbs
  } else {
    return (await update()).moe
  }
}

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
