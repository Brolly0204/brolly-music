<template>
  <scroll
    :data="data"
    class="listview"
    ref="listview"
    :listenScroll="listenScroll"
    @scroll="scroll"
    :probe-type="probeType"
  >
    <ul>
      <li
        v-for="(group, index) in data"
        :key="index"
        class="list-group"
        ref="listGroup"
      >
        <h2 class="list-group-title">{{group.title}}</h2>
        <ul>
          <li
            v-for="(item, index) in group.items"
            :key="index"
            @click="selectItem(item)"
            class="list-group-item"
          >
            <img
              class="avatar"
              v-lazy="item.avatar"
              alt="avatar"
            />
            <span class="name">{{item.name}}</span>
          </li>
        </ul>
      </li>
    </ul>
    <div
      class="list-shortcut"
      @touchstart.stop.prevent="onShortcutTouchStart"
      @touchmove.stop.prevent="onShortcutTouchMove"
      @touchend.stop
    >
      <ul>
        <li
          v-for="(item, index) in shortcutList"
          :key="item"
          :data-index="index"
          class="item"
          :class="{current: currentIndex === index}"
        >{{item}}</li>
      </ul>
    </div>
    <div class="list-fixed" ref="fixed" v-show="fixedTitle">
      <div class="fixed-title">{{fixedTitle}}</div>
    </div>
    <div v-show="!data.length" class="loading-container">
      <loading></loading>
    </div>
  </scroll>
</template>

<script>
import scroll from '@/base/scroll/scroll'
import loading from '@/base/loading/loading'
import { getData } from '@/common/dom'

const ANCHOR_HEIGHT = 18
const TITLE_HEIGHT = 30

export default {
  name: 'listview',
  components: {
    scroll,
    loading
  },
  props: {
    data: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    shortcutList() {
      return this.data.map(item => item.title.slice(0, 1))
    },
    fixedTitle() {
      if (this.scrollY > 0) {
        return ''
      }
      const item = this.data[this.currentIndex]
      return item ? item.title : ''
    }
  },
  watch: {
    data() {
      setTimeout(() => {
        this._calculateHeight()
      }, 20)
    },
    scrollY(y) {
      // 滚动到顶部
      if (y >= 0) {
        this.currentIndex = 0
        return
      }
      const listHeight = this.listHeight
      for (let i = 0; i < listHeight.length - 1; i++) {
        const height1 = listHeight[i]
        const height2 = listHeight[i + 1]
        if (-y >= height1 && -y < height2) {
          this.currentIndex = i
          this.diff = height2 + y
          return
        }
      }
      // 当滚动底部 [0, ...., 23]
      this.currentIndex = listHeight.length - 2
    },
    diff(newVal) {
      const fixedTop = (newVal > 0 && newVal < TITLE_HEIGHT) ? newVal - TITLE_HEIGHT : 0
      if (this.fixedTop === fixedTop) {
        return
      }
      this.fixedTop = fixedTop
      this.$refs.fixed.style.transform = `translate3d(0, ${fixedTop}px, 0)`
    }
  },
  data() {
    return {
      scrollY: -1,
      currentIndex: 0,
      diff: -1
    }
  },
  created() {
    this.touch = {}
    this.listHeight = []
    this.probeType = 3
    this.listenScroll = true
  },
  methods: {
    selectItem(item) {
      this.$emit('select', item)
    },
    onShortcutTouchStart(e) {
      const anchorIndex = getData(e.target, 'index')
      const firstTouch = e.touches[0]
      this.touch.y1 = firstTouch.pageY
      this.touch.anchorIndex = anchorIndex
      this._scrollTo(anchorIndex)
    },
    onShortcutTouchMove(e) {
      const firstTouch = e.touches[0]
      this.touch.y2 = firstTouch.pageY
      const delta = (this.touch.y2 - this.touch.y1) / ANCHOR_HEIGHT | 0
      const anchorIndex = parseInt(this.touch.anchorIndex) + delta
      this._scrollTo(anchorIndex)
    },
    scroll(pos) {
      this.scrollY = pos.y
    },
    _calculateHeight() {
      const listGroups = this.$refs.listGroup
      this.listHeight = []
      let height = 0
      this.listHeight.push(height)
      for (let i = 0; i < listGroups.length; i++) {
        const clientHeight = listGroups[i].clientHeight
        height += clientHeight
        this.listHeight.push(height)
      }
    },
    _scrollTo(index) {
      if (!index && index !== 0) {
        return
      }
      if (index < 0) {
        index = 0
      } else if (index > this.listHeight.length - 2) {
        index = this.listHeight.length - 2
      }
      this.scrollY = -this.listHeight[index]
      const el = this.$refs.listGroup[index * 1]
      this.$refs.listview.scrollToElement(el, 0)
    }
  }
}
</script>

<style lang="stylus" scoped>
@import '~assets/stylus/variable'

.listview
  position relative
  width 100%
  height 100%
  overflow hidden
  background $color-background

  .list-group
    padding-bottom 30px

    .list-group-title
      height 30px
      line-height 30px
      padding-left 20px
      font-size $font-size-small
      color $color-text-l
      background $color-highlight-background

    .list-group-item
      display flex
      align-items center
      padding 20px 0 0 30px

      .avatar
        width 50px
        height 50px
        border-radius 50%

      .name
        margin-left 20px
        color $color-text-l
        font-size $font-size-medium

  .list-shortcut
    position absolute
    right 0
    top 50%
    transform translateY(-50%)
    width 20px
    padding 20px 0
    border-radius 10px
    text-align center
    background $color-background-d
    font-family Helvetica
    z-index 30

    .item
      padding 3px
      line-height 1
      color $color-text-l
      font-size $font-size-small // 12px

      &.current
        color $color-theme
  .list-fixed
    position: absolute
    top: 0
    left: 0
    width: 100%
    .fixed-title
      height: 30px
      line-height: 30px
      padding-left: 20px
      font-size: $font-size-small
      color: $color-text-l
      background: $color-highlight-background
  .loading-container
    position: absolute
    width: 100%
    top: 50%
    transform: translateY(-50%)
</style>
