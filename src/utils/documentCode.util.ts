const initDocumentCode = (prefix: string, seq: number) => {
  let s = '000000000' + seq;
  return prefix + s.substr(s.length - 6);
}

export default {
  initDocumentCode
}