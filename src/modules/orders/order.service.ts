import makeQuery from '@app/core/database/query'
import { get } from 'lodash';
import CustomerCollection from '../appointment/customer.collection';
import userService from '../user/user.service';
import OrderCollection from './order.collection';
import PrescriptionCollection from './prescription.collection'

const createPrescription = async (fileId: string) => {
  return makeQuery(PrescriptionCollection.create({
    images: [fileId]
  }));
}

const updatePrescription = async (prescriptionId: string, orderNumer: string) => {
  return makeQuery(PrescriptionCollection.findByIdAndUpdate(prescriptionId, {
    orderNumer,
  }).exec());
};

const createOrder = async (order: any) => {
  const {
    address,
    prescriptionId,
    companyId,
  } = order;
  let addressId = get(order, 'addressId', null);
  let userId = get(order, 'userId', null);
  let customerId = '';

  if (!userId) {
    const { phoneNumber, fullName } = address;
    const customerInfo = await CustomerCollection.findOneAndUpdate(
      { phoneNumber, name: fullName },
      { upsert: true, new: true }).exec();
    customerId = get(customerInfo, '_id');
    let newAddress = await userService.addNewAddress(address);
    addressId = get(newAddress, '_id');
  }

  let createdOrder = {
    prescriptionId,
    userId,
    shippingAddressId: addressId,
    customerId,
    companyId,
  }

  return makeQuery(OrderCollection.create(createdOrder));
}


const findOrders = async (query: any, page: number, limit: number) => {
  const orders = await makeQuery(OrderCollection.paginate(query, {
    populate: [{ path: 'shippingAddress' }, { path: 'shopInfo' }],
    page,
    limit,
  }));

  return orders;
}

const findOrderDetail = async (query: any) => {
  const order = await makeQuery(OrderCollection.findOne(query, '', {
    populate: ['shippingAddress', 'prescription', 'shopInfo']
  }));

  return order;
}
export default {
  createPrescription,
  createOrder,
  updatePrescription,
  findOrders,
  findOrderDetail,
}
