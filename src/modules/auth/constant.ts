import { CLINIC_RESOURCES, CORE_ACTIONS, CORE_RESOURCES, PHARMACY_RESOURCES } from '@app/core/permissions';

export const PHARMACY_DEFAULT_ROLES = [
  {
    name: 'Quản Trị Viên',
    permissions: Object.keys(PHARMACY_RESOURCES).map(resource => {
      return  {
          resource: resource,
          action: Object.values(CORE_ACTIONS)
        }
    }),
  },
  {
    name: 'Dược sĩ',
    permissions: [
      {
        resource: PHARMACY_RESOURCES.order,
        action: Object.values(CORE_ACTIONS)
      }
    ]
  }
]

export const PHARMACIST_DEFAULT_ROLES = [
  {
    name: 'Dược sĩ',
    permissions: [
      {
        resource: PHARMACY_RESOURCES.order,
        action: Object.values(CORE_ACTIONS)
      }
    ]
  }
]

export const CLINIC_DEFAULT_ROLES = [
  {
    name: 'Quản Trị Viên',
    permissions: Object.keys(CLINIC_RESOURCES).map(resource => {
      return  {
          resource: resource,
          action: Object.values(CORE_ACTIONS)
        }
    }),
  },
  {
    name: 'Bác sĩ',
    permissions: [
      {
        resource: CLINIC_RESOURCES.appointment,
        action: Object.values(CORE_ACTIONS)
      }
    ]
  }
]