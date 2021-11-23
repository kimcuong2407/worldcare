export enum PAYMENT_NOTE_STATUS {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export enum PAYMENT_NOTE_TYPE {
  PAYMENT = 'PAYMENT', // Chi tien
  RECEIPT = 'RECEIPT', // Thu tien
}

export enum TRANSACTION_TYPE {
  PCPN = 'PCPN', // Phieu chi phieu nhap
  TTHD = 'TTHD', // Thanh toan hoa don
  TTDH = 'TTDH', // Thanh toan don hang
}
