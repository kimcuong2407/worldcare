export const CORE_RESOURCES = {
  company: 'company',
  user: 'user',
  userGroup: 'userGroup',
  appointment: 'appointment',
  order: 'order',
  customer: 'customer',
  patient: 'patient',

}

export const CORE_ACTIONS = {
  read: 'read',
  write: 'write',
  delete: 'delete',
  update: 'update',
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
  // {
  //   key: CORE_ACTIONS.admin,
  //   name: 'Quản trị',
  // },
];

export const RESOURCES = [
  {
    key: CORE_RESOURCES.company,
    name: 'Quản lý công ty',
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
    key: CORE_RESOURCES.appointment,
    name: 'Quản lý đặt lịch',
  },
  {
    key: CORE_RESOURCES.order,
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