declare module 'idllogger';
declare namespace Express {
  export interface Request {
    span?: any,
    user?: any,
    token?: string,
    companyId?: string,
    permissions?: string[],
    language?: string,
  }
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
