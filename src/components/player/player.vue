<template>
  <div
    class="player"
    v-show="playlist.length > 0"
  >
    <transition
      name="normal"
      @enter="enter"
      @after-enter="afterEnter"
      @leave="leave"
      @after-leave="afterLeave"
    >
      <div
        class="normal-player"
        v-show="fullScreen"
      >
        <div class="background">
          <img
            width="100%"
            height="100%"
            :src="currentSong.image"
            alt="image"
          >
        </div>
        <div class="top">
          <div
            class="back"
            @click="back"
          >
            <i class="icon-back"></i>
          </div>
          <h1
            class="title"
            v-html="currentSong.name"
          ></h1>
          <h2
            class="subtitle"
            v-html="currentSong.singer"
          ></h2>
        </div>
        <div class="middle">
          <div class="middle-l">
            <div
              class="cd-wrapper"
              ref="cdWrapper"
            >
              <div
                class="cd"
                :class="cdCls"
              >
                <img
                  class="image"
                  :src="currentSong.image"
                  alt=""
                >
              </div>
            </div>
            <div class="playing-lyric-wrapper">
              <div class="playing-lyric"></div>
            </div>
          </div>
        </div>

        <div class="bottom">
          <div class="progress-wrapper">
            <span class="time time-l">{{formatTime(currentTime)}}</span>
            <div class="progress-bar-wrapper">
              <progress-bar
                ref="progressBar"
                :percent="percent"
                @percentChange="onProgressBarChange"
                @percentChanging="onProgressBarChanging"
              ></progress-bar>
            </div>
            <span class="time time-r">{{formatTime(currentSong.duration)}}</span>
          </div>
          <div class="operators">
            <div
              @click="changeMode"
              class="icon i-left"
            ><i :class="iconMode"></i></div>
            <div
              @click="prev"
              class="icon i-left"
              :class="disableCls"
            ><i class="icon-prev"></i></div>
            <div
              class="icon i-center"
              :class="disableCls"
            ><i
                @click="togglePlaying"
                :class="playIcon"
              ></i></div>
            <div
              @click="next"
              :class="disableCls"
              class="icon i-right"
            ><i class="icon-next"></i></div>
            <div class="icon i-right"><i class="icon icon-not-favorite"></i></div>
          </div>
        </div>
      </div>
    </transition>
    <transition name="mini">
      <div
        class="mini-player"
        v-show="!fullScreen"
        @click="open"
      >
        <div class="icon">
          <img
            :class="cdCls"
            width="40"
            height="40"
            :src="currentSong.image"
            alt=""
          >
        </div>
        <div class="text">
          <h2
            class="name"
            v-html="currentSong.name"
          ></h2>
          <p
            class="desc"
            v-html="currentSong.singer"
          ></p>
        </div>
        <div class="control">
          <progress-circle
            :radius="radius"
            :percent="percent"
          >
            <i
              :class="miniIcon"
              @click.stop="togglePlaying"
              class="icon-mini"
            ></i>
          </progress-circle>
        </div>
        <div class="control">
          <i class="icon-playlist"></i>
        </div>
      </div>
    </transition>
    <audio
      ref="audio"
      :src="currentSong.url"
      @canplay="ready"
      @ended="end"
      @timeupdate="updateTime"
      @error="error"
    ></audio>
  </div>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'
import animations from 'create-keyframe-animation'
import ProgressCircle from '@/base/progress-circle/progress-circle'
import ProgressBar from '@/base/progress-bar/progress-bar'
import { prefixStyle } from '@/common/dom'
import { playMode } from '@/common/config'
import { shuffle } from '@/common/util'
import {
  SET_FULL_SCREEN,
  SET_PLAYING_STATE,
  SET_CURRENT_INDEX,
  SET_PLAY_MODE,
  SET_PLAYLIST
} from '@/store/mutation-type'

const transform = prefixStyle('transform')

