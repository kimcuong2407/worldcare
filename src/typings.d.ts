

declare module 'casbin-mongoose-adapter';
declare namespace Express {
  export interface Request {
    span?: any,
    user?: any,
    token?: string,
    hospitalId?: string,
    companyId?: string,
    language?: string,
  }
}
declare module 'sub-vn' {
  export function getWardsByDistrictCode(code: string): any;
  export function getProvinces(): [any];
  export function getDistricts(): [any];
  export function getWards(): [any];
  export function getProvincesWithDetail(): [any];
  export function getDistrictsByProvinceCode(code: string): [any];
  export function getWardsByDistrictCode(code: string): [any];
  export function getWardsByProvinceCode(code: string): [any];
  export function getWardsByCode(code: string): any;
  export function getCityByCode(code: string): any;
  export function getDistrictByCode(code: string): any;
}

declare module 'mongoose' {
  import mongoose = require('mongoose');
  import mongooseIntl = require('mongoose-intl');

  // methods
  export interface MongooseIntlDocument extends Document {
    getLanguages(): [string];
    getLanguage(): string;
    setLanguage(lang: string): void;
    unsetLanguage(): void;
  }

  // statics
  interface MongooseIntlModel<T extends Document> extends Model<T> {
    getLanguages(): [string];
    getDefaultLanguage(): string;
    setDefaultLanguage(lang: string): void;
  }

  interface mongoose extends NodeJS.EventEmitter, ModelProperties {
    getLanguages(): [string];
    getDefaultLanguage(): string;
    setDefaultLanguage(lang: string): void;
  }

  export interface MongooseIntlOptions {
    languages: [string];
    defaultLanguage: string;
  }

  export interface MongooseIntlSchema extends Schema {
    plugin(
      plugin: (
        schema: MongooseIntlSchema,
        options: MongooseIntlOptions
      ) => void,
      options: MongooseIntlOptions
    ): this;

    // overload for the default mongoose plugin function
    plugin(
      plugin: (schema: Schema, options: Object) => void,
      opts?: Object
    ): this;
  }

  export function model(
    name: string,
    schema?: Schema,
    collection?: string,
    skipIntl?: boolean
  ): MongooseIntlModel<any>;

  export function setDefaultLanguage(lang: string): typeof mongoose;
}

declare module 'mongoose-intl' {
  import mongoose = require('mongoose');
  var _: (schema: mongoose.Schema, options: Object) => void;
  export = _;
}
