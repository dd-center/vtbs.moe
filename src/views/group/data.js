// 数据服务：直接拉取 REST API 并聚合「社团 + 账号」模型
const INFO_URL = 'https://api.vtbs.moe/v1/info'
const VDB_URL = 'https://vdb.vtbs.moe/json/list.json'

export const ACC_TYPE_TEXT = {
  official: '官方',
  relay: '转播',
  fan: '粉丝',
}

// Vue logo（无本体账号的社团用它作为社团图标占位）
const VUE_LOGO_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 261.76 226.69">' +
  '<path d="M161.1 0l-30.23 52.35L100.65 0H0l130.87 226.69L261.75 0z" fill="#41b883"/>' +
  '<path d="M161.1 0l-30.23 52.35L100.65 0h-48.3l78.52 136.01L209.4 0z" fill="#35495e"/>' +
  '</svg>'
export const VUE_LOGO =
  'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(VUE_LOGO_SVG)

const TIMEOUT_MS = 20000
const MAX_RETRIES = 3

function sleep(ms) {
  return new Promise(res => setTimeout(res, ms))
}

async function fetchJSON(url, label) {
  let lastErr
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
    if (attempt > 0) await sleep(500 * attempt)
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
    try {
      const r = await fetch(url, { signal: controller.signal })
      if (!r.ok) throw new Error(label + ' HTTP ' + r.status)
      return await r.json()
    } catch (e) {
      lastErr = e
      console.warn(label + ' 第 ' + (attempt + 1) + ' 次请求失败：' + e.message)
    } finally {
      clearTimeout(timer)
    }
  }
  throw lastErr
}

export function fetchInfo() {
  return fetchJSON(INFO_URL, 'info')
}

export function fetchVdb() {
  return fetchJSON(VDB_URL, 'vdb')
}

// 社团 / 虚拟主播登记名（name.default 是语言代码，真正名称在对应语言字段）
export function displayName(v) {
  const n = v.name || {}
  const candidates = [n[n.default], n.cn, n.en, n.ja].filter(Boolean)
  if (candidates.length) return candidates[0]
  if (Array.isArray(n.extra) && n.extra.length) return n.extra[0]
  return v.uuid
}

export function num(v) {
  return Number(v || 0).toLocaleString('en-US')
}

function sum(records, key) {
  return records.reduce((acc, r) => acc + (Number(r[key]) || 0), 0)
}

function dedupe(records) {
  const map = new Map()
  for (const r of records) {
    if (!map.has(String(r.mid))) map.set(String(r.mid), r)
  }
  return Array.from(map.values())
}

// 纯排序：不修改原数组
export function sortRows(rows, key, desc) {
  const arr = rows.slice()
  arr.sort((a, b) => {
    const d = (Number(b[key]) || 0) - (Number(a[key]) || 0)
    if (d !== 0) return desc ? d : -d
    const na = a.uname || a.displayName || a.name || ''
    const nb = b.uname || b.displayName || b.name || ''
    return na.localeCompare(nb)
  })
  return arr
}

export function buildModel(info, vdb) {
  const infoByMid = new Map()
  for (const r of info) {
    infoByMid.set(String(r.mid), r)
    if (!r.accType) r.accType = ''
  }

  const groups = new Map()
  for (const v of (vdb.vtbs || [])) {
    if (v.type === 'group') {
      groups.set(v.uuid, {
        uuid: v.uuid,
        name: displayName(v),
        vdb: v,
        ownAccounts: [],
        members: [],
        followers: 0,
        guards: 0,
      })
    }
  }

  const bilibiliAccountsOf = vv =>
    (vv.accounts || []).filter(a => a.platform === 'bilibili')

  for (const v of (vdb.vtbs || [])) {
    const accs = bilibiliAccountsOf(v)
    if (v.type === 'group') {
      const g = groups.get(v.uuid)
      if (!g) continue
      for (const a of accs) {
        const rec = infoByMid.get(String(a.id))
        if (rec) {
          if (!rec.accType) rec.accType = a.type
          g.ownAccounts.push(rec)
        }
      }
    } else if (v.type === 'vtuber' && v.group) {
      const g = groups.get(v.group)
      if (!g) continue
      for (const a of accs) {
        const rec = infoByMid.get(String(a.id))
        if (rec) {
          if (!rec.accType) rec.accType = a.type
          g.members.push(rec)
        }
      }
    }
  }

  const groupRows = []
  for (const g of groups.values()) {
    g.ownAccounts = dedupe(g.ownAccounts)
    g.members = dedupe(g.members)
    g.followers = sum(g.ownAccounts, 'follower') + sum(g.members, 'follower')
    g.guards = sum(g.ownAccounts, 'guardNum') + sum(g.members, 'guardNum')
    // 社团卡片用组织名（VDB 登记名）；实际账号 uname 只在详情页账号卡上显示
    g.displayName = g.name
    // 有本体账号用本体头像；没有本体账号用 Vue logo 占位
    g.avatar = (g.ownAccounts[0] && g.ownAccounts[0].face) || VUE_LOGO
    groupRows.push(g)
  }

  return { groupRows, accounts: info }
}

let modelPromise = null
export function loadModel() {
  if (!modelPromise) {
    modelPromise = Promise.all([fetchInfo(), fetchVdb()])
      .then(([infoData, vdbData]) => buildModel(infoData, vdbData))
      .catch(e => {
        modelPromise = null // 失败后清除缓存，允许下次重新加载
        throw e
      })
  }
  return modelPromise
}

function pad2(n) {
  return String(n).padStart(2, '0')
}

export function formatTime(ms) {
  if (!ms) return ''
  const d = new Date(Number(ms))
  return (
    d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()) +
    ' ' + pad2(d.getHours()) + ':' + pad2(d.getMinutes()) + ':' + pad2(d.getSeconds())
  )
}

// 导出账号数据为 Excel
export async function exportAccounts(records) {
  const XLSX = await import('xlsx')
  const headers = ['账号名称', '关注', '日增', '播放量', '视频数', '舰团', '空间id', '直播间id', '上次更新']
  const rows = records.map(r => ({
    '账号名称': r.uname || '',
    '关注': Number(r.follower) || 0,
    '日增': Number(r.rise) || 0,
    '播放量': Number(r.archiveView) || 0,
    '视频数': Number(r.video) || 0,
    '舰团': Number(r.guardNum) || 0,
    '空间id': r.mid,
    '直播间id': r.roomid || '',
    '上次更新': formatTime(r.time),
  }))
  const ws = XLSX.utils.json_to_sheet(rows, { header: headers })
  ws['!cols'] = [
    { wch: 24 }, { wch: 10 }, { wch: 8 }, { wch: 12 }, { wch: 8 },
    { wch: 8 }, { wch: 12 }, { wch: 12 }, { wch: 20 },
  ]
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '账号')
  const stamp = formatTime(Date.now()).replace(/[: ]/g, '-')
  XLSX.writeFile(wb, '所有账号_' + stamp + '.xlsx')
}
