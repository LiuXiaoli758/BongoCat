import { defineStore } from 'pinia'
import { ref } from 'vue'

/**
 * 键鼠点击统计（前端方案）
 *
 * 监听挂载在小猫主窗口（main/index.vue），窗口运行期间持续统计；
 * 数据由 @tauri-store/pinia（saveOnChange）自动持久化，重启应用后保留。
 */
export const useStatsStore = defineStore('stats', () => {
  const keyboardCount = ref(0)
  const mouseTotal = ref(0)
  const mouseLeft = ref(0)
  const mouseRight = ref(0)
  const mouseMiddle = ref(0)

  // 修饰键不计入统计
  function getSupportedKey(key: string): string {
    const ignoreKeys = ['ShiftLeft', 'ShiftRight', 'ControlLeft', 'ControlRight', 'AltLeft', 'AltRight']
    if (ignoreKeys.includes(key)) return ''
    return key
  }

  // 键盘按下：e.repeat 过滤长按重复计数
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.repeat) return
    const validKey = getSupportedKey(e.code)
    if (!validKey) return
    keyboardCount.value += 1
  }

  // 鼠标点击
  const handleMouseDown = (e: MouseEvent) => {
    mouseTotal.value += 1
    if (e.button === 0) mouseLeft.value += 1
    if (e.button === 2) mouseRight.value += 1
    if (e.button === 1) mouseMiddle.value += 1
  }

  // 开启监听（小猫主窗口挂载时调用）
  function startListen() {
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('mousedown', handleMouseDown)
  }

  // 关闭监听（小猫主窗口卸载时调用）
  function stopListen() {
    window.removeEventListener('keydown', handleKeyDown)
    window.removeEventListener('mousedown', handleMouseDown)
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
    startListen,
    stopListen,
    resetStats,
  }
})
