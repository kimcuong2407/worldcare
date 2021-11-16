import express from 'express';
import loggerHelper from '@utils/logger.util';
import { medicineModel } from './medicine.model';
import get from 'lodash/get';
import { PRODUCT_STATUS, PRODUCT_TYPE } from './constant';
import { NotFoundError, ValidationFailedError } from '@app/core/types/ErrorTypes';
import { variantModel } from './productVariant.model';
import { isEmpty, isNil, isUndefined, omitBy, size } from 'lodash';
import productService from './product.service';

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
      }
      return medicinetDetail;
    }
  }
};

const transformVariant = async (data: any) => {
  let hasDefault = false;
  const variantsInfo: [variantModel] = data.map((_info: any) => {
    const unitId = get(_info, 'unitId');
    if (isNil(unitId)) {
      throw new ValidationFailedError('UnitId is required.');
    }
    const isDefault = get(_info, 'isDefault', false);
    if (isDefault) hasDefault = isDefault;
    return {
      isDefault,
      unitId: get(_info, 'unitId'),
      exchangeValue: get(_info, 'exchangeValue', 1),
      barcode: get(_info, 'barcode', ''),
      cost: get(_info, 'pricing.cost', 0),
      price: get(_info, 'pricing.price', 0),
      status: PRODUCT_STATUS.ACTIVE,
    };
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
      transformVariant(productVariants),
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
    const raw: boolean = !isUndefined(get(req.query, 'raw'));
    const language: string = get(req, 'language');
    const list = await productService.fetchProductList(
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
    const productType = get(req, 'query.productType', '');
    const productId = get(req.params, 'productId');

    const isExisted = await productService.fetchProductInfo(productId);
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
    } = req.body;

    const productInfo = await transformProduct(productType, productDetail);

    const record = await productService.updateProduct(productId, omitBy({
      name,
      aliasName,
      barcode,
      typeId,
      manufacturerId,
      groupId,
      positionId,
      routeAdministrationId,
      productDetail: productInfo,
    }, isNil));

    res.send({
      record,
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
    const productId = get(req.params, 'productId');
    const isExisted = await productService.fetchProductInfo(productId);
    if (isEmpty(isExisted)) {
      throw new NotFoundError();
    }

    const data = await productService.deleteProduct(productId);
    res.send(data);
  } catch (error) {
    logger.error('deleteProductAction', error);
    next(error);
  }
};

export default {
  createProductAction,
  fetchProductListAction,
  updateProductAction,
  deleteProductAction,
};
