import mapValues from 'lodash/mapValues';
import get from 'lodash/get';
import mixin from 'lodash/mixin';
import { isPlainObject } from 'lodash';
import _ from 'lodash';

const deeply = (map) => {
      return (obj: any, fn) => {
          return map(mapValues(obj, function (v) {
              return isPlainObject(v) ? deeply(map)(v, fn) : v;
          }), fn);
      }
  }

const getPaging = (req: any) => {
  let page = Number(get(req, 'query.page', 1));
  page = page <= 0 ? 1 : page;
  let limit = Number(get(req, 'query.limit', 10));
  limit = limit <= 0 || limit > 200 ? 10 : limit;
  const offset = (page - 1) * limit;
  return { page, limit, offset };
};

const mapLanguage = (obj, preferLang) => {
 return deeply(_.mapValues)(obj,  (val: any, key) => {
  return _.get(val, preferLang, _.get(val, 'vi', val));
});
}

export default {
  getPaging,
  mapLanguage,
}