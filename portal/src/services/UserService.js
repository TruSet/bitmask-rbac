import _ from 'lodash'

// NOTE: Modify these roles to match your application's deployed roles
const roles = [
  'rbac_admin',
  'publish',
  'validate',
  'initialize_vote', // not used
  'close_vote_phases',
  'requisition_tokens',
  'create_instrument',
  'data_admin',
  'qbac_admin',
  'token_redemption_admin',
  'token_transferer',
  'privileged_publish',
]

export const supportedRoles = roles.map((roleString, index) => [
  1 << index,
  roleString,
])

export const GUEST = 0
export const [
  ADMIN,
  PUBLISH,
  VALIDATE,
  INIT_VOTE,
  PROGRESS_VOTE,
  REQUISITION_TOKENS,
  CREATE_INSTRUMENT,
  DATA_ADMIN,
  QBAC_ADMIN,
  TOKEN_REDEMPTION_ADMIN,
  TOKEN_TRANSFER,
  PRIVILEGED_PUBLISH,
] = supportedRoles.map(a => a[0])

export const numberForRoleString = roleString => {
  let roleTuple = supportedRoles.find(tuple => tuple[1] === roleString)
  if (_.isUndefined(roleTuple)) {
    // guest, empty role string
    return 0
  }
  return roleTuple[0]
}

export const decomposeBitmask = rolesBits => {
  let powers = []
  let i = 1
  while (i <= rolesBits) {
    if (i & rolesBits) {
      powers.push(i)
    }
    i = i << 1
  }
  return powers
}

export const composeBitmask = roles =>
  roles.reduce((acc, role) => {
    return acc | role
  }, 0)
