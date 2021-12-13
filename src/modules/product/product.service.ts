import {InternalServerError} from '@app/core/types/ErrorTypes';
import get from 'lodash/get';
import omitBy from 'lodash/omitBy'
import isNil from 'lodash/isNil';
import { PRODUCT_CODE_PREFIX, PRODUCT_CODE_SEQUENCE, PRODUCT_STATUS, PRODUCT_VARIANT_STATUS, VARIANT_CODE_PREFIX, VARIANT_CODE_SEQUENCE } from './constant';
import ProductCollection from './product.collection';
import ProductVariantCollection from './productVariant.collection';
import { forEach, map, omit, reduce, size, union, unionBy, uniq } from 'lodash';
import appUtil from '@app/utils/app.util';
import Bluebird from 'bluebird';
import MedicineCollection from './medicine.collection';
import LotCollection from '@modules/batch/batch.collection';
import BatchCollection from '@modules/batch/batch.collection';
import { query } from 'winston';
import SaleOrderCollection from '../sale-orders/sale-order.collection';
import InventoryTransactionCollection from '../inventory-transaction/inventory-transaction.collection';
import { ORDER_STATUS } from '../orders/constant';
import { INVENTORY_TRANSACTION_TYPE } from '../inventory-transaction/constant';

// @Tuan.NG:> setup code sequence

const initIdSquence = (idSequence: number) => {
  let s = '000000000' + idSequence;
  return s.substr(s.length - 6);
}

const productAutoIncrease = (record: any, productVariants: any) => {
  record.setNext('product_id_sequence', async (err: any, record: any) => {
    if(err) {
      return new InternalServerError('Failed to increase ID.');
    }
    const increasedId = `PRODUCT${initIdSquence(record.idSequence)}`
    const doc = await ProductCollection.findOne({increasedId}).exec();
    if(!isNil(doc)) productAutoIncrease(record, productVariants);
    record.productId = increasedId;
    record.save();
    
    Bluebird.map(productVariants, async (detail: any) => await createVariant({ productId: increasedId, ...detail}));
  });
}

const persistProduct = async (info: any) => {
  const productId = get(info, 'productId', null);
  const product = await ProductCollection.create(omitBy(info, 'productVariants'));
  const productVariants = get(info, 'productVariants');
  if (isNil(productId)) {
    productAutoIncrease(product, productVariants);
  } else {
    Bluebird.map(productVariants, async (detail: any) => await createVariant({ productId, ...detail}));
  }

  return {
    ...get(product, '_doc', {})
  }
}

const createProduct = async (info: any) => {
  info.status = PRODUCT_STATUS.ACTIVE;
  const product = await persistProduct(info);

  return {
    ...product,
  }
}

const fetchProductList = async (query: any, language = 'vi', isRaw = false) => {
  const data = await ProductCollection.find(query).lean().exec();
  if (isRaw) {
    return data;
  }
  return map(data, (d) => appUtil.mapLanguage(d, language));
};

const fetchProductInfo = async (query: any, language = 'vi', isRaw = false) => {
  const data = await ProductCollection.findOne(query).lean().exec();
  if (isRaw) {
    return data;
  }
  return appUtil.mapLanguage(data, language);
};

const updateProduct = async (query: any, info: any) => {
  const productVariants = get(info, 'productVariants');
  const record = await ProductCollection.findOneAndUpdate( query, info, {new: true}).lean().exec();
  const variants = await updateVariants(productVariants);
  const {createdAt, updatedAt, ...rest} = record;
  return {
    ...rest,
    variants,
    createdAt: new Date(createdAt).getTime(),
    updatedAt: new Date(updatedAt).getTime(),
  };
};

const deleteProduct = async (query: any) => {
  await ProductCollection.findOneAndUpdate(query, {deletedAt: new Date(), status: PRODUCT_STATUS.INACTIVE});

  return true;
};

// Variant
const variantAutoIncrease = (record: any) => {
  record.setNext('variant_id_sequence', async (err: any, record: any) => {
    if(err) {
      return new InternalServerError('Failed to increase ID.');
    }
    const increasedId = `SP${initIdSquence(record.idSequence)}`
    const doc = await ProductVariantCollection.findOne({increasedId}).lean().exec();
    if(!isNil(doc)) variantAutoIncrease(record);
    record.variantId = increasedId;
    record.save();
  });
}

const persistProductVariant = async (info: any) => {
  const variantId = get(info, 'variantId', null);
  const variant = await ProductVariantCollection.create(info);
  if (isNil(variantId)) {
    variantAutoIncrease(variant);
  }

  return {
    ...get(variant, '_doc', {})
  }
}

const createVariant = async (info: any) => {
  info.status = PRODUCT_STATUS.ACTIVE;
  return await persistProductVariant(info);
};

