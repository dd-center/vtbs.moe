import { getFullInfo, getVdbTable } from '@/socket.js'

// 详细页 / 社团页共用的数据：fullInfo + vdbTable（走 socket，跟随用户选择的 CDN）
const TTL = 60 * 1000

let cache

const vdbName = vdb => {
  if (!vdb || !vdb.name) {
    return undefined
  }
  const { name } = vdb
  return name[name.default] || Object.values(name).find(value => typeof value === 'string')
}

export const faceUrl = (face, size = 128) => {
  if (!face) {
    return undefined
  }
  face = face.replace('http:', 'https:')
  if (face.includes('noface')) {
    return face
  }
  return `${face}@${size}w_${size}h`
}

const total = (accounts, key) => accounts.reduce((sum, account) => sum + (Number(account[key]) || 0), 0)

const buildDirectory = (list, vdbTable) => {
  const seen = new Set()
  const accounts = list
    .filter(({ mid }) => !seen.has(mid) && seen.add(mid))
    .map(info => {
      const vdb = vdbTable[info.uuid] || {}
      let group
      if (vdb.type === 'group') {
        group = vdb.uuid
      } else if (vdbTable[vdb.group]) {
        group = vdb.group
      }
      return { ...info, name: vdbName(vdb), group }
    })

  const groups = Object.values(vdbTable)
    .filter(({ type }) => type === 'group')
    .map(vdb => {
      const own = accounts.filter(({ uuid }) => uuid === vdb.uuid)
      const members = accounts.filter(({ uuid, group }) => group === vdb.uuid && uuid !== vdb.uuid)
      const all = [...own, ...members]
      const byFollower = [...members].sort((a, b) => b.follower - a.follower)
      return {
        uuid: vdb.uuid,
        name: vdbName(vdb) || vdb.uuid,
        own,
        members,
        face: (own[0] || byFollower[0] || {}).face,
        topFaces: byFollower.slice(0, 5).map(({ mid, face }) => ({ mid, face })),
        vtuberCount: new Set(members.map(({ uuid }) => uuid)).size,
        accountCount: all.length,
        follower: total(all, 'follower'),
        rise: total(all, 'rise'),
        guardNum: total(all, 'guardNum'),
        archiveView: total(all, 'archiveView'),
        video: total(all, 'video'),
        liveNum: all.filter(({ liveStatus }) => liveStatus).length,
      }
    })
    .filter(({ accountCount }) => accountCount)

  const groupTable = Object.fromEntries(groups.map(group => [group.uuid, group]))

  return { accounts, groups, groupTable }
}

export const loadDirectory = () => {
  if (!cache || Date.now() - cache.time > TTL) {
    const promise = Promise.all([getFullInfo(), getVdbTable()])
      .then(([list, vdbTable]) => buildDirectory(list, vdbTable))
    promise.catch(() => {
      if (cache && cache.promise === promise) {
        cache = undefined
      }
    })
    cache = { time: Date.now(), promise }
  }
  return cache.promise
}

// sort 参数沿用旧版格式：`key` 降序，`!key` 升序
export const parseSort = (sort, fallback) => {
  const [key, neg] = String(sort || fallback).split('!').reverse()
  return { key, order: neg === undefined ? 1 : -1 }
}

export const sortBy = (array, { key, order }) => [...array]
  .sort((a, b) => ((Number(b[key]) || 0) - (Number(a[key]) || 0)) * order)

export const matchSearch = (search, ...fields) => {
  const words = String(search || '').toLowerCase().split(' ').filter(Boolean)
  const string = fields.join(' ').toLowerCase()
  return words.every(word => string.includes(word))
}

export const downloadCSV = (filename, header, rows) => {
  const escape = value => {
    const string = value === undefined || value === null ? '' : String(value)
    return /[",\n]/.test(string) ? `"${string.replace(/"/g, '""')}"` : string
  }
  const csv = [header, ...rows].map(row => row.map(escape).join(',')).join('\n')
  const url = URL.createObjectURL(new Blob(['﻿', csv], { type: 'text/csv;charset=utf-8' }))
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
