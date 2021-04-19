import get from 'lodash/get';

const getPaging = (req: any) => {
  let page = Number(get(req, 'query.page', 1));
  page = page <= 0 ? 1 : page;
  let limit = Number(get(req, 'query.limit', 10));
  limit = limit <= 0 || limit > 200 ? 10 : limit;
  const offset = (page - 1) * limit;
  return { page, limit, offset };
};

export default {
  getPaging,
}