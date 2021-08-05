import { CORE_ACTIONS, CORE_RESOURCES } from '@app/core/permissions';

export const DEFAULT_ROLES = [
  {
    name: 'Admin',
    permissions: [
      {
        resource: CORE_RESOURCES.appointment,
        action: Object.values(CORE_ACTIONS)
      },
      {
        resource: CORE_RESOURCES.customer,
        action: Object.values(CORE_ACTIONS)
      },
      {
        resource: CORE_RESOURCES.user,
        action: Object.values(CORE_ACTIONS)
      }
    ]
  },
  {
    name: 'Bác sĩ',
    permissions: [
      {
        resource: CORE_RESOURCES.appointment,
        action: Object.values(CORE_ACTIONS)
      }
    ]
  }
]