export default {
  name: 'Player',
  components: {
    ProgressCircle,
    ProgressBar
  },
  data() {
    return {
      radius: 32,
      songReady: false,
      currentTime: 0
    }
  },
  computed: {
    iconMode() {
      const { sequence, loop, random } = playMode
      switch (this.mode) {
        case sequence:
          return 'icon-sequence'
        case loop:
          return 'icon-loop'
        case random:
          return 'icon-random'
      }
      return 'icon-sequence'
    },
    percent() {
      return this.currentTime / this.currentSong.duration
    },
    cdCls() {
      return this.playing ? 'play' : 'play pause'
    },
    playIcon() {
      return this.playing ? 'icon-pause' : 'icon-play'
    },
    miniIcon() {
      return this.playing ? 'icon-pause-mini' : 'icon-play-mini'
    },
    disableCls() {
      return this.songReady ? '' : 'disable'
    },
    ...mapGetters([
      'fullScreen',
      'playlist',
      'sequenceList',
      'currentSong',
      'playing',
      'currentIndex',
      'mode'
    ])
  },
  watch: {
    currentSong(newSong, oldSong) {
      if (newSong.id === oldSong.id) return
      this.$nextTick(() => {
        this.$refs.audio.play()
      })
    },
    playing(newPlaying) {
      const audio = this.$refs.audio
      this.$nextTick(() => {
        newPlaying ? audio.play() : audio.pause()
      })
    },
    fullScreen(newVal) {
      if (newVal) {
        this.$nextTick(() => {
          this.$refs.progressBar.setProgressOffset(this.percent)
        })
      }
    }
  },
  methods: {
    changeMode() {
      const mode = (this.mode + 1) % 3
      this.setPlayMode(mode)
      let list = []
      if (mode === playMode.random) {
        list = shuffle(this.sequenceList)
      } else {
        list = this.sequenceList
      }
      this.resetCurrentIndex(list)
      this.setPlayList(list)
    },
    resetCurrentIndex(list) {
      const index = list.findIndex(item => item.id === this.currentSong.id)
      this.setCurrentIndex(index)
    },
    onProgressBarChanging(percent) {
      this.currentTime = this.currentSong.duration * percent
    },
    onProgressBarChange(percent) {
      this.currentTime = this.$refs.audio.currentTime =
        this.currentSong.duration * percent
      if (!this.playing) {
        this.togglePlaying()
      }
    },
    formatTime(interval) {
      interval = interval | 0
      const minutes = (interval / 60) | 0
      const seconds = this._pad(interval % 60)
      return `${minutes}:${seconds}`
    },
    updateTime(e) {
      this.currentTime = e.target.currentTime
    },
    ready() {
      this.songReady = true
    },
    loop() {
      this.$refs.audio.currentTime = 0
      this.$refs.audio.play()
    },
    end() {
      if (this.mode === playMode.loop) {
        this.loop()
      } else {
        this.currentTime = 0
        this.next()
      }
    },
    error() {},
    prev() {
      if (!this.songReady) {
        return
      }
      let index = this.currentIndex - 1
      if (index === -1) {
        index = this.playlist.length - 1
      }
      this.setCurrentIndex(index)
      if (!this.playing) {
        this.togglePlaying()
      }
      this.songReady = false
    },
    next() {
      if (!this.songReady) {
        return
      }
      let index = this.currentIndex + 1
      if (index === this.playlist.length) {
        index = 0
      }
      this.setCurrentIndex(index)
      if (!this.playing) {
        this.togglePlaying()
      }
      this.songReady = false
    },
    togglePlaying() {
      if (!this.songReady) {
        return
      }
      this.setPlayingState(!this.playing)
    },
    enter(el, done) {
      const { x, y, scale } = this._getPosAndScale()
      const animation = {
        0: {
          transform: `translate3d(${x}px, ${y}px, 0) scale(${scale})`
        },
        60: {
          transform: `translate3d(0, 0, 0) scale(1.1)`
        },
        100: {
          transform: `translate3d(0, 0, 0) scale(1)`
        }
      }
      animations.registerAnimation({
        name: 'move',
        animation,
        presets: {
          duration: 400,
          easing: 'linear'
        }
      })

      const cdWrapper = this.$refs.cdWrapper
      animations.runAnimation(cdWrapper, 'move', done)
    },
    afterEnter(el) {
      animations.unregisterAnimation('move')
      this.$refs.cdWrapper.style.animation = ''
    },
    leave(el, done) {
      const cdWrapper = this.$refs.cdWrapper
      cdWrapper.style.transition = 'all 0.4s'
      const { x, y, scale } = this._getPosAndScale()
      cdWrapper.style[transform] = `translate3d(${x}px, ${y}px, 0) scale(${scale})`
      cdWrapper.addEventListener('transitionend', done)
    },
    afterLeave(el) {
      const cdWrapper = this.$refs.cdWrapper
      cdWrapper.style.transition = ''
      cdWrapper.style[transform] = ''
    },
    _getPosAndScale() {
      const targetWidth = 40
      const paddingLeft = 40
      const paddingBottom = 30
      const paddingTop = 80
      const width = window.innerWidth * 0.8
      const scale = targetWidth / width
      const x = -(window.innerWidth / 2 - paddingLeft)
      const y = window.innerHeight - paddingTop - width / 2 - paddingBottom
      return {
        x,
        y,
        scale
      }
    },
    back() {
      this.setFullScreen(false)
    },
    open() {
      this.setFullScreen(true)
    },
    ...mapMutations({
      setFullScreen: SET_FULL_SCREEN,
      setPlayingState: SET_PLAYING_STATE,
      setCurrentIndex: SET_CURRENT_INDEX,
      setPlayMode: SET_PLAY_MODE,
      setPlayList: SET_PLAYLIST
    }),
    _pad(num, n = 2) {
      return (num + '').padStart(n, '0')
    }
  }
}
</script>

