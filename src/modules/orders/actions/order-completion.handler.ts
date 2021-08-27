import { Types } from 'mongoose';
import makeQuery from '@app/core/database/query';
import { get } from 'lodash';
import OrderAbstractHandler from './order-handler.abstract';
import { ORDER_ACTIONS, ORDER_STATUS } from '../constant';
import OrderCollection from '../order.collection';
import { ValidationFailedError } from '@app/core/types/ErrorTypes';

class CompleteOrderHandler extends OrderAbstractHandler {
  // eslint-disable-next-line class-methods-use-this
  async handle(order: any, payload: any): Promise<void> {
    await makeQuery(OrderCollection.findOneAndUpdate({
      orderNumber: get(order, 'orderNumber'),
    }, {
      $set: {
        status: ORDER_STATUS.DELIVERED,
      },
      $push: {
        histories: {
          action: ORDER_ACTIONS.ORDER_COMPLETION,
          authorId: get(payload, 'userId'),
          time: new Date(),
          data: payload,
        },
      },
    }).exec());

    return Promise.resolve(order);
  }

  async validate (order: any, payload: any) {
    return Promise.resolve(true);
  }
}

export default CompleteOrderHandler;
