import middleware from '@app/core/middleware';
import { CORE_ACTIONS, ROOT_RESOURCES } from '@app/core/permissions';
import express from 'express';
import productActions from './product.controller';

const productRoutes = (app: express.Application): void => {
  // @Tuan.NG:> Create Product Variant
  app.post('/api/v1/product', productActions.createProductAction);
  app.put('/api/v1/product/:id', productActions.updateProductAction);

  app.get('/api/v1/product', productActions.fetchProductListAction);
  // app.get('/api/v1/product/:id', productActions.fetchProductInfoAction);
  
  app.delete('/api/v1/product/:id', productActions.deleteProductAction);

  app.get('/api/v1/product-variant', productActions.fetchProductVariantListAction);

  app.get('/api/v1/medicine/search', productActions.searchMedicineAction);

  // API vers 2 after meeting
  // app.post('api/v2/product', productActions.createOrUpdate)
};

export default productRoutes;
