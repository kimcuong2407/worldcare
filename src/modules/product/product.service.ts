import { InternalServerError } from '@app/core/types/ErrorTypes';
import get from 'lodash/get';
import omitBy from 'lodash/omitBy'
import isNil from 'lodash/isNil';
import { PRODUCT_STATUS } from './constant';
import ProductCollection from './product.collection';
import ProductVariantCollection from './productVariant.collection';

const initIdSquence = (idSequence: number) => {
  let s = '000000000' + idSequence;
  return s.substr(s.length - 6);
}

const productAutoIncrease = (record: any) => {
  record.setNext('product_id_sequence', async (err: any, record: any) => {
    if(err) {
      return new InternalServerError('Failed to increase ID.');
    }
    const increasedId = `SP${initIdSquence(record.idSequence)}`
    const doc = await ProductCollection.findOne({increasedId}).exec();
    if(!isNil(doc)) productAutoIncrease(record);
    record.supplierCode = increasedId;
    record.save();
  });
}

const persistProduct = async (info: any) => {
  const productId = get(info, 'productId', null);
  const product = await ProductCollection.create(info);

  if (isNil(productId)) {
    productAutoIncrease(info);
  }

  return {
    ...get(product, '_doc', {})
  }
}

const createProduct = async (info: any) => {
  info.status = PRODUCT_STATUS.ACTIVE;
  const productVariants = get(info, 'productVariants');
  const product = await persistProduct(omitBy(info, 'productVariants'));
  const productId = get(product, 'productId');

  const variants = productVariants.map(async (detail: any) => {
    return await createProductVariant({
      productId,
      detail,
    })
  });

  return {
    ...product,
    productVariants: variants,
  }
}

const fetchProductList = async () => {

};
const fetchProductById = async (productId: string) => {

};
const updateProduct = async (productId: string) => {

};
const deleteProduct = async (productId: string) => {

};

// Variant
const variantAutoIncrease = (record: any) => {
  record.setNext('variant_id_sequence', async (err: any, record: any) => {
    if(err) {
      return new InternalServerError('Failed to increase ID.');
    }
    const increasedId = `SP${initIdSquence(record.idSequence)}`
    const doc = await ProductVariantCollection.findOne({increasedId}).exec();
    if(!isNil(doc)) productAutoIncrease(record);
    record.supplierCode = increasedId;
    record.save();
  });
}

const persistProductVariant = async (info: any) => {
  const variantId = get(info, 'variantId', null);
  const variant = await ProductVariantCollection.create(info);

  if (isNil(variantId)) {
    variantAutoIncrease(info);
  }

  return {
    ...get(variant, '_doc', {})
  }
}

const createProductVariant = async (info: any) => {
  info.status = PRODUCT_STATUS.ACTIVE;
  return await persistProductVariant(info);
};

const fetchProductVariantList = async () => {

};

const fetchProductVariantById = async (variantId: string) => {

};

const updateProductVariant = async (variantId: string) => {

};

const deleteProductVariant = async (variantId: string) => {

};

export default {
  // Product
  createProduct,
  fetchProductList,
  fetchProductById,
  updateProduct,
  deleteProduct,

  // Variant
  createProductVariant,
  fetchProductVariantList,
  fetchProductVariantById,
  updateProductVariant,
  deleteProductVariant,
}