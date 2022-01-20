const initDocumentCode = (prefix: string, seq: number) => {
  let s = '000000000' + seq;
  return prefix + s.substr(s.length - 6);
}

const generateDocumentSubCode = (code: string) => {
  if (code.includes('-')) {
    const splitCode: string[] = code.split('-');
    const latestVersion: number = parseInt(splitCode[1]);
    return `${splitCode[0]}-${latestVersion + 1}`;
  } else {
    return `${code}-1`;
  }
}

export default {
  initDocumentCode,
  generateDocumentSubCode
}