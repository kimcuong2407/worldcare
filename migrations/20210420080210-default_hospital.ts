import UserCollection from '../src/modules/user/user.collection';
import bcryptUtil from '../src/utils/bcrypt.util';
module.exports = {
  async up(db: any, client: any) {
    // TODO write your migration here.
    // See https://github.com/seppevs/migrate-mongo/#creating-a-new-migration-script
    // Example:
    // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: true}});
    await db.collection('hospital').insertMany([
      {
        slug: 'phong-kham-thong-nhat',
        hospitalName: {
          vi: 'Phòng khám Đa khoa Thành công'
        },
        description: {
          vi: 'Phòng khám Đa khoa Thành công'
        },
        email: "pkthanhcong@gmail.com",
        phoneNumber: "(0236) 3825051",
        workingHours: [
          {
            weekDay: 0,
            isOpen: true,
            startTime: '08:00',
            endTime: '22:00',
          },
          {
            weekDay: 1,
            isOpen: true,
            startTime: '08:00',
            endTime: '22:00',
          },
          {
            weekDay: 2,
            isOpen: true,
            startTime: '08:00',
            endTime: '22:00',
          },
          {
            weekDay: 3,
            isOpen: true,
            startTime: '08:00',
            endTime: '22:00',
          },
          {
            weekDay: 4,
            isOpen: true,
            startTime: '08:00',
            endTime: '22:00',
          },
          {
            weekDay: 5,
            isOpen: true,
            startTime: '08:00',
            endTime: '22:00',
          },
          {
            weekDay: 6,
            isOpen: true,
            startTime: '08:00',
            endTime: '22:00',
          },
        ],
        address: {
          street: '245 Hoàng Diệu',
          ward: '20257',
          district: '492',
          city: '48'
        },
        speciality: ['607da1fe1fc9315254b537f7'],
        hospitalSettings: {
          slotTime: 30,
          capacityPerSlot: 2,
        },
        photos: [
          'http://congtyso.com/assets/images/clinics/clinic-gallery-image.png',
          'http://congtyso.com/assets/images/clinics/clinic-gallery-image.png'
        ],
        logo: 'http://congtyso.com/assets/images/logo-pk-2.png',
      },
    ]);
  },

  async down(db: any, client: any) {
    // TODO write the statements to rollback your migration (if possible)
    // Example:
    await db.collection('hospital').remove({slug: 'phong-kham-thong-nhat'});
  }
};
