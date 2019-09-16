export const RESET_PERSISTED_STATE = 'RESET_PERSISTED_STATE'
export const SET_DISPLAY = 'SET_DISPLAY'
export const USERS_INITIAL_LOAD = 'USERS_INITIAL_LOAD'
export const FETCHING_USERS = 'FETCHING_USERS'
export const TOKEN_TRANSFER_RECEIVED = 'TOKEN_TRANSFER_RECEIVED'
export const ROLE_ADDED = 'ROLE_ADDED'
export const ROLE_REMOVED = 'ROLE_REMOVED'

export interface UserRegistryState {
  [key: string]: User
}


export interface UsersState {
  initialized: boolean,
    registry: UserRegistryState,
    users_fetching: boolean
}

export interface FetchingUsersType {
  type: typeof FETCHING_USERS,
}

export interface User {
  address: string
  role: number,
}

export interface UsersInitialLoadType {
  type: typeof USERS_INITIAL_LOAD,
    users: User[]
}

export interface SetDisplayType {
  type: typeof SET_DISPLAY,
    address: string
  display: string
}

export interface RoleAddedType {
  type: typeof ROLE_ADDED,
    address: string
  role: number

}

export interface RoleRemovedType {
  type: typeof ROLE_REMOVED,
    address: string
  role: number
}

export interface ResetPersistedStateType {
  type: typeof RESET_PERSISTED_STATE,
}

export type UsersActionTypes = FetchingUsersType | UsersInitialLoadType | SetDisplayType | RoleAddedType | RoleRemovedType | ResetPersistedStateType
