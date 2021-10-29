import { Types } from 'mongoose';
import makeQuery from '@app/core/database/query';
import { get } from 'lodash';
import OrderAbstractHandler from './order-handler.abstract';
import { ORDER_ACTIONS, ORDER_STATUS } from '../constant';
import OrderCollection from '../order.collection';
import { ValidationFailedError } from '@app/core/types/ErrorTypes';

class ShippingOrderHandler extends OrderAbstractHandler {
  // eslint-disable-next-line class-methods-use-this
  async handle(order: any, payload: any): Promise<void> {
    const { data, currentUser } = payload;
    await makeQuery(OrderCollection.findOneAndUpdate({
      orderNumber: get(order, 'orderNumber'),
    }, {
      $set: {
        status: ORDER_STATUS.SHIPPING,
        shippingInfo: data,
      },
      $push: {
        history: {
          action: ORDER_ACTIONS.SHIPPING,
          author: get(currentUser, 'fullName'),
          authorId: get(payload, 'userId'),
          message: 'Đã giao cho đơn vị vận chuyển',
          timestamp: new Date(),
          data: data,
        },
      },
    }).exec());

    return Promise.resolve(order);
  }

  async validate (order: any, payload: any) {
    const { data } = payload;
    if(!data || !data.shippingVendor || !data.shipperName) {
      throw new ValidationFailedError('Vui lòng nhập vào thông tin giao hàng.');
    }
    return Promise.resolve(true);
  }
}

export default ShippingOrderHandler;
