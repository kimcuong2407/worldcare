declare module 'idllogger';
declare namespace Express {
  export interface Request {
    span?: any,
    user?: any,
    token?: string,
    companyId?: string,
    permissions?: string[]
  }
}
