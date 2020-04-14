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
