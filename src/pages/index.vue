<script setup lang="ts">
import { isDev, toggleDev } from '~/composables'

const play = new GamePlay(10, 10)
useStorage('vuesweeper-state', play.state)
const state = computed(() => play.board)

watchEffect(() => {
  play.checkGameState()
})
</script>

<template>
  <div>
    Minesweeper
    <div p-5>
      <div
        v-for="row, y in state"
        :key="y"
        flex="~"
        items-center justify-center
      >
        <MineBlock
          v-for="block, x in row"
          :key="x"
          :block="block"
          @click="play.onClick(block)"
          @contextmenu.prevent="play.onRightClick(block)"
        />
      </div>
    </div>

    <div flex="~ gap-1" justify-center>
      <button btn @click="toggleDev()">
        {{ isDev ? 'DEV' : 'NORMAL' }}
      </button>

      <button btn @click="play.reset()">
        RESET
      </button>
    </div>
  </div>
</template>
