import UserCollection from '../src/modules/user/user.collection';
import bcryptUtil from '../src/utils/bcrypt.util';
module.exports = {
  async up(db: any, client: any) {
    // TODO write your migration here.
    // See https://github.com/seppevs/migrate-mongo/#creating-a-new-migration-script
    // Example:
    // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: true}});
    const password = await bcryptUtil.generateHash('Admin@worldcarE!');
    const user = {
      username: 'admin',
      email: 'admin@worldcare.vn',
      password: password,
    };
    const inserted = await db.collection('user').insertOne(user);
    await db.collection('casbin_rule').insertOne({
      p_type: 'g',
      v0: inserted.insertedId.toString(),
      v1: 'ADMIN',
    });
  },

  async down(db: any, client: any) {
    // TODO write the statements to rollback your migration (if possible)
    // Example:
    await db.collection('user').deleteOne({username: 'danielpham'});
  }
};
