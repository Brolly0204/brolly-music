const path = require('path')
const axios = require('axios')
const bodyParser = require('body-parser')

const resolve = dir => path.join(__dirname, dir)

module.exports = {
  devServer: {
    before(app) {
      app.get('/api/test', function(req, res) {
        res.send('hello world devServer')
      })

      app.get('/api/getTopBanner', function(req, res) {
        const url = 'https://u.y.qq.com/cgi-bin/musicu.fcg'
        const jumpPrefix = 'https://y.qq.com/n/yqq/album/'

        axios
          .get(url, {
            headers: {
              referer: 'https://u.y.qq.com/',
              host: 'u.y.qq.com'
            },
            params: req.query
          })
          .then(response => {
            response = response.data
            if (response.code === 0) {
              const slider = []
              const content = response.focus.data && response.focus.data.content
              if (content) {
                for (let i = 0; i < content.length; i++) {
                  const item = content[i]
                  const sliderItem = {}
                  sliderItem.id = item.id
                  sliderItem.linkUrl = jumpPrefix + item.jump_info.url + '.html'
                  sliderItem.picUrl = item.pic_info.url
                  slider.push(sliderItem)
                }
              }
              res.json({
                code: 0,
                data: {
                  slider
                }
              })
            } else {
              res.json(response)
            }
          })
          .catch(e => {
            console.log(e)
          })
      })

      app.get('/api/getDiscList', function(req, res) {
        const url =
          'https://c.y.qq.com/splcloud/fcgi-bin/fcg_get_diss_by_tag.fcg'
        axios
          .get(url, {
            headers: {
              referer: 'https://c.y.qq.com/',
              host: 'c.y.qq.com'
            },
            params: req.query
          })
          .then(response => {
            res.json(response.data)
          })
          .catch(e => console.log(e))
      })

      app.get('/api/getSingerList', function(req, res) {
        const url = 'https://c.y.qq.com/v8/fcg-bin/v8.fcg'
        axios
          .get(url, {
            headers: {
              referer: 'https://c.y.qq.com/',
              host: 'c.y.qq.com'
            },
            params: req.query
          })
          .then(response => res.json(response.data))
          .catch(e => console.log(e))
      })
      // https://c.y.qq.com/v8/fcg-bin/fcg_v8_singer_track_cp.fcg
      app.get('/api/getSingerDetail', function(req, res) {
        const url = 'https://c.y.qq.com/v8/fcg-bin/fcg_v8_singer_track_cp.fcg'
        axios
          .get(url, {
            headers: {
              referer: 'https://c.y.qq.com/',
              host: 'c.y.qq.com'
            },
            params: req.query
          })
          .then(response => res.json(response.data))
          .catch(e => console.log(e))
      })

      // 获取歌曲url
      app.post('/api/getPurlUrl', bodyParser.json(), function(req, res) {
        const url = 'https://u.y.qq.com/cgi-bin/musicu.fcg'
        axios
          .post(url, req.body, {
            headers: {
              referer: 'https://y.qq.com/',
              origin: 'https://y.qq.com',
              'Content-type': 'application/x-www-form-urlencoded'
            }
          })
          .then(response => {
            res.json(response.data)
          })
          .catch(e => {
            console.log(e)
          })
      })
    }
  },
  chainWebpack(config) {
    config.resolve.alias
      .set('components', resolve('src/components'))
      .set('assets', resolve('src/assets'))
      .set('api', resolve('src/api'))
      .set('base', resolve('src/base'))
  }
}
