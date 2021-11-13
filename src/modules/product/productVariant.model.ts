import { PRODUCT_STATUS } from './constant';

export interface variantModel {
  isDefault: Boolean;
  unit: {
    unitId: String;
    exchangeValue: Number;
    barcode: String;
  };
  pricing: {
    cost: Number;
    price: Number;
  };
  status: PRODUCT_STATUS;
}

