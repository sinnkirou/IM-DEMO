import { BASE_URL, IM_URL } from '@/utils/config';
import format from '@/utils/format';
import { chatMessageRule } from '@/utils/formatRules';
import request from '@/utils/request';
import get from 'lodash/get';

export function syncMessages(params) {
  return new Promise((resolve, reject) => {
    request({
      method: 'get',
      url: '/messages',
      params,
      baseURL: IM_URL,
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
