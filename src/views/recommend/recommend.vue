<template>
  <div class="recommend">
    <Scroll ref="scroll" class="recommend-content" :data="discList">
      <div>
        <div class="slider-wrapper">
          <div
            v-if="this.recommends.length"
            class="slider-content"
          >
            <Slider ref="slider">
              <div
                v-for="(item, index) in recommends"
                :key="index"
              >
                <a :href="item.linkUrl">
                  <img
                    @load="loadImage"
                    :src="item.picUrl"
                    alt="pic"
                  >
                </a>
              </div>
            </Slider>
          </div>
        </div>
        <div class="recommend-list">
          <h1 class="list-title">热门歌单推荐</h1>
          <ul>
            <li
              v-for="item in discList"
              :key="item.dissid"
              class="item"
            >
              <div class="icon">
                <img
                  width="60"
                  height="60"
                  v-lazy="item.imgurl"
                  alt="icon"
                >
              </div>
              <div class="text">
                <h2
                  class="name"
                  v-html="item.creator.name"
                ></h2>
                <p
                  class="desc"
                  v-html="item.dissname"
                ></p>
              </div>
            </li>
          </ul>
        </div>
      </div>
      <div class="loading-container" v-show="!discList.length">
        <loading></loading>
      </div>
    </Scroll>
  </div>
</template>

<script>
import Slider from '@/base/slider/slider'
import Scroll from '@/base/scroll/scroll'
import Loading from '@/base/loading/loading'
import { getRecommend, getDiscList } from '@/api/recommend'
import { ERR_OK } from '@/api/config'

export default {
  name: 'Recommend',
  components: {
    Slider,
    Scroll,
    Loading
  },
  data() {
    return {
      recommends: [],
      discList: []
    }
  },
  created() {
    this._getRecommend()
    this._getDiscList()
  },
  activated() {
    setTimeout(() => {
      this.$refs.slider && this.$refs.slider.refresh()
    }, 20)
  },
  methods: {
    _getRecommend() {
      getRecommend()
        .then(res => {
          if (res.code === ERR_OK) {
            this.recommends = res.data.slider
          }
        })
        .catch(err => {
          console.error('err', err)
        })
    },
    _getDiscList() {
      getDiscList().then(res => {
        if (res.code === ERR_OK) {
          this.discList = res.data.list
        }
      })
    },
    loadImage() {
      if (!this.checkLoaded) {
        this.checkLoaded = true
        setTimeout(() => {
          this.$refs.scroll.refresh()
        }, 20)
        console.log('refresh loadimg')
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
@import '~assets/stylus/variable'

.recommend
  position fixed
  width 100%
  top 88px
  bottom 0

  .recommend-content
    height 100%
    overflow hidden

    .slider-wrapper
      position relative
      width 100%
      height 0
      padding-top 40%
      overflow hidden

      .slider-content
        position absolute
        top 0
        left 0
        width 100%
        height 100%

    .recommend-list
      .list-title
        height 65px
        line-height 65px
        text-align center
        font-size $font-size-meduim
        color $color-theme

      .item
        display flex
        align-items center
        box-sizing border-box
        padding 0 20px 20px 20px

        .icon
          flex 0 0 60px
          width 60px
          padding-right 20px

        .text
          display flex
          flex-direction column
          justify-content center
          flex 1
          line-height 20px
          font-size $font-size-medium
          overflow hidden

          .name
            margin-bottom 10px
            color $color-text

          .desc
            color $color-text-d

  .loading-container
    position: absolute
    width: 100%
    top: 50%
    transform: translateY(-50%)
</style>
