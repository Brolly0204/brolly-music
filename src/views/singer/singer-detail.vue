<template>
  <transition appear name="slide">
    <div class="singer-detail">
      {{singer.id}} : {{singer.name}}
    </div>
  </transition>
</template>

<script>
import { mapGetters } from 'vuex'
import { getSingerDetail } from '@/api/singer'
import { ERR_OK } from '@/api/config'
import { createSong, processSongsUrl } from '@/common/Song'

export default {
  name: 'singerDetail',
  created() {
    if (!this.singer.id) {
      return this.$router.push('/singer')
    }
    this.getSingerDetail()
  },
  methods: {
    getSingerDetail() {
      getSingerDetail(this.singer.id).then(async res => {
        if (res.code === ERR_OK) {
          this.songs = await processSongsUrl(this._normalizeSongs(res.data.list))
          console.log('songs', this.songs)
        }
      })
    },
    _normalizeSongs(list) {
      const ret = []
      list.forEach(item => {
        const { musicData } = item
        if (musicData.songid && musicData.albummid) {
          ret.push(createSong(musicData))
        }
      })
      return ret
    }
  },
  data() {
    return {
      songs: []
    }
  },
  computed: {
    ...mapGetters(['singer'])
  }
}
</script>

<style lang="stylus" scoped>
  @import "~assets/stylus/variable";

  .slide-enter-active, .slide-leave-active
    transition all .3s
  .slide-enter, .slide-leave-to
    transform translate3d(100%, 0, 0)

  .singer-detail
    position fixed
    top 0
    left 0
    right 0
    bottom 0
    background $color-background
    z-index 100
</style>
