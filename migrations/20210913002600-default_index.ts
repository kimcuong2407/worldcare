module.exports = {
  async up(db: any) {
    // TODO write your migration here.
    // See https://github.com/seppevs/migrate-mongo/#creating-a-new-migration-script
    // Example:
    // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: true}});
    db.collection('employee').createIndex( { "firstName": "text","lastName":"text" , "phoneNumber": "text", "email":"text"} )


  },

  async down(db: any) {
    // TODO write the statements to rollback your migration (if possible)
    // Example:
    // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
    db.collection('employee').removeIndex( { "firstName": "text","lastName":"text" , "phoneNumber": "text", "email":"text"} )

  }
};
