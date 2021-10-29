const serialize = require('serialize-javascript');

const serializeObj = (obj) =>
  serialize(obj, { unsafe: true, ignoreFunction: true });

const query = {
  'billing.txDays': { $gte: 5, $lte: 10 },
  'billing.lastBillDate': {lte: "2021-03-18T00:00:00.000Z"}
};
console.log(JSON.stringify(serializeObj(query)));
