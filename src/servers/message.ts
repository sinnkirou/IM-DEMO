import { BASE_URL } from '@/utils/config';
import request from '@/utils/request';

export function syncMessages(params) {
  return new Promise((resolve, reject) => {
    request({
      method: 'get',
      url: '/messages',
      params,
      baseURL: BASE_URL,
    })
      .then(res => {
        resolve(res);
      })
      .catch(reject);
  });
}