const createVariants = async (info: any) => {
  const bulkQuery = await Bluebird.map(info, (v: object) => {
    const data = omitBy(v, isNil);
    return {
      insertOne: {
        document: {
          ...data
        }
      }
  }});
  const created = await ProductVariantCollection.bulkWrite(bulkQuery);
  const recordIds = created.insertedIds

  return await ProductVariantCollection.find({ variantId: { $in: Object.values(recordIds)}}).lean().exec();
};

const updateVariants = async (info: any) => {
  const bulkQuery = await Bluebird.map(info, (v: object) => {
    const variantId = get(v, 'variantId');
    const data = omit(v, 'variantId');
    return {
      updateMany: {
        filter: {
          variantId
        },
        update: {
          $set: data ,
        }
      }
  }});
  const s = await ProductVariantCollection.bulkWrite(bulkQuery);
  return await ProductVariantCollection.find({ variantId: { $in: await Bluebird.map(info, (v) => get(v, 'variantId'))}});
};

const fetchProductVariantList = async (params: any, language='vi') => {
  const { keyword, branchId } = params;
  const query: any = {
    branchId,
    deletedAt: null,
  };
  if (keyword) {
    query['$text'] = { $search: keyword }
  }
  const aggregate = [
    {
      $match: query,
    },
    {
      $lookup: {
        from: 'product_variant',
        let: {
          productId: '$productId',
          status: 'ACTIVE'
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  {
                    $eq: [
                      '$productId', '$$productId'
                    ]
                  },
                  {
                    $eq: [
                      '$status', '$$status'
                    ]
                  }
                ]
              }
            }
          }
        ],
        as: 'productVariants'
      }
    }
  ];
  const list = await ProductCollection.aggregate(aggregate).exec();
  return list;
};

const searchMedicines = (keyword: string) => {
  return MedicineCollection.find({
    $text: {
      $search: keyword
    },
    
  }, {'score': {'$meta': 'textScore'}}).sort({score:{$meta:'textScore'}}).limit(10).lean().exec();
}

// VARIANT V2
const variantAutoIncreaseV2 = (record: any) => {
  record.setNext(VARIANT_CODE_SEQUENCE, async (err: any, record: any) => {
    if(err) {
      return new InternalServerError('Failed to increase Code.');
    }
    const variantCode = `${VARIANT_CODE_PREFIX}${initIdSquence(record.codeSequence)}`
    const doc = await ProductVariantCollection.findOne({variantCode}).lean().exec();
    if(!isNil(doc)) variantAutoIncreaseV2(record);
    record.variantCode = variantCode;
    record.save();
  });
}

const persistProductVariantV2 = async (info: any) => {
  const variantCode = get(info, 'variantCode', null);
  const _id = get(info, '_id', null);
  const variant = isNil(_id) ? 
  await ProductVariantCollection.create(info) : 
  await ProductVariantCollection.findOneAndUpdate({ _id }, info);
  if (isNil(variantCode)) {
    variantAutoIncreaseV2(variant);
  }

  return {
    ...get(variant, '_doc', {})
  }
}

const createVariantV2 = async (info: any) => {
  return await persistProductVariantV2(info);
};

// PRODUCT V2
const productAutoIncreaseV2 = (record: any, productVariants: any) => {
  record.setNext(PRODUCT_CODE_SEQUENCE, async (err: any, record: any) => {
    if(err) {
      return new InternalServerError('Failed to increase Code.');
    }
    const productCode = `${PRODUCT_CODE_PREFIX}${initIdSquence(record.codeSequence)}`
    const doc = await ProductCollection.findOne({productCode}).lean().exec();
    if(!isNil(doc)) productAutoIncreaseV2(record, productVariants);
    record.productCode = productCode;
    record.save();
    
    Bluebird.map(productVariants, async (detail: any) => await createVariantV2({ productId: get(record, '_id'), ...detail}));
  });
}

const persistProductV2 = async (info: any) => {
  const productVariants = get(info, 'productVariants');
  const productCode = get(info, 'productCode');
  const product = await ProductCollection.create(omit(info, 'productVariants'));
  const productId = get(product, '_id');
  if (isNil(productCode)) {
    productAutoIncreaseV2(product, productVariants);
  } else {
    Bluebird.map(productVariants, async (detail: any) => await createVariantV2({ productId, ...detail}));
  }
  const temp = await ProductVariantCollection.find({ productId }).lean().exec();

  const data = await ProductCollection.findOne({ _id: productId }).lean().exec();
  return data;
}

const createProductAndVariantV2 = async (info: any) => {
  const data = await persistProductV2(info);
  return {
    ...data
  }
}

