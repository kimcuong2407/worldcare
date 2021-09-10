import makeQuery from '@app/core/database/query'
import { find, get, toLower } from 'lodash';
import moment from 'moment';
import CustomerCollection from '../customer/customer.collection';
import userService from '../user/user.service';
import { ORDER_ACTIONS, ORDER_STATUS } from './constant';
import OrderItemCollection from './order-item.collection';
import OrderCollection from './order.collection';
import PrescriptionCollection from './prescription.collection';
import mongoose from 'mongoose';
import CouponCollection from '../coupon/coupon.collection';
import couponService from '../coupon/coupon.service';
import { ValidationFailedError } from '@app/core/types/ErrorTypes';
import branchService from '../branch/branch.service';

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

const findCustomer = async (userId: string, partnerId: number, branchId: number, phoneNumber: string, fullName: string) => {
  let customerInfo = null;
  if (userId) {
    customerInfo = await CustomerCollection.findOne({ userId, partnerId, branchId }).lean().exec();
  }

  if (!userId) {
    customerInfo = await CustomerCollection.findOne({ phoneNumber, fullName: fullName }).lean().exec();
  }

  if (!customerInfo) {
    customerInfo = await CustomerCollection.create({ userId, partnerId, branchId, phoneNumber, fullName }, { new: true });
  }

  return customerInfo;
}

const calculateDiscount = async(order: any) => {
  const { couponCode, shippingFee, subTotal } = order;
  const coupon: any = await couponService.findOneCoupon({code: toLower(couponCode)});

  if(!coupon) {
    return 0;
  }
  const { discountPercent, maxDiscount, discountValue } = coupon;
  let discountAmount = 0;
  if(get(coupon, 'isFreeShipping')) {
    const maxShippingDiscount = get(coupon, 'maxShippingDiscount') ;
    if(maxShippingDiscount) {
      return (maxShippingDiscount - shippingFee) > 0 ? shippingFee : maxShippingDiscount;
    }
  }
  
  if(discountPercent) {
    discountAmount = (Math.round((subTotal/discountPercent) * 1e2) / 1e2)
  }
  if(discountValue) {
    discountAmount = discountValue;
  }
  if(maxDiscount) {
    discountAmount = Math.min(discountAmount, maxDiscount);
  }
  return discountAmount;
};

const createOrder = async (order: any) => {
  const {
    address,
    prescriptionId,
    companyId,
    branchId,
    couponCode,
    customerNote,
  } = order;
  let addressId = get(order, 'addressId', null);
  let userId = get(order, 'userId', null);
  let customer = null;
  if (branchId) {
    const branch = await branchService.findBranchById(branchId);
    customer = await findCustomer(
      userId,
      get(branch, 'partnerId'),
      branchId,
      get(address, 'phoneNumber'),
      get(address, 'fullName'),
    )
  }
  if (!addressId) {
    let newAddress = await userService.addNewAddress(address);
    addressId = get(newAddress, '_id');
  }

  const session = await mongoose.startSession();

  let requestOrder = {
    prescriptionId,
    userId,
    shippingAddressId: addressId,
    customerId: get(customer, '_id'),
    branchId: companyId || branchId,
    status: (companyId || branchId) ? ORDER_STATUS.RECEIVED : ORDER_STATUS.NEW,
    couponCode,
    history: [
      {
        action: ORDER_ACTIONS.CREATE,
        // authorId: get(payload, 'userId'),
        timestamp: new Date(),
        message: 'Đơn hàng đã được tạo thành công',
        // data: payload,
      }
    ],
    customerNote,
  }
  if (couponCode) {
    const updated = await CouponCollection.updateOne({
      code: toLower(couponCode),
      startTime: {
        $lte: new Date(),
      },
      endTime: {
        $gte: new Date(),
      },
      $or: [
        {
          $where: '!this.usageCount || (this.usageCount < this.maxUsage)',
        },
        {
          maxUsage: null,
        }
      ]
    }, { $inc: { usageCount: 1 } }, { session })
    if (!updated.nModified) {
      session.abortTransaction();
      throw new ValidationFailedError('Mã giảm giá không tồn tại hoặc đã hết lượt sử dụng.')
    }
  }
  const createdOrder = await OrderCollection.create(requestOrder);
  session.endSession();
  return createdOrder;
}


