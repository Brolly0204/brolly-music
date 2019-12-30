import axios from 'axios'
import { commonParams } from './config'

export function getSingerList() {
  const url = '/api/getSingerList'

  const params = Object.assign({}, commonParams, {
    channel: 'singer',
    page: 'list',
    key: 'all_all_all',
    pagesize: 100,
    pagenum: 1,
    hostUin: 0,
    needNewCode: 0,
    platform: 'yqq'
  })

  return axios
    .get(url, {
      params
    })
    .then(res => res.data)
}

export function getSingerDetail(singerID) {
  const url = '/api/getSingerDetail'

  const params = Object.assign({}, commonParams, {
    hostUin: 0,
    needNewCode: 0,
    platform: 'yqq',
    order: 'listen',
    begin: 0,
    num: 80,
    songstatus: 1,
    singermid: singerID,
    format: 'json'
  })

  return axios
    .get(url, {
      params
    })
    .then(res => res.data)
}
