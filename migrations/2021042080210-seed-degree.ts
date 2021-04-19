import UserCollection from '../src/modules/user/user.collection';
import bcryptUtil from '../src/utils/bcrypt.util';
module.exports = {
  async up(db: any, client: any) {
    console.log(process.env.MONGO_URL)
    // TODO write your migration here.
    // See https://github.com/seppevs/migrate-mongo/#creating-a-new-migration-script
    // Example:
    // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: true}});
    const inserted = await db.collection('degree').insertMany([
      {
          "name": {
              "vi": "Tiến sĩ Y Khoa"
          },
          "incrementId": 1
      },
      {
          "name": {
              "vi": "Thạc sĩ Y Khoa"
          },
          "incrementId": 2
      },
      {
          "name": {
              "vi": "Thạc sĩ Dược"
          },
          "incrementId": 3
      },
      {
          "name": {
              "vi": "Bác sĩ chuyên khoa II"
          },
          "incrementId": 4
      },
      {
          "name": {
              "vi": "Dược sĩ Chuyên Khoa II"
          },
          "incrementId": 5
      },
      {
          "name": {
              "vi": "Bác sĩ chuyên khoa I"
          },
          "incrementId": 6
      },
      {
          "name": {
              "vi": "Dược sĩ Chuyên Khoa I"
          },
          "incrementId": 7
      },
      {
          "name": {
              "vi": "Bác sĩ Đa Khoa"
          },
          "incrementId": 8
      },
      {
          "name": {
              "vi": "Bác sĩ Y Học Cổ Truyền"
          },
          "incrementId": 9
      },
      {
          "name": {
              "vi": "Bác sĩ Răng Hàm Mặt"
          },
          "incrementId": 10
      },
      {
          "name": {
              "vi": "Dược sĩ Đại học"
          },
          "incrementId": 11
      },
      {
          "name": {
              "vi": "Cử nhân điều dưỡng"
          },
          "incrementId": 12
      },
      {
          "name": {
              "vi": "Cử nhân nữ hộ sinh"
          },
          "incrementId": 13
      },
      {
          "name": {
              "vi": "Dược sĩ Cao Đẳng"
          },
          "incrementId": 14
      },
      {
          "name": {
              "vi": "Cao đẳng điều dưỡng"
          },
          "incrementId": 15
      },
      {
          "name": {
              "vi": "Cao đẳng nữ hộ sinh"
          },
          "incrementId": 16
      },
      {
          "name": {
              "vi": "Dược sĩ Trung cấp"
          },
          "incrementId": 17
      },
      {
          "name": {
              "vi": "Trung cấp điều dưỡng"
          },
          "incrementId": 18
      },
      {
          "name": {
              "vi": "Trung cấp nữ hộ sinh"
          },
          "incrementId": 19
      },
      {
          "name": {
              "vi": "Kỹ thuật viên"
          },
          "incrementId": 20
      },
      {
          "name": {
              "vi": "Dược tá"
          },
          "incrementId": 21
      },
      {
          "name": {
              "vi": "Sơ cấp điều dưỡng"
          },
          "incrementId": 22
      },
      {
          "name": {
              "vi": "Sơ cấp nữ hộ sinh"
          },
          "incrementId": 23
      }
  ]);
  console.log(inserted)
   
  },

  async down(db: any, client: any) {
    // TODO write the statements to rollback your migration (if possible)
    // Example:
    await db.collection('degree').deleteMany({});
  }
};
