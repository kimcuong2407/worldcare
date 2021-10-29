import bcrypt from 'bcrypt';
const saltRounds = 10;

const generateHash = async (password: string) => {
  return bcrypt.hashSync(password, saltRounds);
}

const comparePassword = async (password: string, hash: string) => {
  return bcrypt.compareSync(password, hash);
}

export default {
  generateHash,
  comparePassword
}