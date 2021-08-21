import { MONGO_URL } from '../config';
import path from 'path';

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
    // model.addDef("r", "r", "sub, dom, obj, act");
    // model.addDef("p", "p", "sub, dom, obj, act");
    // model.addDef("g", "g", "_, _");
    // model.addDef("g2", "g2", "_, _");
    // model.addDef("e", "e", "some(where (p.eft == allow))");
    // model.addDef("m", "m", "g(r.sub, p.sub) && g2(r.dom, p.dom) && r.obj == p.obj && r.act == p.act");
    const model2 = path.resolve(__dirname, './model.conf');
    this.adapter = await MongooseAdapter.newAdapter(MONGO_URL);
    this.enforcer = await newEnforcer(model2, this.adapter);
    this.enforcer.initWithAdapter(model2, this.adapter)
  }
  static getInstance() {
    if (!Casbin.instance) {
      Casbin.instance = new Casbin();
    }
    return Casbin.instance;
  }
}

export default Casbin.getInstance();
