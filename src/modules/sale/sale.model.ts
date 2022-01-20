export interface SaleItemModel {
  productId: string;
  variantId: string;
  batchId: string;
  quantity: number;
  cost: number;
  discountValue: number;
  discountPercent: number;
  discountType: 'VALUE' | 'PERCENT';
  price: number;
}