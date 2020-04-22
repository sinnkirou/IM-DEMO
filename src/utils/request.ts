// https://github.com/axios/axios config 详情
import { IM_URL } from '@/utils/config';
import axios, { AxiosPromise, AxiosRequestConfig, AxiosResponse } from 'axios';
import _ from 'lodash';
import router from 'umi/router';
import storage from './storage';

// const options = {
//   url: '/login',
//   method: 'post',
//   params: { name: 1234 }, // /login?name=1234 url 拼接参数
//   data: {}, // 参数携带 body
// };
/**
 * 封装请求
 * @param {Object} options [请求参数]
 */
function request(options: AxiosRequestConfig): AxiosPromise {
  const defaultOptions = { baseURL: IM_URL };
  const params = { ...options.params };
  if (options) {
    options.headers = { 'x-user-token': storage.cookie.get('token') };
  }
  // @ts-ignore
  return axios({ ...defaultOptions, ...options, params })
    .then(response => {
      return response.data || { success: false };
    })
    .catch(e => {
      const response = _.get(e, 'response.data') || { success: false, message: '网络错误' };
      const code = _.get(response, 'code');
      const codes = ['AUTH_01401', 'COV_01401', 'COV_01402', 'COV_01405'];
      if (code && codes.includes(code)) {
        console.log(code);
        router.push('/signin');
        storage.local.clear();
        storage.cookie.remove('token');
      }
      return response;
    });
}

export default request;
