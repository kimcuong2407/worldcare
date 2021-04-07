import axios from 'axios';
import { get } from 'lodash';

const request = {
  /**
   * Make a http request to a url
   * @param {string} m method
   * @param {string} url url
   * @param {string} token token for auth
   * @param {object} params
   */
  call(m: string, url: string, params: any, token: string, headerObj = {}, options = {}) {
    const uri = url;
    const headers: any = {
      'Content-Type': 'application/json',
      client: 'rpm',
      ...headerObj,
    };
    if (token) {
      headers.Authorization = `${token}`;
    }
    const method = m.toUpperCase();
    const opts: any = {
      method,
      headers,
      ...options,
    };
    if (method !== 'GET') {
      opts.data = JSON.stringify(params);
    }
    return new Promise((resolve, reject) => {
      axios(uri, { timeout: 300000, ...opts }).then((res) => {
        const { data } = res || {};
        resolve(data);
      }).catch((err) => {
        reject(get(err, 'response.data', err));
      });
    });
  },
  /**
   * Make a POST request
   * @param {string} url
   * @param {token} token
   * @param {object} params
   */
  post(url: string, params: any, token?: string, headers = {}) {
    return this.call('post', url, params, token, headers);
  },
  /**
   * Make a DELETE request
   * @param {string} url
   * @param {token} token
   * @param {object} params
   */
  delete(url: string, params: any, token?: string, headers = {}) {
    return this.call('delete', url, params, token, headers);
  },
  /**
   * Make a PUT request
   * @param {string} url
   * @param {token} token
   * @param {object} params
   */
  put(url: string, params: any, token?: string, headers = {}) {
    return this.call('put', url, params, token, headers);
  },
  /**
   * Make a GET request
   * @param {string} url
   * @param {token} token
   */
  get(url: string, token?: string, headers?: any, opts?: any) {
    return this.call('get', url, null, token, headers, opts);
  },
};

export default request;
