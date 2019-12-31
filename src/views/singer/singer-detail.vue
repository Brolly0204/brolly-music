<template>
  <transition appear name="slide">
    <music-list :title="title" :bg-image="bgImage" :songs="songs"></music-list>
  </transition>
</template>

<script>
import { mapGetters } from 'vuex'
import { getSingerDetail } from '@/api/singer'
import { ERR_OK } from '@/api/config'
import { createSong, processSongsUrl } from '@/common/Song'
import MusicList from '@/components/music-list/music-list'

export default {
  name: 'singerDetail',
  components: {
    MusicList
  },
  data() {
    return {
      songs: []
    }
  },
  computed: {
    title() {
      return this.singer.name
    },
    bgImage() {
      return this.singer.avatar
    },
    ...mapGetters(['singer'])
  },
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
  }
}
</script>

<style lang="stylus" scoped>
  .slide-enter-active, .slide-leave-active
    transition all .3s
  .slide-enter, .slide-leave-to
    transform translate3d(100%, 0, 0)
</style>
