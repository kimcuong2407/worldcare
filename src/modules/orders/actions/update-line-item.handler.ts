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
    const { data, currentUser } = payload;
    const { item } = data;
    const id = get(item, '_id');
    const isDeleted = get(item, 'isDeleted', false);
    const query: any = {};

    if (id) {
      query._id = Types.ObjectId(id)

      if (isDeleted) {
        await makeQuery(OrderItemCollection.deleteOne(query).exec());
      } else {
        await makeQuery(OrderItemCollection.updateOne(query, {
          ...item,
          orderNumber: get(order, 'orderNumber'),
        }, { upsert: true }).exec());
      }

    } else {
      await makeQuery(OrderItemCollection.create({
        ...item,
        orderNumber: get(order, 'orderNumber'),
      }));
    }
    const aggLineItem = await OrderItemCollection.aggregate([
      {
        '$match': {
          'orderNumber': get(order, 'orderNumber')
        }
      }, {
        '$lookup': {
          'from': 'order_item',
          'localField': 'orderNumber',
          'foreignField': 'orderNumber',
          'as': 'items'
        }
      }, {
        '$addFields': {
          'subTotal': {
            '$sum': {
              '$map': {
                'input': '$items',
                'as': 'item',
                'in': {
                  '$multiply': [
                    {
                      '$ifNull': [
                        '$$item.saleQuantity', 0
                      ]
                    }, {
                      '$ifNull': [
                        '$$item.price', 0
                      ]
                    }
                  ]
                }
              }
            }
          }
        }
      }, {
        '$addFields': {
          'grandTotal': {
            '$sum': [
              '$subTotal', {
                '$ifNull': [
                  '$shippingFee', 0
                ]
              }, {
                '$ifNull': [
                  '$serviceFee', 0
                ]
              }
            ]
          }
        }
      }, {
        '$project': {
          'grandTotal': 1,
          'subTotal': 1
        }
      }
    ]).exec();
    const subTotalPerItem = get(aggLineItem, '0.subTotal');
    const grandTotal = get(aggLineItem, '0.grandTotal');

    await OrderCollection.findOneAndUpdate({
      orderNumber: get(order, 'orderNumber')
    }, {
      $set: {
        subTotal: subTotalPerItem,
        grandTotal: grandTotal,
      },
      $push: {
        history: {
          action: ORDER_ACTIONS.UPDATE_LINE_ITEM,
          author: get(currentUser, 'fullName'),
          authorId: get(payload, 'userId'),
          message: 'Đã cập nhật sản phẩm trong đơn hàng',
          timestamp: new Date(),
          data: data,
        },
      },
    })
    return Promise.resolve(order);
  }

  async validate(order: any, payload: any) {
    return Promise.resolve(true);
  }
}

export default UpdateItemOrderHandler;
