import { defineStore } from 'pinia'
import { ref } from 'vue'

/**
 * 键鼠点击统计
 *
 * 数据来源：复用 Rust 后端 rdev 全局键盘鼠标钩子推送的 device-changed 事件，
 * 由 useDevice.ts 的回调调用 recordKeyPress / recordMousePress 写入；
 * 全系统范围统计，无需修改任何 Rust 代码。
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

  // 键盘按下（来自 Rust 全局事件，key 如 "KeyL"、"Space"、"Return"）
  function recordKeyPress(key: string) {
    if (isModifierKey(key)) return
    keyboardCount.value += 1
  }

  // 鼠标按下（来自 Rust 全局事件，btn 为 "Left"/"Right"/"Middle"）
  function recordMousePress(btn: string) {
    mouseTotal.value += 1
    if (btn === 'Left') mouseLeft.value += 1
    if (btn === 'Right') mouseRight.value += 1
    if (btn === 'Middle') mouseMiddle.value += 1
  }

  // 重置统计
  function resetStats() {
    keyboardCount.value = 0
    mouseTotal.value = 0
    mouseLeft.value = 0
    mouseRight.value = 0
    mouseMiddle.value = 0
  }

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
