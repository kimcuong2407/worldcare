import UserCollection from '../src/modules/user/user.collection';
import bcryptUtil from '../src/utils/bcrypt.util';
module.exports = {
  async up(db: any, client: any) {
    console.log(process.env.MONGO_URL)
    // TODO write your migration here.
    // See https://github.com/seppevs/migrate-mongo/#creating-a-new-migration-script
    // Example:
    // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: true}});
    const inserted = await db.collection('employee_group').insertMany([
      {
        "name": {
          "vi": "Bác Sĩ",
          "en": "Doctor"
        },
        "incrementId": 1
      },
      {
        "name": {
          "vi": "Y Tá",
          "en": "Nurse"
        },
        "incrementId": 2
      },
      {
        "name": {
          "vi": "Điều Dưỡng",
          "en": "Nursing"
        },
        "incrementId": 3
      },
      {
        "name": {
          "vi": "Dược Sĩ",
          "en": "Pharmacist"
        },
        "incrementId": 4
      },
    ]);
    console.log(inserted)

  },

  async down(db: any, client: any) {
    // TODO write the statements to rollback your migration (if possible)
    // Example:
    await db.collection('employee_group').deleteMany({});
  }
};
