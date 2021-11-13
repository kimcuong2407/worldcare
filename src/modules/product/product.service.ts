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
    
    productVariants.map(async (detail: any) => {
      console.log(`Tronic create variant: ${JSON.stringify({
        productId: increasedId,
        ...detail,
      })}`)
      await createProductVariant({
        productId: increasedId,
        ...detail,
      })
    });
  });
}

const persistProduct = async (info: any) => {
  const productId = get(info, 'productId', null);
  const product = await ProductCollection.create(omitBy(info, 'productVariants'));
  const productVariants = get(info, 'productVariants');
  if (isNil(productId)) {
    productAutoIncrease(product, productVariants);
  } else {
    productVariants.map(async (detail: any) => {
      console.log(`Tronic create variant: ${JSON.stringify({
        productId,
        ...detail,
      })}`)
      await createProductVariant({
        productId,
        ...detail,
      });
    });
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

const fetchProductList = async () => {
  return await ProductCollection.find({}).lean().exec();
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
    const increasedId = `VA${initIdSquence(record.idSequence)}`
    const doc = await ProductVariantCollection.findOne({increasedId}).exec();
    if(!isNil(doc)) variantAutoIncrease(record);
    record.variantId = increasedId;
    record.save();
  });
}

const persistProductVariant = async (info: any) => {
  const variantId = get(info, 'variantId', null);
  const variant = await ProductVariantCollection.create(info);
  console.log(`Tronic: ${variant}`);
  if (isNil(variantId)) {
    variantAutoIncrease(variant);
  }

  return {
    ...get(variant, '_doc', {})
  }
}

const createProductVariant = async (info: any) => {
  console.log(`Tronic create variant: ${JSON.stringify(info)}`)
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