import UserCollection from '../src/modules/user/user.collection';
import bcryptUtil from '../src/utils/bcrypt.util';
module.exports = {
  async up(db: any, client: any) {
    console.log(process.env.MONGO_URL)
    // TODO write your migration here.
    // See https://github.com/seppevs/migrate-mongo/#creating-a-new-migration-script
    // Example:
    // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: true}});
    const inserted = await db.collection('speciality').insertMany([
      {
          "name": {
              "vi": "Sản phụ khoa"
          },
          "incrementId": 1
      },
      {
          "name": {
              "vi": "Da Liễu"
          },
          "incrementId": 2
      },
      {
          "name": {
              "vi": "Nhi Khoa"
          },
          "incrementId": 3
      },
      {
          "name": {
              "vi": "Tiêu hóa - Gan mật"
          },
          "incrementId": 4
      },
      {
          "name": {
              "vi": "Thần kinh"
          },
          "incrementId": 5
      },
      {
          "name": {
              "vi": "Nam khoa"
          },
          "incrementId": 6
      },
      {
          "name": {
              "vi": "Tai - Mũi - Họng"
          },
          "incrementId": 7
      },
      {
          "name": {
              "vi": "Cơ Xương Khớp"
          },
          "incrementId": 8
      },
      {
          "name": {
              "vi": "Nhãn khoa"
          },
          "incrementId": 9
      },
      {
          "name": {
              "vi": "Răng - Hàm - Mặt"
          },
          "incrementId": 10
      },
      {
          "name": {
              "vi": "Ung bướu"
          },
          "incrementId": 11
      },
      {
          "name": {
              "vi": "Dinh dưỡng"
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
              "vi": "Nội tiết"
          },
          "incrementId": 14
      },
      {
          "name": {
              "vi": "Thận - Tiết niệu"
          },
          "incrementId": 15
      },
      {
          "name": {
              "vi": "Hô hấp"
          },
          "incrementId": 16
      },
      {
          "name": {
              "vi": "Hiếm muộn - Vô sinh"
          },
          "incrementId": 17
      },
      {
          "name": {
              "vi": "Chấn thương chỉnh hình - Cột sống"
          },
          "incrementId": 18
      },
      {
          "name": {
              "vi": "Tâm thần"
          },
          "incrementId": 19
      },
      {
          "name": {
              "vi": "Xét nghiệm"
          },
          "incrementId": 20
      },
      {
          "name": {
              "vi": "Phụ khoa"
          },
          "incrementId": 21
      },
      {
          "name": {
              "vi": "Huyết học - Truyền máu"
          },
          "incrementId": 22
      },
      {
          "name": {
              "vi": "Dị ứng - Miễn dịch"
          },
          "incrementId": 23
      },
      {
          "name": {
              "vi": "Điều Dưỡng"
          },
          "incrementId": 24
      },
  ]);
  console.log(inserted)
   
  },

  async down(db: any, client: any) {
    // TODO write the statements to rollback your migration (if possible)
    // Example:
    await db.collection('speciality').deleteMany({});
  }
};
