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
        "service": "CLINIC_APPOINTMENT",
        "incrementId": 1
      },
      {
        "name": {
          "vi": "Da Liễu"
        },
        "service": "CLINIC_APPOINTMENT",
        "incrementId": 2
      },
      {
        "name": {
          "vi": "Nhi Khoa"
        },
        "service": "CLINIC_APPOINTMENT",
        "incrementId": 3
      },
      {
        "name": {
          "vi": "Tiêu hóa - Gan mật"
        },
        "service": "CLINIC_APPOINTMENT",
        "incrementId": 4
      },
      {
        "name": {
          "vi": "Thần kinh"
        },
        "service": "CLINIC_APPOINTMENT",
        "incrementId": 5
      },
      {
        "name": {
          "vi": "Nam khoa"
        },
        "service": "CLINIC_APPOINTMENT",
        "incrementId": 6
      },
      {
        "name": {
          "vi": "Tai - Mũi - Họng"
        },
        "service": "CLINIC_APPOINTMENT",
        "incrementId": 7
      },
      {
        "name": {
          "vi": "Cơ Xương Khớp"
        },
        "service": "CLINIC_APPOINTMENT",
        "incrementId": 8
      },
      {
        "name": {
          "vi": "Nhãn khoa"
        },
        "service": "CLINIC_APPOINTMENT",
        "incrementId": 9
      },
      {
        "name": {
          "vi": "Răng - Hàm - Mặt"
        },
        "service": "CLINIC_APPOINTMENT",
        "incrementId": 10
      },
      {
        "name": {
          "vi": "Ung bướu"
        },
        "service": "CLINIC_APPOINTMENT",
        "incrementId": 11
      },
      {
        "name": {
          "vi": "Dinh dưỡng"
        },
        "service": "CLINIC_APPOINTMENT",
        "incrementId": 12
      },
      {
        "name": {
          "vi": "Cử nhân nữ hộ sinh"
        },
        "service": "CLINIC_APPOINTMENT",
        "incrementId": 13
      },
      {
        "name": {
          "vi": "Nội tiết"
        },
        "service": "CLINIC_APPOINTMENT",
        "incrementId": 14
      },
      {
        "name": {
          "vi": "Thận - Tiết niệu"
        },
        "service": "CLINIC_APPOINTMENT",
        "incrementId": 15
      },
      {
        "name": {
          "vi": "Hô hấp"
        },
        "service": "CLINIC_APPOINTMENT",
        "incrementId": 16
      },
      {
        "name": {
          "vi": "Hiếm muộn - Vô sinh"
        },
        "service": "CLINIC_APPOINTMENT",
        "incrementId": 17
      },
      {
        "name": {
          "vi": "Chấn thương chỉnh hình - Cột sống"
        },
        "service": "CLINIC_APPOINTMENT",
        "incrementId": 18
      },
      {
        "name": {
          "vi": "Tâm thần"
        },
        "service": "CLINIC_APPOINTMENT",
        "incrementId": 19
      },
      {
        "name": {
          "vi": "Xét nghiệm"
        },
        "service": "CLINIC_APPOINTMENT",
        "incrementId": 20
      },
      {
        "name": {
          "vi": "Phụ khoa"
        },
        "service": "CLINIC_APPOINTMENT",
        "incrementId": 21
      },
      {
        "name": {
          "vi": "Huyết học - Truyền máu"
        },
        "service": "CLINIC_APPOINTMENT",
        "incrementId": 22
      },
      {
        "name": {
          "vi": "Dị ứng - Miễn dịch"
        },
        "service": "CLINIC_APPOINTMENT",
        "incrementId": 23
      },
      {
        "name": {
          "vi": "Điều Dưỡng"
        },
        "service": "CLINIC_APPOINTMENT",
        "incrementId": 24
      },
      {
        "name": {
          "vi": "Chăm Sóc Mẹ Và Bé"
        },
        "service": "DOCTOR_AT_HOME",
        "incrementId": 25
      },
      {
        "name": {
          "vi": "Chăm Sóc Người Bệnh"
        },
        "service": "DOCTOR_AT_HOME",
        "incrementId": 26
      },
      {
        "name": {
          "vi": "Chăm Sóc Người Già"
        },
        "service": "DOCTOR_AT_HOME",
        "incrementId": 27
      },
      {
        "name": {
          "vi": "Xét Nghiệm"
        },
        "service": "MEDICAL_TEST",
        "incrementId": 28
      },
    ]);

  },

  async down(db: any, client: any) {
    // TODO write the statements to rollback your migration (if possible)
    // Example:
    await db.collection('speciality').deleteMany({});
  }
};
