import { forEach } from "lodash";

module.exports = {
  async up(db: any, client: any) {
    // TODO write your migration here.
    // See https://github.com/seppevs/migrate-mongo/#creating-a-new-migration-script
    // Example:
    // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: true}});
    const group = await db.collection('role').insert(
      {
        name: 'Sytem Administrator',
        branchId: 99999,
        description: 'Sytem Administrator',
      });

    const user = await db.collection('user').insert(
      {
        "username": "danielpham",
        "email": "nguyen.pc@live.com",
        "password": "$2b$05$hu2IgeuXsHRcpNTyRWH.OOWBM1xthYAvEb..Qe/72uq6t/GTSoX6C",
        "branchId": 99999,
        "partnerId": 99999,
        "groups": [group.ops[0]._id],
        "fullName": "Nguyen Pham",
        "address": { "cityId": "48", "districtId": "490", "wardId": "20195", "street": "Da nang" },
        "phoneNumber": "0905500091",
        "avatar": "https://worldcare-dev.s3.us-west-1.amazonaws.com/clinic/39515d28-9cd9-44a9-a476-d447d5b88dbf.png"
      }
    );

    const resources = ['user', 'userGroup', 'partner', 'customer', 'tradingPartner'];
    const action = ['read', 'update', 'write', 'delete'];
    const permissions: any[] = [];
    forEach(resources, (res) => {
      forEach(action, (act) => {
        permissions.push({

          "p_type": "p",
          "v0": String(group.ops[0]._id),
          "v1": 99999,
          "v2": res,
          "v3": act,
        });
      })
    });

    await db.collection('casbin_rule').insertMany(permissions)
    await db.collection('casbin_rule').insertMany([
      { "p_type": "g", "v0": String(user.ops[0]._id), "v1": String(group.ops[0]._id), "v2": "99999" }
    ]);

},

  async down(db: any, client: any) {
  // TODO write the statements to rollback your migration (if possible)
  // Example:
  // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
  await db.collection('role').remove(
    {
      name: 'Sytem Administrator',
      branchId: 99999,
    });
  await db.collection('user').remove(
    {
      "username": "danielpham",
      "branchId": 99999,
    }
  );
  await db.collection('casbin_rule').remove(
    {
      "v1": 99999,
    }
  );


}
};
