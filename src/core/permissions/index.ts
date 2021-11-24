export const CORE_RESOURCES = {
  branch: 'branch',
  companyInfo: 'companyInfo',
  employee: 'employee',
  user: 'user',
  userGroup: 'userGroup',
  // customer: 'customer',
  // patient: 'patient',
}

export const PHARMACY_RESOURCES = {
  ...CORE_RESOURCES,
  order: 'order',
};

export const CLINIC_RESOURCES = {
  ...CORE_RESOURCES,
  // order: 'order',
  appointment: 'appointment',
  clinicService: 'clinicService',
  inventory: 'inventory',
  purchaseReceipt: 'purchaseReceipt',
  sale: 'sale',
};

export const ROOT_RESOURCES = {
  ...CORE_RESOURCES,
  ...CLINIC_RESOURCES,
  partner: 'partner',
  cms: 'cms',
}

export const CORE_ACTIONS = {
  read: 'read',
  write: 'write',
  delete: 'delete',
  update: 'update',
}

export const ROOT_ACTIONS = {
  ...CORE_ACTIONS,
  admin: 'admin',
}

export const ACTIONS = [
  {
    key: CORE_ACTIONS.read,
    name: 'Đọc',
  },
  {
    key: CORE_ACTIONS.write,
    name: 'Thêm mới',
  },
  {
    key: CORE_ACTIONS.delete,
    name: 'Xóa',
  },
  {
    key: CORE_ACTIONS.update,
    name: 'Chỉnh sửa',
  },
  {
    key: ROOT_ACTIONS.admin,
    name: 'Quản trị',
  },
];

export const RESOURCES = [
  {
    key: ROOT_RESOURCES.partner,
    name: 'Quản lý công ty',
  },
  {
    key: CORE_RESOURCES.branch,
    name: 'Quản lý chi nhánh',
  },
  {
    key: CORE_RESOURCES.userGroup,
    name: 'Quản lý nhóm người dùng',
  },
  {
    key: CORE_RESOURCES.user,
    name: 'Quản lý người dùng',
  },
  {
    key: CORE_RESOURCES.employee,
    name: 'Quản lý hồ sơ nhân viên',
  },
  {
    key: CLINIC_RESOURCES.appointment,
    name: 'Quản lý đặt lịch',
  },
  {
    key: PHARMACY_RESOURCES.order,
    name: 'Quản lý đơn hàng',
  },
  {
    key: CORE_RESOURCES.customer,
    name: 'Quản lý khách hàng',
  },
  {
    key: CORE_RESOURCES.patient,
    name: 'Quản lý bệnh nhân',
  },
  {
    key: ROOT_RESOURCES.cms,
    name: 'Quản lý CMS',
  },
  {
    key: CLINIC_RESOURCES.clinicService,
    name: 'Quản lý dịch vụ khám chữa bệnh',
  },
  {
    key: CLINIC_RESOURCES.sale,
    name: 'Quản lý bán hảng',
  },
  {
    key: CLINIC_RESOURCES.purchaseReceipt,
    name: 'Quản lý nhập kho',
  },
]