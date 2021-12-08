export enum PAYMENT_NOTE_STATUS {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export enum PAYMENT_NOTE_TYPE {
  PAYMENT = 'PAYMENT', // Chi tien
  RECEIPT = 'RECEIPT', // Thu tien
}

export namespace PaymentNoteConstants {
  export interface TransactionType {
    symbol: string,
    referenceDocName: string
  }
  
  // Phieu chi phieu nhap
  export const PCPN: TransactionType = {
    symbol: 'PCPN',
    referenceDocName: 'purchase_order'
  }
  // Thanh toan hoa don
  export const TTHD: TransactionType = {
    symbol: 'TTHD',
    referenceDocName: 'invoice'
  }
  // Thanh toan don hang
  export const TTDH: TransactionType ={
    symbol: 'TTDH',
    referenceDocName: 'sale_order'
  }
}
