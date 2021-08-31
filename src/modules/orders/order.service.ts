import makeQuery from '@app/core/database/query'
import { get } from 'lodash';
import CustomerCollection from '../customer/customer.collection';
import userService from '../user/user.service';
import { ORDER_ACTIONS, ORDER_STATUS } from './constant';
import OrderItemCollection from './order-item.collection';
import OrderCollection from './order.collection';
import PrescriptionCollection from './prescription.collection';

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
    branchId,
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
    branchId: companyId || branchId,
    status: (companyId || branchId) ? ORDER_STATUS.RECEIVED : ORDER_STATUS.NEW,
    history: [
      {
        action: ORDER_ACTIONS.CREATE,
        // authorId: get(payload, 'userId'),
        time: new Date(),
        // data: payload,
      }
    ]
  }

  return makeQuery(OrderCollection.create(createdOrder));
}


const findOrders = async (params: any, page: number, limit: number) => {
  const { status, branchId, startTime, endTime, sortBy, sortDirection, } = params;
  const sort: any = {};
  if(sortBy) {
    sort[sortBy] = sortDirection || -1;
  }
  const query: any = {};
  if(branchId) {
    query.branchId = branchId;
  }

  if(status) {
    query.status = status;
  }

  if(startTime) {
    query.createdAt = {
      $gte: startTime,
    };
  }

  if(endTime) {
    query.createdAt = {
      $lte: endTime,
    };
  }
  const orders = await makeQuery(OrderCollection.paginate(query, {
    populate: [{ path: 'shippingAddress' }, { path: 'shopInfo' }],
    page,
    limit,
    sort: sort
  }));

  return orders;
}

const findOrderDetail = async (query: any) => {
  const order = await makeQuery(OrderCollection.findOne(query, '', {
    populate: ['shippingAddress', 'prescription', 'shopInfo', 'items']
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
