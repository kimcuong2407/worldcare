declare module 'casbin-mongoose-adapter';

declare namespace Express {
  export interface Request {
    span?: any,
    user?: any,
    token?: string,
    hospitalId?: string,
    companyId?: string,
    language?: string,
    isRoot: boolean,
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

declare module 'mongoose-sequence' {
    var _: (mongoose: any) => mongoose.Schema;
    export = _;
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



declare module 'mongoose' {
  interface CustomLabels {
      totalDocs?: string;
      limit?: string;
      page?: string;
      totalPages?: string;
      docs?: string;
      nextPage?: string;
      prevPage?: string;
      pagingCounter?: string;
      hasPrevPage?: string;
      hasNextPage?: string;
  }

  interface PaginateOptions {
      sort?: object | string;
      offset?: number;
      page?: number;
      limit?: number;
      customLabels?: CustomLabels;
      /* If pagination is set to `false`, it will return all docs without adding limit condition. (Default: `true`) */
      pagination?: boolean;
      allowDiskUse?: boolean;
      countQuery?: object;
  }

  interface QueryPopulateOptions {
      /** space delimited path(s) to populate */
      path: string;
      /** optional fields to select */
      select?: any;
      /** optional query conditions to match */
      match?: any;
      /** optional model to use for population */
      model?: string | Model<any>;
      /** optional query options like sort, limit, etc */
      options?: any;
      /** deep populate */
      populate?: QueryPopulateOptions | QueryPopulateOptions[];
  }

  interface AggregatePaginateResult<T> {
      docs: T[];
      totalDocs: number;
      limit: number;
      page?: number;
      totalPages: number;
      nextPage?: number | null;
      prevPage?: number | null;
      pagingCounter: number;
      hasPrevPage: boolean;
      hasNextPage: boolean;
      meta?: any;
      [customLabel: string]: T[] | number | boolean | null | undefined;
  }

  interface AggregatePaginateModel<T extends Document> extends Model<T> {
      aggregatePaginate(
          query?: Aggregate<T[]>,
          options?: PaginateOptions,
          callback?: (err: any, result: AggregatePaginateResult<T>) => void,
      ): Promise<AggregatePaginateResult<T>>;
      paginate(
        query?: Aggregate<T[]>,
        options?: PaginateOptions,
        callback?: (err: any, result: AggregatePaginateResult<T>) => void,
    ): Promise<AggregatePaginateResult<T>>;
  }

  function model(name: string, schema?: Schema, collection?: string, skipInit?: boolean): AggregatePaginateModel<any>;
}
declare module 'mongoose-intl' {
  import mongoose = require('mongoose');
  var _: (schema: mongoose.Schema, options: Object) => void;
  export = _;
}
