import express from 'express';
import loggerHelper from '@utils/logger.util';
import { medicineModel } from './medicine.model';
import get from 'lodash/get';
import { PRODUCT_STATUS, PRODUCT_TYPE } from './constant';
import { NotFoundError, ValidationFailedError } from '@app/core/types/ErrorTypes';
import { variantModel } from './productVariant.model';
import { isEmpty, isNil, isUndefined, omit, omitBy, size } from 'lodash';
import productService from './product.service';
import Bluebird from 'bluebird';

const logger = loggerHelper.getLogger('Product.controller');

const transformProduct = async (type: PRODUCT_TYPE, data: any) => {
  if (!Object.values(PRODUCT_TYPE).some((v) => type === v)) {
    throw new ValidationFailedError('Wrong product type.');
  }
  switch (type) {
    case PRODUCT_TYPE.MEDICINE: {
      const medicinetDetail: medicineModel = {
        ingredient: get(data, 'ingredient', ''),
        dosage: get(data, 'dosage', ''),
        medicineCode: get(data, 'medicineCode', ''),
        registrationNo: get(data, 'registrationNo', ''),
        weight: get(data, 'weight', ''),
        packagingSize: get(data, 'packagingSize', ''),
      };
      return medicinetDetail;
    }
  }
};

const transformVariant = async (data: any, branchId: number) => {
  let hasDefault = false;
  const variantsInfo: [variantModel] = data.map((_info: any) => {
    const unitId = get(_info, 'unitId');
    if (isNil(unitId)) {
      throw new ValidationFailedError('UnitId is required.');
    }
    const isDefault = get(_info, 'isDefault', false);
    if (isDefault) hasDefault = isDefault;
    return omitBy({
      variantId: get(_info, 'variantId', null),
      productId: get(_info, 'productId', null),
      isDefault,
      unitId: get(_info, 'unitId'),
      exchangeValue: get(_info, 'exchangeValue', 1),
      barcode: get(_info, 'barcode', ''),
      cost: get(_info, 'pricing.cost', 0),
      price: get(_info, 'pricing.price', 0),
      status: get(_info, 'status', PRODUCT_STATUS.ACTIVE),
      branchId,
    }, isNil);
  });
  if (!hasDefault) {
    throw new ValidationFailedError('There must be at least one default variant for this product.');
  }
  return variantsInfo;
}

const createProductAction = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const branchId = get(req, 'companyId');
    const productType = get(req, 'query.productType', '');
    const {
      productId,
      name,
      aliasName,
      barcode,
      typeId,
      manufacturerId,
      groupId,
      positionId,
      routeAdministrationId,
      productDetail,
      productVariants,
    } = req.body;
    
    if (isNil(productVariants) || size(productVariants) <= 0 ) {
      throw new ValidationFailedError('There must be at least one unit setting for this product.');
    }

    const [productInfo, variantsInfo] = await Promise.all([
      transformProduct(productType, productDetail),
      transformVariant(productVariants, branchId),
    ]);

    const record = await productService.createProduct({
      productId,
      name,
      aliasName,
      barcode,
      typeId,
      manufacturerId,
      groupId,
      positionId,
      routeAdministrationId,
      branchId,
      productDetail: productInfo,
      productVariants: variantsInfo,
      });

    res.send({
      record,
    });
  } catch (error) {
    logger.error('createProductAction', error);
    next(error);
  }
};

const fetchProductListAction = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  try {
    const branchId = get(req, 'companyId');
    const raw: boolean = !isUndefined(get(req.query, 'raw'));
    const language: string = get(req, 'language');
    const query = { branchId };
    const list = await productService.fetchProductList(
      branchId,
      language,
      raw
    );
    res.send(list);
  } catch (error) {
    logger.error('fetchProductListAction', error);
    next(error);
  }
};

const updateProductAction = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  try {
    const branchId = get(req, 'companyId');
    const productType = get(req, 'query.productType', '');
    const productId = get(req.params, 'id');
    const query = { productId, branchId }

    const isExisted = await productService.fetchProductInfo(query);
    if (isEmpty(isExisted)) {
      throw new NotFoundError();
    }

    const {
      name,
      aliasName,
      barcode,
      typeId,
      manufacturerId,
      groupId,
      positionId,
      routeAdministrationId,
      productDetail,
      productVariants,
    } = req.body;

    if (isNil(productVariants) || size(productVariants) <= 0 ) {
      throw new ValidationFailedError('There must be at least one unit setting for this product.');
    }

    const [productInfo, variantsInfo] = await Promise.all([
      transformProduct(productType, productDetail),
      transformVariant(productVariants, branchId),
    ]);
    const productQuery = {productId, branchId};
    const record = await productService.updateProduct(productQuery, omitBy({
      name,
      aliasName,
      barcode,
      typeId,
      manufacturerId,
      groupId,
      positionId,
      routeAdministrationId,
      productDetail: productInfo,
      productVariants: variantsInfo,
    }, isNil));

    // const variants = await productService.updateVariants(variantsQuery, Bluebird.map(variantsInfo, (v) => omit(variantsInfo, 'variantId')));
    // const variants = await productService.updateVariants(variantsInfo);

    res.send({
      ...record,
    });
  } catch (error) {
    logger.error('updateProductAction', error);
    next(error);
  }
};

const deleteProductAction = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  try {
    const branchId = get(req, 'companyId');
    const productId = get(req.params, 'id');
    const query = { productId, branchId };
    const isExisted = await productService.fetchProductInfo(query);
    if (isEmpty(isExisted)) {
      throw new NotFoundError();
    }

    const data = await productService.deleteProduct(query);
    res.send(data);
  } catch (error) {
    logger.error('deleteProductAction', error);
    next(error);
  }
};

const fetchProductVariantListAction = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  try {
    let branchId = get(req.query, 'branchId') || req.companyId;
    const language: string = get(req, 'language');
    const keyword = get(req.query, 'keyword');
    const list = await productService.fetchProductVariantList({ keyword, branchId }, language);
    res.send(list);
  } catch (error) {
    logger.error('fetchProductVariantListAction', error);
    next(error);
  }
}


const searchMedicineAction = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  try {
    // let branchId = get(req.query, 'branchId') || req.companyId;
    const keyword = get(req.query, 'keyword');
    if(!keyword) {
      throw new ValidationFailedError('Vui lòng nhập vào keyword.');
    }

    const list = await productService.searchMedicines(keyword);
    res.send(list);
  } catch (error) {
    logger.error('searchMedicineAction', error);
    next(error);
  }
}
export default {
  // Product
  createProductAction,
  fetchProductListAction,
  updateProductAction,
  deleteProductAction,

  fetchProductVariantListAction,
  searchMedicineAction,
};
