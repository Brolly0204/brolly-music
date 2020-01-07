<template>
  <div id="app">
    <m-header></m-header>
    <m-tab></m-tab>
    <keep-alive>
      <router-view></router-view>
    </keep-alive>
    <Player />
  </div>
</template>

<script>
import MHeader from '@/components/m-header/m-header'
import MTab from '@/components/tab/tab'
import Player from '@/components/player/player'

export default {
  name: 'App',
  components: {
    MHeader,
    MTab,
    Player
  }
}
</script>
