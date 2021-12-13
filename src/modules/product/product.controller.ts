import express from 'express';
import loggerHelper from '@utils/logger.util';
import { medicineModel } from './medicine.model';
import get from 'lodash/get';
import { PRODUCT_STATUS, PRODUCT_TYPE, PRODUCT_VARIANT_STATUS } from './constant';
import { NotFoundError, ValidationFailedError } from '@app/core/types/ErrorTypes';
import { variantModel } from './productVariant.model';
import { isEmpty, isNil, isUndefined, omit, omitBy, size } from 'lodash';
import productService from './product.service';
import Bluebird from 'bluebird';
import ProductCollection from './product.collection';
import ProductVariantCollection from './productVariant.collection';

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

const transformVariant = async (searchProductSchema: any, data: any, ...restParams: any) => {
  const { partnerId, branchId } = restParams;
  const variantSearch = [get(searchProductSchema, 'name'), get(searchProductSchema, 'aliasName')];
  let hasDefault = false;
  const variantsInfo: [variantModel] = await Promise.all(data.map(async (_info: any) => {
    const variantCode = get(_info, 'variantCode', null);
    if (!isNil(variantCode)) {
      const id = get(_info, '_id', null);
      const query = isNil(id) ? { variantCode } : { _id: { $ne: id }, variantCode };
      const isExist = await ProductVariantCollection.exists(query);
      if (isExist) {
        throw new ValidationFailedError('Variant Code has been used');
      }
    }
    const unitId = get(_info, 'unitId');
    if (isNil(unitId)) {
      throw new ValidationFailedError('UnitId is required.');
    }
    const isDefault = get(_info, 'isDefault', false);
    if (isDefault) hasDefault = isDefault;
    return omitBy({
      _id: get(_info, '_id', null),
      variantCode,
      variantSearch,
      productId: get(_info, 'productId', null),
      isDefault,
      unitId: get(_info, 'unitId'),
      exchangeValue: get(_info, 'exchangeValue', 1),
      barcode: get(_info, 'barcode', ''),
      cost: get(_info, 'cost', 0),
      price: get(_info, 'price', 0),
      status: get(_info, 'status', PRODUCT_VARIANT_STATUS.ACTIVE),
      partnerId,
      branchId,
    }, isNil);
  }));
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
    const keyword = get(req, 'query.keyword');
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

const createProductAndVariantActionV2 = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  try {
    const branchId = get(req, 'companyId', null);
    if (isNil(branchId)) {
      throw new ValidationFailedError('branchId is required');
    }
    const partnerId = get(req, 'user.partnerId', null);
    if (isNil(partnerId)) {
      throw new ValidationFailedError('partnerId is required');
    }
    const {
      productType,
      // productCode,
      name,
      aliasName,
      barcode,
      typeId,
      manufacturerId,
      countryId,
      groupId,
      positionId,
      routeAdministrationId,
      productDetail,
      productVariants,
      detailDescription,
      // status,
    } = req.body;

    // @Tuan.NG:> checking duplicated productCode
    // const isExist = await ProductCollection.exists({productCode});
    // if (isExist) {
    //   throw new ValidationFailedError(`The productCode: ${productCode} has been used`);
    // }
    
    if (isNil(productVariants) || size(productVariants) <= 0 ) {
      throw new ValidationFailedError('There must be at least one unit setting for this product.');
    }

    const searchProductSchema = { name, aliasName };
    const [productInfo, variantsInfo] = await Promise.all([
      transformProduct(productType, productDetail),
      transformVariant(searchProductSchema, productVariants, partnerId, branchId),
    ]);

    const record = await productService.createProductAndVariantV2({
      // productCode,
      name,
      aliasName,
      barcode,
      typeId,
      manufacturerId,
      countryId,
      groupId,
      positionId,
      routeAdministrationId,
      partnerId,
      branchId,
      productDetail: productInfo,
      productVariants: variantsInfo,
      detailDescription,
      status: PRODUCT_STATUS.ACTIVE,
      });

    res.send(record);
  } catch (error) {
    logger.error('createOrUpdateProductActionV2', error);
    next(error);
  }
};

