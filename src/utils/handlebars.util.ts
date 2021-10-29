/* eslint-disable no-param-reassign */
import handlebars from 'handlebars';

const reduceOp = (args: any[], reducer: any) => {
  args = Array.from(args);
  args.pop(); // => options
  const first = args.shift();
  return args.reduce(reducer, first);
};
/*
https://gist.github.com/servel333/21e1eedbd70db5a7cfff327526c72bc5
Usage:
  {{#if (and canSwim canDive)}}
    Yes i can swim and dive
  {{/if}}
*/
handlebars.registerHelper({
  eq(...args: any[]) { return reduceOp(args, (a: any, b: any) => a === b); },
  ne(...args: any[]) { return reduceOp(args, (a: any, b: any) => a !== b); },
  lt(...args: any[]) { return reduceOp(args, (a: any, b: any) => a < b); },
  gt(...args: any[]) { return reduceOp(args, (a: any, b: any) => a > b); },
  lte(...args: any[]) { return reduceOp(args, (a: any, b: any) => a <= b); },
  gte(...args: any[]) { return reduceOp(args, (a: any, b: any) => a >= b); },
  and(...args: any[]) { return reduceOp(args, (a: any, b: any) => a && b); },
  or(...args: any[]) { return reduceOp(args, (a: any, b: any) => a || b); },
});

export default handlebars;
