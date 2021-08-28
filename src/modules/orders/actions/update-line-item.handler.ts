import { Types } from 'mongoose';
import makeQuery from '@app/core/database/query';
import { get } from 'lodash';
import OrderAbstractHandler from './order-handler.abstract';
import { ORDER_ACTIONS, ORDER_STATUS } from '../constant';
import OrderCollection from '../order.collection';
import { ValidationFailedError } from '@app/core/types/ErrorTypes';
import OrderItemCollection from '../order-item.collection';

class UpdateItemOrderHandler extends OrderAbstractHandler {
  // eslint-disable-next-line class-methods-use-this
  async handle(order: any, payload: any): Promise<void> {
    const { data } = payload;
    const { item } = data;
    const id = get(item, '_id');
    const isDeleted = get(item, 'isDeleted', false);
    const query: any = {};

    if (isDeleted) {
      await makeQuery(OrderItemCollection.deleteOne(query).exec());
    } else if (id) {
      query._id = Types.ObjectId(id)

      await makeQuery(OrderItemCollection.updateOne(query, {
        ...item,
        orderNumber: get(order, 'orderNumber'),
      }, { upsert: true }).exec());
    } else {
      await makeQuery(OrderItemCollection.create({
        ...item,
        orderNumber: get(order, 'orderNumber'),
      }));
    }
    const aggLineItem = await OrderItemCollection.aggregate([
      {
        $match: { orderNumber: Number(get(order, 'orderNumber')) }
      },
      {
        '$addFields': {
          'subTotalPerItem': {
            '$multiply': [
              '$price', '$saleQuantity'
            ]
          }
        }
      }, {
        '$group': {
          '_id': '$orderNumber',
          'subTotal': {
            '$sum': '$subTotalPerItem'
          }
        }
      }
    ]);
    const subTotalPerItem = get(aggLineItem, '0.subTotalPerItem');

    await OrderCollection.findOneAndUpdate({ orderNumber: get(order, 'orderNumber') }, {
      subTotal: subTotalPerItem,
    })
    return Promise.resolve(order);
  }

  async validate(order: any, payload: any) {
    return Promise.resolve(true);
  }
}

export default UpdateItemOrderHandler;
