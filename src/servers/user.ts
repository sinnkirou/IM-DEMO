import { USER_URL } from '@/utils/config';
import format from '@/utils/format';
import request from '@/utils/request';

export function userLogin(params) {
  return new Promise((resolve, reject) => {
    request({
      method: 'post',
      url: '/user/login',
      data: params,
      baseURL: USER_URL,
    })
      .then(res => {
        res.data = format(res.data, [{
          name: 'password'
        }, {
          name: 'nickName',
          rename: 'nickname'
        }, {
          name: 'id'
        }, {
          name: 'email'
        }, {
          name: 'token'
        }]);
        resolve(res);
      })
      .catch(reject);
  });
}

export function userRegister(params) {
  return new Promise((resolve, reject) => {
    request({
      method: 'post',
      url: '/user',
      data: params,
      baseURL: USER_URL
    })
      .then(res => {
        resolve(res);
      })
      .catch(reject);
  });
}

export function getUserInfo(params) {
  return new Promise((resolve, reject) => {
    request({
      method: 'get',
      url: '/user/info',
      params,
      baseURL: USER_URL
    })
      .then(res => {
        res.data = format(res.data, [{
          name: 'nickName',
          rename: 'nickname'
        }, {
          name: 'id'
        }, {
          name: 'email'
        }])
        resolve(res);
      })
      .catch(reject);
  });
}
