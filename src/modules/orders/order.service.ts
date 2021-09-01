import makeQuery from '@app/core/database/query'
import { get } from 'lodash';
import moment from 'moment';
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
        timestamp: new Date(),
        // data: payload,
      }
    ]
  }

  return makeQuery(OrderCollection.create(createdOrder));
}


const findOrders = async (params: any, page: number, limit: number) => {
  const { status, branchId, startTime, endTime, sortBy, sortDirection, keyword, } = params;
  const sort: any = {};
  if(sortBy) {
    sort[sortBy] = sortDirection || -1;
  }
  const query: any = {};
  if(branchId) {
    query.branchId = branchId;
  }

  if (keyword) {
    query.orderNumber = keyword;
  }

  if(status) {
    query.status = status;
  }

  const time = [];
  if(startTime) {
    time.push({
      createdAt: { $gte: moment(startTime, 'YYYY-MM-DD').toDate(), }
    });
  }

  if(endTime) {
    time.push({
      createdAt: { $lte: moment(endTime, 'YYYY-MM-DD').toDate(), }
    });
  }
  if(time && time.length > 0) {
    query['$and'] = time;
  }
  console.log(JSON.stringify(query));
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
