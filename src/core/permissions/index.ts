export const CORE_RESOURCES = {
  partner: 'partner',
  branch: 'branch',
  companyInfo: 'companyInfo',
  employee: 'employee',
  user: 'user',
  userGroup: 'userGroup',
  customer: 'customer',
  patient: 'patient',
}

export const PHARMACY_RESOURCES = {
  ...CORE_RESOURCES,
  order: 'order',
};

export const CLINIC_RESOURCES = {
  ...CORE_RESOURCES,
  order: 'order',
  appointment: 'appointment',
};

export const ROOT_RESOURCES = {
  ...CORE_RESOURCES,
  ...CLINIC_RESOURCES,
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
    key: CORE_RESOURCES.partner,
    name: 'Quản lý công ty',
  },
  {
    key: CORE_RESOURCES.userGroup,
    name: 'Quản lý nhóm người dùng',
  },
  {
    key: CORE_RESOURCES.employee,
    name: 'Quản lý người dùng',
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
  }
]