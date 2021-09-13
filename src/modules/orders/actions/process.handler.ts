import { Types } from 'mongoose';
import makeQuery from '@app/core/database/query';
import { get } from 'lodash';
import OrderAbstractHandler from './order-handler.abstract';
import { ORDER_ACTIONS, ORDER_STATUS } from '../constant';
import OrderCollection from '../order.collection';
import { ValidationFailedError } from '@app/core/types/ErrorTypes';
import OrderItemCollection from '../order-item.collection';
import zalo from '@app/core/zalo';

class ProcessOrderHandler extends OrderAbstractHandler {
  // eslint-disable-next-line class-methods-use-this
  async handle(order: any, payload: any): Promise<void> {
    const { data, currentUser } = payload;

    await makeQuery(OrderCollection.findOneAndUpdate({
      orderNumber: get(order, 'orderNumber'),
    }, {
      $set: {
        status: ORDER_STATUS.PROCESSED,
      },
      $push: {
        history: {
          action: ORDER_ACTIONS.PROCESS,
          author: get(currentUser, 'fullName'),
          authorId: get(payload, 'userId'),
          timestamp: new Date(),
          message: 'Đơn hàng đã được xử lý',
          data: get(payload, 'data'),
        },
      },
    }).exec());
    await zalo.sendZaloMessage(`[Đã Xử Lý] Đơn hàng đã được nhà thuốc xử lý xong: ${get(order, 'orderNumber')}`);

    return Promise.resolve(order);
  }

  async validate (order: any, payload: any) {
    const lineItemsCount = await OrderItemCollection.count({orderNumber: get(order, 'orderNumber'),});
    if(lineItemsCount <= 0) {
      throw new ValidationFailedError('Vui lòng nhập vào sản phẩm trong đơn hàng trước.')
    }
    return Promise.resolve(true);
  }
}

export default ProcessOrderHandler;
