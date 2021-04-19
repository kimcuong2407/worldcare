import { MONGO_URL } from "../config";

import { newEnforcer, Model, Enforcer } from 'casbin';
import MongooseAdapter from 'casbin-mongoose-adapter';


import loggerHelper from '@utils/logger.util';


const logger = loggerHelper.getLogger('queue');

class Casbin {

  static instance: Casbin;
  adapter: any;
  enforcer: Enforcer;

  constructor() {
    this.init().then(() => {
      logger.info('Initialized casbin');
    });
  }

  async init() {
    const model = new Model();
    model.addDef("r", "r", "sub, obj, act")
    model.addDef("p", "p", "sub, obj, act")
    model.addDef("g", "g", "_, _")
    model.addDef("e", "e", "some(where (p.eft == allow))")
    model.addDef("m", "m", "g(r.sub, p.sub, r.dom) && r.dom == p.dom && r.act == p.act")

    this.adapter = await MongooseAdapter.newAdapter(MONGO_URL);
    this.enforcer = await newEnforcer(model, this.adapter);
  }

  static getInstance() {
    if (!Casbin.instance) {
      Casbin.instance = new Casbin();
    }
    return Casbin.instance;
  }
}

export default Casbin.getInstance();