const fetchProductListV2 = async (params: any, language = 'vi', isRaw = false) => {
  const {
    query, keyword,
  } = params;
  if (keyword) {
    query['$text'] = { $search: keyword };
  }
  const variantList = await ProductVariantCollection.find(query).lean().exec();
  const productIdList = uniq(await Bluebird.map(variantList, (v) => `${v.productId}`));
  const data = await Bluebird.map(productIdList, async (id) => {
    const product = await ProductCollection.findOne({_id: id})
    .populate('partner')
    .populate('branch')
    .populate('manufacturer')
    .populate('country')
    .populate('productType')
    .populate('productGroup')
    .populate('productPosition')
    .populate('routeAdministration')
    .lean().exec();
    const query: any = {productId: id, status: PRODUCT_VARIANT_STATUS.ACTIVE};
    if (keyword) {
      query['$text'] = { $search: keyword };
    }
    const variants = await ProductVariantCollection.find(query)
    .populate('productUnit').lean().exec();
    const productVariants = await Bluebird.map(variants, async (v) => {
      const variantId = get(v, '_id');
      const batchQuery = { variantId };
      const batch = [{quantity: 1}, {quantity: 2}];
      const totalQuantity = await Bluebird.reduce(batch, (total, b) => {
        return total += get(b, 'quantity', 0);
      }, 0);
      return {
        ...v,
        batch,
        totalQuantity,
      };
    });
    return {
      ...product,
      productVariants,
    }
  });
  if (isRaw) {
    return data;
  }
  return map(data, (d) => appUtil.mapLanguage(d, language));
};

const fetchProductInfoV2 = async (query: any, language = 'vi', isRaw = false) => {
  const product = await ProductCollection.findOne(query)
  .populate('partner')
  .populate('branch')
  .populate('manufacturer')
  .populate('country')
  .populate('productType')
  .populate('productGroup')
  .populate('productPosition')
  .populate('routeAdministration')
  .lean().exec();
  const productId = get(product, '_id');
  const productVariants = await ProductVariantCollection.find({productId, status: PRODUCT_VARIANT_STATUS.ACTIVE})
  .populate('productUnit').lean().exec();
  const data = {
    ...product,
    productVariants,
  };
  if (isRaw) {
    return data;
  }
  return appUtil.mapLanguage(data, language);
};

const updateProductAndVariantV2 = async (info: any) => {
  const _id = get(info, '_id');
  const query = { _id };
  const product = await ProductCollection.findOneAndUpdate(query, {
    $set: info
  }, {
    new: true
  })
  .populate('partner')
  .populate('branch')
  .populate('manufacturer')
  .populate('country')
  .populate('productType')
  .populate('productGroup')
  .populate('productPosition')
  .populate('routeAdministration')
  .lean().exec();
  const productVariants = get(info, 'productVariants');

  Bluebird.map(productVariants, async (detail: any) => await createVariantV2({ productId: _id, ...detail}));
  const updatedVariants = await ProductVariantCollection.find({ productId: _id, status: PRODUCT_VARIANT_STATUS.ACTIVE }).populate('productUnit').lean().exec();
  return {
    ...product,
    productVariants: updatedVariants,
  };
};

const deleteProductAndVariantV2 = async (query: any) => {
  const product = await ProductCollection.findOneAndUpdate(query, {
    deletedAt: new Date(),
    status: PRODUCT_STATUS.DELETED
  }).lean().exec();
  const productId = get(product, '_id');
  const variantQuery = {productId};
  await ProductVariantCollection.updateMany(variantQuery, {
    deletedAt: new Date(),
    status: PRODUCT_VARIANT_STATUS.DELETED
  });

  return true;
}

const fetchProductVariantQuantityV2 = async (params: any) => {
  const { variantId } = params;
  const query = { variantId, type: INVENTORY_TRANSACTION_TYPE.ORDER_PRODUCT }
  const allOrderTransactions = await InventoryTransactionCollection.find(query).lean().exec();
  const quantityOrder = await SaleOrderCollection.find(query).lean().exec();
};

const searchProductVariants = async (keyword: string, branchId: number) => {
  const productVariants = await ProductVariantCollection.find({
    $or: [
      {
        variantSearch: {
          $elemMatch: {
            $regex: '.*' + keyword + '.*', $options: 'i'
          }
        }
      }, {
        variantCode: {
          $regex: '.*' + keyword + '.*', $options: 'i'
        }
      }
    ],
    branchId,
    status: PRODUCT_VARIANT_STATUS.ACTIVE
  }).limit(10)
    .populate('unit')
    .populate('product')
    .lean().exec();
  if (!productVariants || productVariants.length === 0) {
    return [];
  }
  for (const productVariant of productVariants) {
    productVariant.batches = await LotCollection.find({
      variantId: productVariant['_id']
    }).sort({expirationDate: 1}).lean().exec();
    productVariant.availableQuantity = productVariant.batches.map((batch: any) => batch.quantity).reduce((a: any, b: any) => a + b, 0);
  }

  return productVariants
}

export default {
  // Product
  createProduct,
  fetchProductList,
  fetchProductInfo,
  updateProduct,
  deleteProduct,

  // Variant
  createVariant,
  updateVariants,

  // Product Variant
  fetchProductVariantList,

  searchMedicines,

  // V2
  createProductAndVariantV2,
  fetchProductListV2,
  fetchProductInfoV2,
  updateProductAndVariantV2,
  deleteProductAndVariantV2,
  fetchProductVariantQuantityV2,
  
  searchProductVariants
}