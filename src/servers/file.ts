import { BASE_URL } from '@/utils/config';
import request from '@/utils/request';

export function fileDownload(params) {
    return new Promise((resolve, reject)=> {
      request({
        method: 'get',
        url: '/file/get',
        params,
        baseURL: BASE_URL,
        responseType: 'blob'
      }).then(res=> {
        resolve(res);
      }).catch(reject);
    })
  }
  
  export function fileUpload(params) {
    return new Promise((resolve, reject)=> {
      request({
        method: 'post',
        url: '/file/upload',
        data: params,
        headers: { 'content-type': 'multipart/form-data' },
        baseURL: BASE_URL,
      }).then(res=> {
        resolve(res);
      }).catch(reject);
    })
  }