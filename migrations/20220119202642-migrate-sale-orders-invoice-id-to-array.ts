module.exports = {
  async up(db: any, client: any) {
    await db.collection('sale_order')
      .updateMany({
        invoiceId: {
          $ne: null
        }
      }, [
        {$set: {invoiceIds: ["$invoiceId"]}}
      ]);
  },

  async down(db: any, client: any) {
    await db.collection('sale_order')
      .updateMany({
        invoiceIds: {
          $ne: null
        }
      }, [
        {$unset: ["invoiceIds"]}
      ]);
  }
};
