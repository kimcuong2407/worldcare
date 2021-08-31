import mapValues from 'lodash/mapValues';
import get from 'lodash/get';
import mixin from 'lodash/mixin';
import { isPlainObject } from 'lodash';
import _ from 'lodash';
import moment from 'moment';

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

const mapLanguage = (obj, preferLang = 'vi') => {
 return deeply(_.mapValues)(obj,  (val: any, key) => {
  return _.get(val, preferLang, _.get(val, 'vi', val));
});
}

const enumerateDaysBetweenDates = (startTime: number, endTime: number, format = 'YYYYMMDD') => {
  const startDate: any = moment.utc(startTime).utcOffset('+07:00');
  const endDate = moment.utc(endTime).utcOffset('+07:00');
  const dates: any = [endDate.format(format)];

  while (startDate.isBefore(endDate)) {
    dates.push(startDate.format(format));
    startDate.add(1, 'days');
  }
  return dates;
};

const mask = (str: string, mask = '*') => {
    const n = (str|| '').length / 1.2 ;
    return ('' + str).slice(0, -n)
        .replace(/./g, mask)
        + ('' + str).slice(-n);
}
export default {
  getPaging,
  mapLanguage,
  enumerateDaysBetweenDates,
  mask,
}