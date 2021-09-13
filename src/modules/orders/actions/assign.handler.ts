import { Types } from 'mongoose';
import makeQuery from '@app/core/database/query';
import { get } from 'lodash';
import OrderAbstractHandler from './order-handler.abstract';
import { ORDER_ACTIONS, ORDER_STATUS } from '../constant';
import OrderCollection from '../order.collection';
import { ValidationFailedError } from '@app/core/types/ErrorTypes';
import branchService from '@app/modules/branch/branch.service';
import zalo from '@app/core/zalo';

class AssignOrderHandler extends OrderAbstractHandler {
  // eslint-disable-next-line class-methods-use-this
  async handle(order: any, payload: any): Promise<void> {
    const { data, currentUser } = payload;
    const { branchId } = data;
    const branch = await branchService.findBranchById(branchId);
    await makeQuery(OrderCollection.findOneAndUpdate({
      orderNumber: get(order, 'orderNumber'),
    }, {
      $set: {
        status: ORDER_STATUS.RECEIVED,
        branchId: branchId,
      },
      $push: {
        history: {
          action: ORDER_ACTIONS.ASSIGN,
          authorId: get(payload, 'userId'),
          author: get(currentUser, 'fullName'),
          timestamp: new Date(),
          message: `Đơn hàng #${get(order, 'orderNumber')} đã được giao cho nhà thuốc ${get(branch, 'name')}`,
          data: {
            ...get(payload, 'data'),
            pharmacy: get('name.vi'),
          },
        },
      },
    }).exec());
    await zalo.sendZaloMessage(`[Đã Giao Cho Nhà Thuốc] Đơn hàng #${get(order, 'orderNumber')} đã được giao cho nhà thuốc ${get(branch, 'name')} - bởi ${get(currentUser, 'fullName')}`);

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