const findOrders = async (params: any, page: number, limit: number) => {
  const { status, branchId, startTime, endTime, sortBy, sortDirection, keyword, userId } = params;
  const sort: any = {};
  if (sortBy) {
    sort[sortBy] = sortDirection || -1;
  }
  const query: any = {};
  if (userId) {
    query.userId = userId;
  }
  if (branchId) {
    query.branchId = branchId;
  }

  if (keyword) {
    query.orderNumber = keyword;
  }

  if (status) {
    query.status = status;
  }

  const time = [];
  if (startTime) {
    time.push({
      createdAt: { $gte: moment(startTime, 'YYYY-MM-DD').toDate(), }
    });
  }

  if (endTime) {
    time.push({
      createdAt: { $lte: moment(endTime, 'YYYY-MM-DD').toDate(), }
    });
  }
  if (time && time.length > 0) {
    query['$and'] = time;
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

const getMonthlyReport = async (branchId?: number) => {
  const query: any = {
    createdAt: {
      $gte: moment().subtract(11, 'month').startOf('month').toDate(),
    },
    status: ORDER_STATUS.DELIVERED,
  };
  if (branchId) {
    query.branchId = branchId;
  }

  const aggregation = [
    {
      '$match': query
    }, {
      '$group': {
        '_id': {
          'month': {
            '$month': '$createdAt'
          },
          'year': {
            '$year': '$createdAt'
          }
        },
        'count': {
          '$sum': 1
        },
        'total': {
          '$sum': '$grandTotal'
        }
      }
    }, {
      '$addFields': {
        'month': {
          '$concat': [
            {
              '$toString': '$_id.month'
            }, '-', {
              '$toString': '$_id.year'
            }
          ]
        }
      }
    }, {
      '$project': {
        '_id': 0
      }
    }
  ];
  const last12Months = Array.apply(0, Array(12)).map((_, i) => { return moment().subtract('month', i).format('M-YYYY') });

  const reports = await OrderCollection.aggregate(aggregation).exec();
  return last12Months.map((month: string) => {
    const report = (find(reports, (report) => report.month === month) || {});
    return {
      totalSale: get(report, 'count', 0),
      totalAmount: get(report, 'total', 0),
      month,
    }
  });
}


const getLast7DaysReport = async (branchId?: number) => {
  const query: any = {
    createdAt: {
      $gte: moment().subtract(6, 'day').startOf('day').toDate(),
    },
    status: ORDER_STATUS.DELIVERED,
  };
  if (branchId) {
    query.branchId = branchId;
  }

  const aggregation = [
    {
      '$match': query
    }, {
      '$sort': {
        'createdAt': -1
      }
    }, {
      '$group': {
        '_id': {
          'date': {
            '$dateToString': {
              'format': '%d-%m-%Y',
              'date': '$createdAt'
            }
          }
        },
        'count': {
          '$sum': 1
        },
        'total': {
          '$sum': '$grandTotal'
        }
      }
    }, {
      '$addFields': {
        'date': '$_id.date'
      }
    }, {
      '$project': {
        '_id': 0
      }
    }
  ];
  const last7Days = Array.apply(0, Array(7)).map((_, i) => { return moment().subtract('day', i).format('DD-MM-YYYY') });

  const reports = await OrderCollection.aggregate(aggregation).exec();
  return last7Days.map((date: string) => {
    const report = (find(reports, (report) => report.date === date) || {});
    return {
      totalSale: get(report, 'count', 0),
      totalAmount: get(report, 'total', 0),
      date,
    }
  });
}


const calculateWeeRevenueAndOrders = async (branchId?: number, startTime?: Date, endTime?: Date)=> {
  const query: any = {
    status: ORDER_STATUS.DELIVERED,
  };
  if(branchId) {
    query.branchId = branchId;
  }
  if(startTime) {
    query.createdAt = {
      $gte: startTime,
    }
  }
  if(endTime) {
    query.createdAt = {
      $lte: endTime,
    }
  }
  const aggregation = [
    {
      '$match': query
    }, 
      {
        '$group': {
          '_id': 1, 
          'totalRevenue': {
            '$sum': '$grandTotal'
          }, 
          'totalOrder': {
            '$sum': 1
          }
        }
      }, {
        '$project': {
          '_id': 0
        }
      }
    ];
    

  const reports = await OrderCollection.aggregate(aggregation).exec();
  return reports[0];
}
const calculateWeeklyRevenueAndOrders = async (branchId?: number, startTime?: Date, endTime?: Date) => {
  const query: any = {
    status: ORDER_STATUS.DELIVERED,
  };
  if (branchId) {
    query.branchId = branchId;
  }
  if (startTime) {
    query.createdAt = {
      $gte: startTime,
    }
  }
  if (endTime) {
    query.createdAt = {
      $lte: endTime,
    }
  }
  console.log(query)

  const aggregation = [
    {
      '$match': query
    },
      {
        '$sort': {
          'createdAt': -1
        }
      }, {
        '$group': {
          '_id': {
            'week': {
              '$week': '$createdAt'
            }
          },
          'totalRevenue': {
            '$sum': '$grandTotal'
          },
          'totalOrder': {
            '$sum': 1
          }
        }
      }, {
        '$addFields': {
          'week': '$_id.week'
        }
      }, {
        '$project': {
          '_id': 0
        }
      }
    ];

  const reports = await OrderCollection.aggregate(aggregation).exec();
  return reports;
}

const getOverviewReport = async (branchId: number) => {
  const allTimeReport = await calculateWeeRevenueAndOrders(branchId);
  const weekReport = await calculateWeeklyRevenueAndOrders(branchId,
    moment().subtract(1, 'week').startOf('week').toDate())
  const lastWeek = moment().subtract(1, 'week').format('W');
  const thisWeek = moment().format('W');
  const lastWeekReport = find(weekReport, ({week}) => week === +lastWeek);
  const thisWeekReport = find(weekReport, ({week}) => week === +thisWeek);
  return {
    allTimeReport,
    lastWeekReport,
    thisWeekReport: {
      ...thisWeekReport,
      orderChange: Math.floor(((get(thisWeekReport, 'totalOrder',0)-get(lastWeekReport, 'totalOrder',0))/get(lastWeekReport, 'totalOrder',0))*100),
      revenueChange: Math.floor(((get(thisWeekReport, 'totalRevenue',0)-get(lastWeekReport, 'totalRevenue',0))/get(lastWeekReport, 'totalRevenue',0))*100)
    },
  }
}
export default {
  createPrescription,
  createOrder,
  updatePrescription,
  findOrders,
  findOrderDetail,
  getMonthlyReport,
  getLast7DaysReport,
  getOverviewReport,
  calculateDiscount,
}
