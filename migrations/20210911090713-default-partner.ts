module.exports = {
  async up(db: any, client: any) {
    // TODO write your migration here.
    // See https://github.com/seppevs/migrate-mongo/#creating-a-new-migration-script
    // Example:
    // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: true}});
    await db.collection('partner').insertMany([
      {
        '_id': 99999,
        'name': 'World Care Vietnam',
        "description": "World Care Viet Nam",
        'email': 'info.worldhealthcare@gmail.com',
        'phoneNumber': '0912.747.362',
        "modules": ["PHARMACY"],
        "partnerCode": "worldcare",
        "address": { "cityId": "48", "districtId": "492", "wardId": "20257", "street": "245 Hoàng Diệu" },
        "logo": "https://worldcare-dev.s3.us-west-1.amazonaws.com/clinic/fbb612fc-0d00-4c2e-bf49-6c568a8ec70d.png",
      },
    ]);
    await db.collection('branch').insertMany([
      {
        "_id": 99999,
        "name": { "vi": "WorldCare VN HQ" },
        "description": { "vi": "Mô tả Phòng khám Đa khoa Thành công 2" },
        "services": [],
        "diseases": [],
        "modules": [],
        "speciality": [],
        "workingHours": [],
        "photos": [],
        "slug": "worldcare-vn",
        'email': 'info.worldhealthcare@gmail.com',
        'phoneNumber': '0912.747.362',

        "address": { "cityId": "48", "districtId": "492", "wardId": "20257", "street": "245 Hoàng Diệu" },
        "logo": "https://worldcare-dev.s3.us-west-1.amazonaws.com/clinic/fbb612fc-0d00-4c2e-bf49-6c568a8ec70d.png",
        "partnerId": 99999,
        "branchSettings": {}
      }
    ]);
  },

  async down(db: any, client: any) {
    // TODO write the statements to rollback your migration (if possible)
    // Example:
    await db.collection('partner').remove({ _id: 99999 });
    await db.collection('branch').remove({ _id: 99999 });
  }
};
