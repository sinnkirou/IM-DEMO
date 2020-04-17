import get from 'lodash/get';
import { BASE_URL } from '@/utils/config';
import request from '@/utils/request';
import format from '@/utils/format';
import { chatMessageRule } from '@/utils/formatRules';

export function syncMessages(params) {
  return new Promise((resolve, reject) => {
    request({
      method: 'get',
      url: '/messages',
      params,
      baseURL: BASE_URL,
    })
      .then(res => {
        if(get(res, 'data.records')) {
          res.data.records = format(res.data.records, chatMessageRule);
        }
        resolve(res);
      })
      .catch(reject);
  });
}
