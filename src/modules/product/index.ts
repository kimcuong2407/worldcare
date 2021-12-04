import middleware from '@app/core/middleware';
import { CORE_ACTIONS, ROOT_RESOURCES } from '@app/core/permissions';
import express from 'express';
import productActions from './product.controller';

const productRoutes = (app: express.Application): void => {
  // @Tuan.NG:> Obsoleted
  app.post('/api/v1/product', productActions.createProductAction);
  app.put('/api/v1/product/:id', productActions.updateProductAction);

  app.get('/api/v1/product', productActions.fetchProductListAction);
  
  app.delete('/api/v1/product/:id', productActions.deleteProductAction);

  app.get('/api/v1/product-variant', productActions.fetchProductVariantListAction);

  app.get('/api/v1/medicine/search', productActions.searchMedicineAction);

  // @Tuan.NG:> V2 after meeting
  app.post('/api/v2/product', productActions.createProductAndVariantActionV2);
  app.get('/api/v2/product', productActions.fetchProductListActionV2);
  app.get('/api/v2/product/:id', productActions.fetchProductInfoActionV2);
  app.put('/api/v2/product/:id', productActions.updateProductAndVariantActionV2);
  app.delete('/api/v2/product/:id', productActions.deleteProductAndVariantActionV2);
  app.get('/api/v2/product-variant/quantity', productActions.fetchProductVariantQuantityActionV2);

  app.get('/api/v1/product-variant/search', middleware.authorization([
    [ROOT_RESOURCES.sale, CORE_ACTIONS.read]
  ]), productActions.searchProductVariant);
};

export default productRoutes;
