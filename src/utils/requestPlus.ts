import { baseURL, doctorURL, patientURL } from '@/utils/config';
import format from '@/utils/format';
import storage from '@/utils/storage';
import axios, { AxiosPromise, AxiosRequestConfig } from 'axios';
import _ from 'lodash';
import qs from 'qs';
import router from 'umi/router';

const newAxios = axios.create({ baseURL });

newAxios.interceptors.request.use(
  function success(config) {
    config.paramsSerializer = function (params) {
      return qs.stringify(params, { arrayFormat: 'repeat' });
    };
    return config;
  },
  function error(err) {
    return Promise.reject(err);
  }
);

newAxios.interceptors.response.use(
  function success(response) {
    const { data = {} } = response;
    if (data.success) {
      return data.data;
    } else {
      throw response.data.message;
    }
  },
  function error(err) {
    const { config, response } = err;

    if (response) {
      const { status } = response;
      if (['AUTH_01401', 'COV_01401', 'COV_01402', 'COV_01405'].includes(_.get(response, 'data.code'))) {
        console.log(response);
        storage.local.clear();
        storage.cookie.remove('token');
        router.push('/signin');
      }
      if (status >= 500) {
        throw response.data.message;
      } else if (status === 404) {
        // throw `未找到 BASEURL: ${config.url}`;
        throw new Error('请求不到资源');
      } else if (status === 400) {
        if (_.get(response, 'data.code') === 'MW_03401') {
          throw new Error('参数错误');
        }
        throw JSON.stringify(response.data.message);
      } else if (status === 401) {
        router.push('/signin');
        throw response.data.message;
      } else if (status > 400) {
        if (typeof (response.data.message) === 'string') {
          throw response.data.message;
        }
        throw JSON.stringify(response.data.message);
      }
    } else {
      throw new Error('网络错误');
    }
  }
);

function request(
  params: AxiosRequestConfig,
  transformResponse: any
): AxiosPromise {
  if (params) {
    params.headers = { 'x-user-token': storage.cookie.get('token') };
    if (Array.isArray(params.transformResponse)) {
      params.transformResponse.push(transformResponse);
    } else {
      params.transformResponse = [transformResponse];
    }

    function transformResponse(result: string) {
      try {
        return JSON.parse(lineToUpper(result));
      } catch (error) {
        return result;
      }
    }
  }

  return new Promise((resolve, reject) => {
    newAxios(params)
      .then((result: any) => {
        resolve(transformResponse ? format(result, transformResponse) : result);
      })
      .catch((msg: any) => {
        reject(msg);
      });
  });
}

const methods = ['get', 'post', 'put', 'delete'];

const exportDefault: {
  get: (
    url: string,
    sendData?: any,
    transformResponse?: any,
    options?: any
  ) => AxiosPromise;
  post: (
    url: string,
    sendData?: any,
    transformResponse?: any,
    options?: any
  ) => AxiosPromise;
  put: (
    url: string,
    sendData?: any,
    transformResponse?: any,
    options?: any
  ) => AxiosPromise;
  delete: (
    url: string,
    sendData?: any,
    transformResponse?: any,
    options?: any
  ) => AxiosPromise;
} = {};

methods.forEach((item: string) => {
  exportDefault[item] = function (
    url: string,
    sendData?: any,
    transformResponse?: any,
    options?: any
  ) {
    const axiosOptions: AxiosRequestConfig = {
      url,
      method: item,
      ...options,
    };

    if (item === 'get') {
      axiosOptions.params = sendData;
    } else {
      axiosOptions.data = sendData;
    }

    return request(axiosOptions, transformResponse);
  };
});

export default exportDefault;

function lineToUpper(string: string) {
  return string.replace(/"[\w]*"\:/g, function (all) {
    return all.replace(/\_(\w)/g, function (all, letter) {
      return letter.toUpperCase();
    });
  });
}