const fetchProductListActionV2 = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  try {
    const branchId = get(req, 'companyId');
    const raw: boolean = !isUndefined(get(req.query, 'raw'));
    const language: string = get(req, 'language');
    const keyword = get(req, 'query.keyword', '');
    const query = { branchId, status: PRODUCT_VARIANT_STATUS.ACTIVE }; // Only care Variant Status
    const params = { query, keyword };
    const list = await productService.fetchProductListV2(
      params,
      language,
      raw
    );
    res.send(list);
  } catch (error) {
    logger.error('fetchProductListAction', error);
    next(error);
  }
}

const fetchProductInfoActionV2 = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  try {
    const id = get(req, 'params.id');
    const query = { _id: id };
    const data = await productService.fetchProductInfoV2(query);
    res.send(data); 
  } catch (error) {
    logger.error('fetchProductInfoActionV2', error);
    next(error);
  }
};

const updateProductAndVariantActionV2 = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  try {
    const _id = get(req, 'params.id', null);
    if (isNil(_id)) {
      throw new ValidationFailedError('_id is required');
    }
    const {
      productType,
      // productCode,
      name,
      aliasName,
      barcode,
      typeId,
      partnerId,
      branchId,
      manufacturerId,
      countryId,
      groupId,
      positionId,
      routeAdministrationId,
      productDetail,
      productVariants,
      detailDescription,
      status,
    } = req.body;

    if(isNil(_id)) {
      throw new ValidationFailedError('ProductId is required');
    }
    // @Tuan.NG:> checking duplicated productCode
    // const isExist = await ProductCollection.exists({productCode});
    // if (isExist) {
    //   throw new ValidationFailedError(`The productCode: ${productCode} has been used`);
    // }
    
    if (isNil(productVariants) || size(productVariants) <= 0 ) {
      throw new ValidationFailedError('There must be at least one unit setting for this product.');
    }

    const searchProductSchema = { name, aliasName };
    const [productInfo, variantsInfo] = await Promise.all([
      transformProduct(productType, productDetail),
      transformVariant(searchProductSchema, productVariants, partnerId, branchId),
    ]);

    const record = await productService.updateProductAndVariantV2({
      // productCode,
      _id,
      name,
      aliasName,
      barcode,
      typeId,
      manufacturerId,
      countryId,
      groupId,
      positionId,
      routeAdministrationId,
      partnerId,
      branchId,
      productDetail: productInfo,
      productVariants: variantsInfo,
      detailDescription,
      status: isNil(status) ? PRODUCT_STATUS.ACTIVE : status,
      });

    res.send(record);
  } catch (error) {
    logger.error('updateProductAndVariantActionV2', error);
    next(error);
  }
}

const deleteProductAndVariantActionV2 = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  try {
    const _id = get(req, 'params.id');
    const query = { _id };
    const record = await productService.deleteProductAndVariantV2(query);
    res.send(record);
  } catch (error) {
    logger.error('deleteProductAndVariantActionV2', error);
    next(error);
  }
}

const fetchProductVariantQuantityActionV2 = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  try {
    const _id = get(req, 'params.id');
    const params = { variantId: _id }; 
    const record = await productService.fetchProductVariantQuantityV2(params);
    res.send(record);
  } catch (error) {
    logger.error('fetchProductVariantQuantityActionV2', error);
    next(error);
  }
}

const searchProductVariant = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  try {
    const branchId = req.companyId;
    const keyword = get(req, 'query.keyword');
    if(!keyword) {
      throw new ValidationFailedError('Vui lòng nhập vào keyword.');
    }

    const list = await productService.searchProductVariants(keyword, branchId);
    res.send(list);
  } catch (error) {
    logger.error('searchProductVariant', error);
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

  createProductAndVariantActionV2,
  fetchProductListActionV2,
  fetchProductInfoActionV2,
  updateProductAndVariantActionV2,
  deleteProductAndVariantActionV2,
  fetchProductVariantQuantityActionV2,
  
  searchProductVariant,
};