<style lang="stylus" scoped>
@import '~assets/stylus/variable'
@import '~assets/stylus/mixin'

.player
  .normal-player
    position fixed
    top 0
    left 0
    right 0
    bottom 0
    background-color $color-background
    z-index 150

    &.normal-enter-active, &.normal-leave-active
      transition all 0.4s

      .top, .bottom
        transition all 0.4s cubic-bezier(0.86, 0.18, 0.82, 1.32)

    &.normal-enter, &.normal-leave-to
      opacity 0

      .top
        transform translate3d(0, -100px, 0)

      .bottom
        transform translate3d(0, 100px, 0)

    .background
      position absolute
      left 0
      top 0
      width 100%
      height 100%
      opacity 0.6
      filter blur(20px)
      z-index -1

    .top
      position relative
      margin-bottom 25px

      .back
        position absolute
        top 0
        left 6px
        z-index 50

        .icon-back
          display block
          padding 9px
          font-size $font-size-large-x
          color $color-theme
          transform rotate(-90deg)

      .title
        width 70%
        margin 0 auto
        line-height 40px
        text-align center
        no-wrap()
        font-size $font-size-large
        color $color-text

      .subtitle
        line-height 20px
        text-align center
        font-size $font-size-medium
        color $color-text

    .middle
      position fixed
      width 100%
      top 80px
      bottom 170px
      white-space nowrap
      font-size 0

      .middle-l
        display inline-block
        vertical-align top
        position relative
        width 100%
        height 0
        padding-top 80%

        .cd-wrapper
          position absolute
          left 10%
          top 0
          width 80%
          height 100%
          box-sizing border-box

          .cd
            width 100%
            height 100%
            border-radius 50%

            &.play
              animation rotate 20s linear infinite

            &.pause
              animation-play-state paused

            .image
              position absolute
              left 0
              top 0
              width 100%
              height 100%
              box-sizing border-box
              border-radius 50%
              border 10px solid rgba(255, 255, 255, 0.1)

        .playing-lyric-wrapper
          width 80%
          margin 30px auto 0 auto
          text-align center
          overflow hidden

          .playing-lyric
            height 20px
            line-height 20px
            font-size $font-size-medium
            color $color-text-l

    .bottom
      position absolute
      bottom 50px
      width 100%

      .progress-wrapper
        display flex
        align-items center
        width 80%
        margin 0 auto
        padding 10px 0

        .time
          color $color-text
          font-size $font-size-small
          flex 0 0 30px
          width 30px
          line-height 30px

          &.time-l
            text-align left

          &.time-r
            text-align right

        .progress-bar-wrapper
          flex 1

      .operators
        display flex
        align-items center

        .icon
          flex 1
          color $color-theme

          &.disable
            color $color-theme-d

          i
            font-size 30px

        .i-left
          text-align right

        .i-center
          padding 0 20px
          text-align center

          i
            font-size 40px

        .i-right
          text-align left

        .icon-favorite
          color $color-sub-theme

  .mini-player
    display flex
    align-items center
    position fixed
    left 0
    bottom 0
    z-index 180
    width 100%
    height 60px
    background $color-highlight-background

    &.mini-enter-active, &.mini-leave-active
      transition all 0.4s

    &.mini-enter, &.mini-leave-to
      opacity 0

    .icon
      flex 0 0 40px
      width 40px
      padding 0 10px 0 20px

      img
        border-radius 50%

        &.play
          animation rotate 10s linear infinite

        &.pause
          animation-play-state paused

    .text
      display flex
      flex-direction column
      justify-content center
      flex 1
      line-height 20px
      overflow hidden

      .name
        margin-bottom 2px
        no-wrap()
        font-size $font-size-medium
        color $color-text

      .desc
        no-wrap()
        font-size $font-size-small
        color $color-text-d

    .control
      flex 0 0 30px
      width 30px
      padding 0 10px

      .icon-play-mini, .icon-pause-mini, .icon-playlist
        font-size 30px
        color $color-theme-d

      .icon-mini
        font-size 32px
        position absolute
        left 0
        top 0

  @keyframes rotate
    0%
      transform rotate(0)

    100%
      transform rotate(360deg)
</style>
