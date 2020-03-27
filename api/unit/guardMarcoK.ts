import { num, macro } from '../database.js'
import moment from 'moment'
import { io } from '../interface/io.js'
moment.locale('zh-cn')

const format = new Intl.DateTimeFormat('zh-CN', { timeZone: 'Asia/Shanghai' })

const calculateWeekK = async (guardMacroKNum: number, time: number) => {
  const { time: ISO, open, close, lowest, highest } = await macro.get({ mid: 'guardMacroK', num: guardMacroKNum }) as { time: string, open: number, close: number, lowest: number, highest: number }
  let guardMacroWeekKNum = await num.get('guardMacroWeekKNum') as number | undefined || 0
  const currentRow: { time?: string, weekNum?: number, open?: number, close?: number, lowest?: number, highest?: number } = await macro.get({ mid: 'guardMacroWeekK', num: guardMacroWeekKNum }) || {}
  const weekNum = moment(time).week()

  if (currentRow.weekNum !== weekNum) {
    guardMacroWeekKNum++
    await macro.put({
      mid: 'guardMacroWeekK', num: guardMacroWeekKNum, value: {
        time: ISO,
        weekNum,
        open,
        close,
        lowest,
        highest,
      }
    })
    await num.put('guardMacroWeekKNum', guardMacroWeekKNum)
  } else {
    await macro.put({
      mid: 'guardMacroWeekK', num: guardMacroWeekKNum, value: {
        ...currentRow,
        close,
        lowest: Math.min(lowest, currentRow.lowest),
        highest: Math.max(highest, currentRow.highest),
      }
    })
  }
  io.to('guardMacroWeekK').emit('guardMacroWeekK', await macro.get({ mid: 'guardMacroWeekK', num: guardMacroWeekKNum }))
}

const calculate = async (goal: number) => {
  let guardMacroKNum = await num.get('guardMacroKNum') as number | undefined || 0
  const { time, guardNum } = await macro.get({ mid: 'guard', num: goal }) as { time: number, guardNum: number }
  const ISO = format.format(time)
  const currentRow: { time?: string, open?: number, close?: number, lowest?: number, highest?: number } = await macro.get({ mid: 'guardMacroK', num: guardMacroKNum }) || {}

  if (currentRow.time !== ISO) {
    guardMacroKNum++
    await macro.put({
      mid: 'guardMacroK', num: guardMacroKNum, value: {
        time: ISO,
        open: currentRow.close !== undefined ? currentRow.close : guardNum,
        close: guardNum,
        lowest: guardNum,
        highest: guardNum
      }
    })
    await num.put('guardMacroKNum', guardMacroKNum)
  } else {
    if (currentRow.lowest > guardNum) {
      currentRow.lowest = guardNum
    }
    currentRow.close = guardNum
    currentRow.highest = guardNum
    await macro.put({
      mid: 'guardMacroK', num: guardMacroKNum, value: currentRow
    })
  }

  io.to('guardMacroK').emit('guardMacroK', await macro.get({ mid: 'guardMacroK', num: guardMacroKNum }))
  await calculateWeekK(guardMacroKNum, time)

  await num.put('guardMacroKLocationNum', goal)
}

export default async (goal: number) => {
  let guardMacroKLocationNum = await num.get('guardMacroKLocationNum') as number | undefined || 0
  guardMacroKLocationNum++
  while (goal > guardMacroKLocationNum) {
    await calculate(guardMacroKLocationNum)
    guardMacroKLocationNum++
  }
  return calculate(goal)
}
