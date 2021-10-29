import UserCollection from '../src/modules/user/user.collection';
import bcryptUtil from '../src/utils/bcrypt.util';
module.exports = {
  async up(db: any, client: any) {
    // TODO write your migration here.
    // See https://github.com/seppevs/migrate-mongo/#creating-a-new-migration-script
    // Example:
    // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: true}});
    await db.collection('role').insertMany([
      {
        name: 'ADMIN',
      },
      {
        name: 'SUPPORTER',
      }
    ]);
  },

  async down(db: any, client: any) {
    // TODO write the statements to rollback your migration (if possible)
    // Example:
    await db.collection('role').remove({ hospitalId: null });
  }
};
