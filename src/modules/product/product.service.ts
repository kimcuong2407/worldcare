import { InternalServerError } from '@app/core/types/ErrorTypes';
import get from 'lodash/get';
import omitBy from 'lodash/omitBy'
import isNil from 'lodash/isNil';
import { PRODUCT_STATUS } from './constant';
import ProductCollection from './product.collection';
import ProductVariantCollection from './productVariant.collection';
import { forEach, map, omit, size } from 'lodash';
import appUtil from '@app/utils/app.util';
import { lang } from 'moment';
import Bluebird from 'bluebird';
import { query } from 'express';
import MedicineCollection from './medicine.collection';

const initIdSquence = (idSequence: number) => {
  let s = '000000000' + idSequence;
  return s.substr(s.length - 6);
}

const productAutoIncrease = (record: any, productVariants: any) => {
  record.setNext('product_id_sequence', async (err: any, record: any) => {
    if(err) {
      return new InternalServerError('Failed to increase ID.');
    }
    const increasedId = `SP${initIdSquence(record.idSequence)}`
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
  return map(data, (d) => appUtil.mapLanguage(d, language));
};

const updateProduct = async (query: any, info: any) => {
  const productVariants = get(info, 'productVariants');
  console.log(JSON.stringify(info))
  const record = await ProductCollection.findOneAndUpdate( query, info, {new: true}).lean().exec();
  console.log(JSON.stringify(record))
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
    const increasedId = `VA${initIdSquence(record.idSequence)}`
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
  console.log(JSON.stringify(bulkQuery))
  const created = await ProductVariantCollection.bulkWrite(bulkQuery);
  const recordIds = created.insertedIds
  console.log(created.insertedIds);

  return await ProductVariantCollection.find({ variantId: { $in: Object.values(recordIds)}}).lean().exec();
};

const updateVariants = async (info: any) => {
  const bulkQuery = await Bluebird.map(info, (v: object) => {
    const variantId = get(v, 'variantId');
    console.log(variantId)
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
  console.log(s)
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
}