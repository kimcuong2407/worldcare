export enum INVENTORY_TRANSACTION_TYPE {
  PURCHASE_RECEIPT = 'PURCHASE_RECEIPT',
  SELL_PRODUCT = 'SELL_PRODUCT',
  ORDER_PRODUCT = 'ORDER_PRODUCT',
  PURCHASE_RETURN = 'PURCHASE_RETURN',
  DAMAGE_ITEM = 'DAMAGE_ITEM',
}

export namespace InventoryTransactionConstants {
  export enum STATUS {
    ACTIVE = 'ACTIVE',
    CANCELED = 'CANCELED',
  }
}