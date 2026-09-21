<script setup lang="ts">
import type { TabOption } from '@/components/Tabs'

import { useI18n } from 'vue-i18n'
import { ref, watch } from 'vue'

import { useCatStore } from '@/stores/cat'
import { useGeneralStore } from '@/stores/general.ts'
import { useModelStore } from '@/stores/model'
import { useDevice } from '@/composables/useDevice'
import { writeTextFile, BaseDirectory } from '@tauri-apps/plugin-fs'

// ========== 键鼠统计变量 ==========
const {
  keyPressCount,
  mouseClickCount,
  mouseLeftCount,
  mouseRightCount,
  mouseMiddleCount
} = useDevice()

// 重置统计
const resetCount = async () => {
  keyPressCount.value = 0
  mouseClickCount.value = 0
  mouseLeftCount.value = 0
  mouseRightCount.value = 0
  mouseMiddleCount.value = 0
  await writeTextFile('count.json', JSON.stringify({
    key: 0,
    mouse: 0,
    left: 0,
    right: 0,
    middle: 0
  }), { baseDir: BaseDirectory.AppData })
}

const { t } = useI18n()
const catStore = useCatStore()
const generalStore = useGeneralStore()
const modelStore = useModelStore()

const activeTab = ref('cat')

const tabs: TabOption[] = [
  {
    key: 'cat',
    label: t('pages.preference.tabs.cat'),
    icon: 'cat',
  },
  {
    key: 'general',
    label: t('pages.preference.tabs.general'),
    icon: 'setting',
  },
  {
    key: 'model',
    label: t('pages.preference.tabs.model'),
    icon: 'model',
  },
  {
    key: 'shortcut',
    label: t('pages.preference.tabs.shortcut'),
    icon: 'keyboard',
  },
  {
    key: 'about',
    label: t('pages.preference.tabs.about'),
    icon: 'info',
  },
]

watch(() => catStore.window.opacity, (val) => {
  generalStore.window.opacity = val
}, { immediate: true })
</script>

<template>
  <div class="h-screen flex overflow-hidden">
    <div class="w-48 shrink-0 bg-gray-50 p-4">
      <Tabs v-model="activeTab" :options="tabs" />
    </div>

    <div class="flex-1 overflow-y-auto p-6">
      <!-- 猫咪设置 -->
      <div v-if="activeTab === 'cat'" class="space-y-6">
        <h2 class="text-xl font-semibold">{{ t('pages.preference.titles.catSetting') }}</h2>

        <SettingItem>
          <template #title>{{ t('pages.preference.cat.mirror.title') }}</template>
          <template #desc>{{ t('pages.preference.cat.mirror.desc') }}</template>
          <Switch v-model="catStore.model.mirror" />
        </SettingItem>

        <SettingItem>
          <template #title>{{ t('pages.preference.cat.mouseMirror.title') }}</template>
          <template #desc>{{ t('pages.preference.cat.mouseMirror.desc') }}</template>
          <Switch v-model="catStore.model.mouseMirror" />
        </SettingItem>

        <SettingItem>
          <template #title>{{ t('pages.preference.cat.passThrough.title') }}</template>
          <template #desc>{{ t('pages.preference.cat.passThrough.desc') }}</template>
          <Switch v-model="catStore.window.passThrough" />
        </SettingItem>

        <SettingItem>
          <template #title>{{ t('pages.preference.cat.motionSound.title') }}</template>
          <template #desc>{{ t('pages.preference.cat.motionSound.desc') }}</template>
          <Switch v-model="catStore.model.motionSound" />
        </SettingItem>

        <SettingItem>
          <template #title>{{ t('pages.preference.cat.motionExp.title') }}</template>
          <template #desc>{{ t('pages.preference.cat.motionExp.desc') }}</template>
          <Switch v-model="catStore.model.enableMotionExp" />
        </SettingItem>

        <SettingItem>
          <template #title>{{ t('pages.preference.cat.keyReleaseDelay.title') }}</template>
          <template #desc>{{ t('pages.preference.cat.keyReleaseDelay.desc') }}</template>
          <NumberInput v-model="catStore.model.keyReleaseDelay" :min="0" :max="20" suffix="s" />
        </SettingItem>

        <!-- ========== 新增：键鼠点击统计板块 ========== -->
        <div class="mt-6">
          <div class="text-base font-medium mb-2">键鼠点击统计</div>
          <div class="rounded-lg border p-4 space-y-2">
            <p>键盘敲击次数：{{ keyPressCount }}</p>
            <p>鼠标总点击次数：{{ mouseClickCount }}</p>
            <p>左键：{{ mouseLeftCount }}｜右键：{{ mouseRightCount }}｜中键：{{ mouseMiddleCount }}</p>
            <button
                class="mt-2 px-3 py-1.5 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                @click="resetCount"
            >
              重置统计
            </button>
          </div>
        </div>
      </div>

      <!-- 通用设置 -->
      <div v-if="activeTab === 'general'" class="space-y-6">
        <h2 class="text-xl font-semibold">{{ t('pages.preference.titles.generalSetting') }}</h2>
        <SettingItem>
          <template #title>{{ t('pages.preference.general.alwaysOnTop.title') }}</template>
          <template #desc>{{ t('pages.preference.general.alwaysOnTop.desc') }}</template>
          <Switch v-model="catStore.window.alwaysOnTop" />
        </SettingItem>
        <SettingItem>
          <template #title>{{ t('pages.preference.general.taskbarVisible.title') }}</template>
          <template #desc>{{ t('pages.preference.general.taskbarVisible.desc') }}</template>
          <Switch v-model="generalStore.app.taskbarVisible" />
        </SettingItem>
        <SettingItem>
          <template #title>{{ t('pages.preference.general.opacity.title') }}</template>
          <template #desc>{{ t('pages.preference.general.opacity.desc') }}</template>
          <Slider v-model="catStore.window.opacity" :min="25" :max="100" />
        </SettingItem>
        <SettingItem>
          <template #title>{{ t('pages.preference.general.radius.title') }}</template>
          <template #desc>{{ t('pages.preference.general.radius.desc') }}</template>
          <Slider v-model="catStore.window.radius" :min="0" :max="50" />
        </SettingItem>
        <SettingItem>
          <template #title>{{ t('pages.preference.general.maxFPS.title') }}</template>
          <template #desc>{{ t('pages.preference.general.maxFPS.desc') }}</template>
          <NumberInput v-model="catStore.model.maxFPS" :min="10" :max="144" suffix="FPS" />
        </SettingItem>
      </div>

      <!-- 模型管理 -->
      <div v-if="activeTab === 'model'" class="space-y-6">
        <h2 class="text-xl font-semibold">{{ t('pages.preference.titles.modelManage') }}</h2>
        <ModelManager />
      </div>

      <!-- 快捷键 -->
      <div v-if="activeTab === 'shortcut'" class="space-y-6">
        <h2 class="text-xl font-semibold">{{ t('pages.preference.titles.shortcut') }}</h2>
        <ShortcutSetting />
      </div>

      <!-- 关于 -->
      <div v-if="activeTab === 'about'" class="space-y-6">
        <h2 class="text-xl font-semibold">{{ t('pages.preference.titles.about') }}</h2>
        <About />
      </div>
    </div>
  </div>
</template>
