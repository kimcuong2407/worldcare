import ShippingVendorCollection from './shipping-vendor.collection';

const createShippingVendor = async (shippingVendor: any, language = 'vi') => {
  const createdShippingVendor = await ShippingVendorCollection.create(shippingVendor);
  const data = await ShippingVendorCollection.findOne({_id: createdShippingVendor._id}).lean();
  return data;
}

const getShippingVendor = async () => {
  let data = await ShippingVendorCollection.find({}).sort({index: 1, createdAt: 1});
  return data;
};

const updateShippingVendorById = async (shippingVendorId: string, shippingVendor: any) => {
  const updatedShippingVendor = await ShippingVendorCollection.updateOne({_id: shippingVendorId}, {
    $set: {
      ...shippingVendor
    }
  });
  return ShippingVendorCollection.findById(shippingVendorId).lean();
}

const getShippingVendorById = async (shippingVendorId: string) => {
  const shippingVendor = await ShippingVendorCollection.findById(shippingVendorId);
  return shippingVendor;
}

const deleteShippingVendor = async (shippingVendorId: string) => {
  return ShippingVendorCollection.findByIdAndDelete(shippingVendorId)
}



export default {
  createShippingVendor,
  getShippingVendor,
  updateShippingVendorById,
  getShippingVendorById,
  deleteShippingVendor,
};
