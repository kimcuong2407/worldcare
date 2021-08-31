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
          'total': {
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
              '$total', {
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

    await OrderCollection.findOneAndUpdate({ orderNumber: get(order, 'orderNumber') }, {
      subTotal: subTotalPerItem,
      grandTotal: grandTotal,
    })
    return Promise.resolve(order);
  }

  async validate(order: any, payload: any) {
    return Promise.resolve(true);
  }
}

export default UpdateItemOrderHandler;
