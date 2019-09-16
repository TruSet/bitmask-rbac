import _ from 'lodash'
import { RESET_PERSISTED_STATE, SET_DISPLAY, USERS_INITIAL_LOAD, FETCHING_USERS, TOKEN_TRANSFER_RECEIVED, ROLE_ADDED, ROLE_REMOVED, User, UsersState, UserRegistryState, UsersActionTypes } from './types/users'
import { numberForRoleString } from '../services/UserService'
import { Action } from 'redux'
import { ThunkAction } from 'redux-thunk'
import { AppState } from './types/store'

export const initialState: UsersState = {
  initialized: false,
  registry: {},
  users_fetching: false,
}

export default (state = initialState, action: UsersActionTypes) => {
  if (!action) {
    return state
  }

  switch (action.type) {
    case FETCHING_USERS:
      return { ...state, users_fetching: true }
    case USERS_INITIAL_LOAD:
      return {
        ...state,
        registry: registry(state.registry, action),
        initialized: true,
        users_fetching: false,
      }
    case SET_DISPLAY:
    case ROLE_ADDED:
    case ROLE_REMOVED:
      return { ...state, registry: registry(state.registry, action) }
    case RESET_PERSISTED_STATE:
      return initialState
    default:
      return state
  }
}

const initialUserRegistryState: UserRegistryState = {}

const registry = (state = initialUserRegistryState, action: UsersActionTypes) => {
  let address
  switch (action.type) {
    case USERS_INITIAL_LOAD:
      let newUsers: UserRegistryState = {}
      _.each(action.users, user => {
        newUsers[user.address] = user
      })
      return { ...state, ...newUsers }
    case ROLE_ADDED:
      address = action.address
      let updatedUser: User = { ...state[address] }
      updatedUser.role = updatedUser.role | action.role
      return { ...state, [address]: updatedUser }
    case ROLE_REMOVED:
      address = action.address
      let roleRemovedUser : User = { ...state[address] }
      if ((roleRemovedUser.role & action.role) === 0) return state // if user doesn't have role
      roleRemovedUser.role = roleRemovedUser.role - action.role
      return { ...state, [address]: roleRemovedUser }
    case SET_DISPLAY:
      address = action.address
      let renamedUser = state[address]
        ? { ...state[address] }
        : { address: action.address, role: 0, display: '', balance: 0 }
      renamedUser.display = action.display
      return { ...state, [address]: renamedUser }
    default:
      return state
  }
}

export const usersInitialLoad = (ethereumClient : any): ThunkAction<void, AppState, null, Action<string>>  => {
  return dispatch => {
    dispatch({
      type: FETCHING_USERS,
    })

    ethereumClient.userCount().then((userCount: number )=> {
      ethereumClient
        .getUsers({ startIndex: 0, count: userCount })
        .then((users: User[] ) => {
          dispatch({ type: USERS_INITIAL_LOAD, users })
        })
        .catch((error : any) => {
          console.error('Error fetching users', error)
        })
    })
  }
}

export const setDisplay = (address: string, display: string) => {
  return { address, display, type: SET_DISPLAY }
}

export const roleAdded = (address: string, roleName: string) => {
  let role = numberForRoleString(roleName)
  return { address, role, type: ROLE_ADDED }
}

export const roleRemoved = (address: string, roleName: string) => {
  let role = numberForRoleString(roleName)
  return { address, role, type: ROLE_REMOVED }
}
