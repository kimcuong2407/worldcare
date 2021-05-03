import UserCollection from '../src/modules/user/user.collection';
import bcryptUtil from '../src/utils/bcrypt.util';
module.exports = {
    async up(db: any, client: any) {
        console.log(process.env.MONGO_URL)
        // TODO write your migration here.
        // See https://github.com/seppevs/migrate-mongo/#creating-a-new-migration-script
        // Example:
        // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: true}});
        const inserted = await db.collection('service').insertMany([
            {
                "name": {
                    "vi": "Khám Tại Phòng Khám"
                },
                serviceType: 'CLINIC_APPOINTMENT',
                "slug": "kham-tai-phong-kham",
            },
            {
                "name": {
                    "vi": "Điều dưỡng tại nhà",
                    "en": "Doctor at Home"
                },
                serviceType: 'DOCTOR_AT_HOME',
                "slug": "dieu-duong-tai-nha",
            },
            {
                "name": {
                    "vi": "Xét Nghiệm",
                },
                serviceType: 'MEDICAL_TEST',
                "slug": "xet-nghiem",
            },
        ]);
        console.log(inserted)
    },

    async down(db: any, client: any) {
        // TODO write the statements to rollback your migration (if possible)
        // Example:
        await db.collection('service').deleteMany({});
    }
};
