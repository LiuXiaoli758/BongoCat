import { emit, listen } from '@tauri-apps/api/event'
import { defineStore } from 'pinia'
import { ref } from 'vue'

/** 统计广播事件名（跨窗口同步） */
export const STATS_EVENT = 'stats-changed'

export interface StatsPayload {
  key: number
  mouse: number
  left: number
  right: number
  middle: number
}

let listened = false

/**
 * 键鼠点击统计
 *
 * 数据来源：复用 Rust 后端 rdev 全局键盘鼠标钩子推送的 device-changed 事件，
 * 由 useDevice.ts 的回调调用 recordKeyPress / recordMousePress 写入（main 窗口）。
 * Tauri 多窗口的 Pinia 互不相通，因此每次变化通过 STATS_EVENT 广播到所有窗口，
 * 偏好设置窗口的统计页实时同步显示。
 * 数据由 @tauri-store/pinia（saveOnChange）自动持久化，重启应用后保留。
 */
export const useStatsStore = defineStore('stats', () => {
  const keyboardCount = ref(0)
  const mouseTotal = ref(0)
  const mouseLeft = ref(0)
  const mouseRight = ref(0)
  const mouseMiddle = ref(0)

  // 修饰键不计入统计（rdev 按键名：ShiftLeft/ShiftRight/ControlLeft/ControlRight/Alt/AltGr/MetaLeft/MetaRight）
  const MODIFIER_PREFIXES = ['Shift', 'Control', 'Alt', 'Meta']

  function isModifierKey(key: string): boolean {
    return MODIFIER_PREFIXES.some(prefix => key.startsWith(prefix))
  }

  function broadcast() {
    emit<StatsPayload>(STATS_EVENT, {
      key: keyboardCount.value,
      mouse: mouseTotal.value,
      left: mouseLeft.value,
      right: mouseRight.value,
      middle: mouseMiddle.value,
    })
  }

  // 键盘按下（来自 Rust 全局事件，key 如 "KeyL"、"Space"、"Return"）
  function recordKeyPress(key: string) {
    if (isModifierKey(key)) return
    keyboardCount.value += 1
    broadcast()
  }

  // 鼠标按下（来自 Rust 全局事件，btn 为 "Left"/"Right"/"Middle"）
  function recordMousePress(btn: string) {
    mouseTotal.value += 1
    if (btn === 'Left') mouseLeft.value += 1
    if (btn === 'Right') mouseRight.value += 1
    if (btn === 'Middle') mouseMiddle.value += 1
    broadcast()
  }

  // 重置统计（同时广播到所有窗口）
  function resetStats() {
    keyboardCount.value = 0
    mouseTotal.value = 0
    mouseLeft.value = 0
    mouseRight.value = 0
    mouseMiddle.value = 0
    broadcast()
  }

  // 监听其他窗口广播的统计值（本窗口计数后也会收到，值相同无副作用）
  async function ensureListen() {
    if (listened) return
    listened = true

    await listen<StatsPayload>(STATS_EVENT, ({ payload }) => {
      keyboardCount.value = payload.key
      mouseTotal.value = payload.mouse
      mouseLeft.value = payload.left
      mouseRight.value = payload.right
      mouseMiddle.value = payload.middle
    })
  }

  ensureListen()

  return {
    keyboardCount,
    mouseTotal,
    mouseLeft,
    mouseRight,
    mouseMiddle,
    recordKeyPress,
    recordMousePress,
    resetStats,
  }
})
