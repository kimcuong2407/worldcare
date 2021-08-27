import { Types } from 'mongoose';
import makeQuery from '@app/core/database/query';
import { get } from 'lodash';
import OrderAbstractHandler from './order-handler.abstract';
import { ORDER_ACTIONS, ORDER_STATUS } from '../constant';
import OrderCollection from '../order.collection';
import { ValidationFailedError } from '@app/core/types/ErrorTypes';

class AssignOrderHandler extends OrderAbstractHandler {
  // eslint-disable-next-line class-methods-use-this
  async handle(order: any, payload: any): Promise<void> {
    const { data } = payload;
    const { branchId } = data;
    await makeQuery(OrderCollection.findOneAndUpdate({
      orderNumber: get(order, 'orderNumber'),
    }, {
      $set: {
        status: ORDER_STATUS.RECEIVED,
        branchId: branchId,
      },
      $push: {
        histories: {
          action: ORDER_ACTIONS.ASSIGN,
          authorId: get(payload, 'userId'),
          time: new Date(),
          data: payload,
        },
      },
    }).exec());

    return Promise.resolve(order);
  }

  async validate (order: any, payload: any) {
    const { data } = payload;
    const { branchId } = data || {};
    if(!branchId) {
      throw new ValidationFailedError('Vui lòng chọn branchId');
    }
    return Promise.resolve(true);
  }
}

export default AssignOrderHandler;
