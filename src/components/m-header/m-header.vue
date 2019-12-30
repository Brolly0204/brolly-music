<template>
  <div class="m-header">
    <div class="icon"></div>
    <h1 class="text">Brolly Music</h1>
  </div>
</template>

<script>
export default {
  data() {
    return {}
  },
  components: {}
}
</script>

<style lang="stylus" scoped>
  @import "~assets/stylus/variable";
  @import "~assets/stylus/mixin";

  .m-header
    position relative
    height 44px
    line-height 44px
    text-align center
    color $color-theme
    font-size 0
    .icon
      display inline-block
      width 30px
      height 32px
      margin-right 9px
      vertical-align middle
      bg-image('./logo')
      background-size 30px 32px
    .text
      display inline-block
      vertical-align middle
      font-size $font-size-large
</style>
