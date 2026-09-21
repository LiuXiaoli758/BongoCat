<script setup lang="ts">
import { Button, message } from 'antdv-next'
import { useI18n } from 'vue-i18n'

import ProListItem from '@/components/pro-list-item/index.vue'
import ProList from '@/components/pro-list/index.vue'
import { useStatsStore } from '@/stores/stats'

const { t } = useI18n()
const statsStore = useStatsStore()

function handleReset() {
  statsStore.resetStats()

  message.success(t('pages.preference.stats.hints.resetSuccess'))
}
</script>

<template>
  <ProList :title="$t('pages.preference.stats.labels.clickStats')">
    <ProListItem
      :description="$t('pages.preference.stats.hints.keyboardHint')"
      :title="$t('pages.preference.stats.labels.keyboard')"
    >
      <span class="text-4 font-bold color-blue-5 dark:color-blue-7">{{ statsStore.keyboardCount }}</span>
    </ProListItem>

    <ProListItem
      :description="$t('pages.preference.stats.hints.mouseHint')"
      :title="$t('pages.preference.stats.labels.mouse')"
    >
      <span class="text-4 font-bold color-blue-5 dark:color-blue-7">{{ statsStore.mouseTotal }}</span>
    </ProListItem>

    <ProListItem :title="$t('pages.preference.stats.labels.mouseLeft')">
      <span class="text-3.5 font-bold">{{ statsStore.mouseLeft }}</span>
    </ProListItem>

    <ProListItem :title="$t('pages.preference.stats.labels.mouseRight')">
      <span class="text-3.5 font-bold">{{ statsStore.mouseRight }}</span>
    </ProListItem>

    <ProListItem :title="$t('pages.preference.stats.labels.mouseMiddle')">
      <span class="text-3.5 font-bold">{{ statsStore.mouseMiddle }}</span>
    </ProListItem>

    <ProListItem :title="$t('pages.preference.stats.labels.reset')">
      <Button
        danger
        @click="handleReset"
      >
        {{ $t('pages.preference.stats.hints.resetStats') }}
      </Button>
    </ProListItem>
  </ProList>
</template>
