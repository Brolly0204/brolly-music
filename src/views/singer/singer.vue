<template>
  <div class="singer">
    <listview @select="selectSinger" :data="singers" />
    <router-view></router-view>
  </div>
</template>

<script>
import listview from '@/base/listview/listview'
import { getSingerList } from '@/api/singer'
import { ERR_OK } from '@/api/config'
import Singer from '@/common/Singer'
import { mapMutations } from 'vuex'
import { SET_SINGER } from '@/store/mutation-type'

const HOT_NAME = '热门'
const HOT_SINGER_LEN = 10

export default {
  name: 'singer',
  components: {
    listview
  },
  data() {
    return {
      singers: []
    }
  },
  created() {
    this._getSingerList()
  },
  methods: {
    selectSinger(singer) {
      this.$router.push({
        path: `/singer/${singer.id}`
      })
      this.setSinger(singer)
    },
    _getSingerList() {
      getSingerList().then(res => {
        if (res.code === ERR_OK) {
          this.singers = this._normalizeSinger(res.data.list)
        }
      })
    },
    _normalizeSinger(list) {
      const map = {
        hot: {
          title: HOT_NAME,
          items: []
        }
      }

      list.forEach((item, index) => {
        const singer = new Singer({
          id: item.Fsinger_mid,
          name: item.Fsinger_name
        })

        if (index < HOT_SINGER_LEN) {
          map.hot.items.push(singer)
        }

        const key = item.Findex
        if (!map[key]) {
          map[key] = {
            title: key,
            items: []
          }
        }
        map[key].items.push(singer)
      })
      // 处理列表顺序
      const hot = []
      const ret = []
      for (let key in map) {
        const val = map[key]
        if (/[a-zA-Z]/.test(val.title)) {
          ret.push(val)
        } else if (val.title === HOT_NAME) {
          hot.push(val)
        }
      }
      ret.sort((a, b) => {
        return a.title.charCodeAt(0) - b.title.charCodeAt(0)
      })
      return hot.concat(ret)
    },
    ...mapMutations({
      setSinger: SET_SINGER
    })
  }
}
</script>

<style lang="stylus" scoped>
  .singer
    position fixed
    top 88px
    left 0
    bottom 0
    width 100%
</style>
