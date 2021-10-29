import isNil from 'lodash/isNil';

export const setResponse = (data: any, status?: boolean, message?: string) => ({
  status: status || !isNil(data),
  data: data || null,
  message: message || 'success',
});

export default {};
