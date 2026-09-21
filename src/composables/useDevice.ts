import { ref, watch } from 'vue'
import { listen } from '@tauri-apps/api/event'

export const isKeyDown = ref(false)
export const isMouseDown = ref(false)
export const mouseButton = ref('')

// ========== 键鼠统计相关变量 ==========
export const keyPressCount = ref(0)
export const mouseClickCount = ref(0)
export const mouseLeftCount = ref(0)
export const mouseRightCount = ref(0)
export const mouseMiddleCount = ref(0)
const pressedKeys = new Set<string>()

// 防抖保存计时器
let saveTimer: ReturnType<typeof setTimeout> | null = null

// 工具函数，过滤不支持的按键
function getSupportedKey(key: string): string {
  const ignoreKeys = ['ShiftLeft', 'ShiftRight', 'ControlLeft', 'ControlRight', 'AltLeft', 'AltRight']
  if (ignoreKeys.includes(key)) return ''
  return key
}

export function useDevice() {
  const handlePress = (key: string) => {
    isKeyDown.value = true
  }

  const handleRelease = () => {
    isKeyDown.value = false
  }

  const handleMouseChange = (btn: string, down: boolean) => {
    isMouseDown.value = down
    mouseButton.value = btn
  }

  // 加载本地统计数据
  const loadCounter = async () => {
    try {
      const { readTextFile, BaseDirectory } = await import('@tauri-apps/plugin-fs')
      const txt = await readTextFile('count.json', { baseDir: BaseDirectory.AppData })
      const obj = JSON.parse(txt)
      keyPressCount.value = obj.key ?? 0
      mouseClickCount.value = obj.mouse ?? 0
      mouseLeftCount.value = obj.left ?? 0
      mouseRightCount.value = obj.right ?? 0
      mouseMiddleCount.value = obj.middle ?? 0
    } catch (e) {
      // 文件不存在直接忽略
    }
  }

  // 保存统计数据（防抖）
  const saveCounter = async () => {
    if (saveTimer) clearTimeout(saveTimer)
    saveTimer = setTimeout(async () => {
      try {
        const { writeTextFile, BaseDirectory } = await import('@tauri-apps/plugin-fs')
        const data = {
          key: keyPressCount.value,
          mouse: mouseClickCount.value,
          left: mouseLeftCount.value,
          right: mouseRightCount.value,
          middle: mouseMiddleCount.value
        }
        await writeTextFile('count.json', JSON.stringify(data, null, 2), { baseDir: BaseDirectory.AppData })
      } catch (e) {
        console.error('保存统计失败', e)
      }
    }, 500)
  }

  // 监听后端DEVICE_CHANGED事件
  const unlisten = listen('DEVICE_CHANGED', (event) => {
    const { type, value } = event.payload as { type: string; value: any }
    switch (type) {
      case 'KeyboardPress': {
        const key = getSupportedKey(value)
        if (key && !pressedKeys.has(key)) {
          pressedKeys.add(key)
          keyPressCount.value++
          saveCounter()
        }
        handlePress(key)
        break
      }
      case 'KeyboardRelease': {
        const key = getSupportedKey(value)
        if (key) {
          pressedKeys.delete(key)
        }
        handleRelease()
        break
      }
      case 'MouseDown': {
        const btn = value.button
        mouseClickCount.value++
        if (btn === 'Left') mouseLeftCount.value++
        if (btn === 'Right') mouseRightCount.value++
        if (btn === 'Middle') mouseMiddleCount.value++
        saveCounter()
        handleMouseChange(btn, true)
        break
      }
      case 'MouseUp': {
        const btn = value.button
        handleMouseChange(btn, false)
        break
      }
    }
  })

  // 初始化加载计数
  loadCounter()

  return {
    isKeyDown,
    isMouseDown,
    mouseButton,
    keyPressCount,
    mouseClickCount,
    mouseLeftCount,
    mouseRightCount,
    mouseMiddleCount,
    unlisten
  }
}
