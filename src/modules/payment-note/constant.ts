export enum PAYMENT_NOTE_STATUS {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  CANCELED = 'CANCELED',
}

export enum PAYMENT_NOTE_TYPE {
  PAYMENT = 'PAYMENT', // Chi tien
  RECEIPT = 'RECEIPT', // Thu tien
}

export enum TARGET {
  CUSTOMER = 'CUSTOMER',
  SUPPLIER = 'SUPPLIER',
  EMPLOYEE = 'EMPLOYEE',
  PARTNER = 'PARTNER'
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
  export const TTDH: TransactionType = {
    symbol: 'TTDH',
    referenceDocName: 'sale_order'
  }

  // Phieu thu tra hang nhap
  export const PTTHN: TransactionType = {
    symbol: 'PTTHN',
    referenceDocName: 'purchase_return'
  }

  // Phieu chi tien mat
  export const TTM: TransactionType = {
    symbol: 'TTM',
    referenceDocName: 'purchase_order'
  }
  // Phieu thu tien mat
  export const CTM: TransactionType = {
    symbol: 'CTM',
    referenceDocName: 'invoice'
  }
}
