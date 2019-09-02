import _ from 'lodash'
import { numberForRoleString } from '../services/UserService'

export const RESET_PERSISTED_STATE = 'RESET_PERSISTED_STATE'
export const SET_DISPLAY = 'SET_DISPLAY'
export const USERS_INITIAL_LOAD = 'USERS_INITIAL_LOAD'
export const FETCHING_USERS = 'FETCHING_USERS'
export const TOKEN_TRANSFER_RECEIVED = 'TOKEN_TRANSFER_RECEIVED'
export const ROLE_ADDED = 'ROLE_ADDED'
export const ROLE_REMOVED = 'ROLE_REMOVED'

export const initialState = {
  initialized: false,
  registry: {},
  users_fetching: false,
}

export default (state = initialState, action) => {
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

const registry = (state = {}, action) => {
  const address = action.address
  switch (action.type) {
    case USERS_INITIAL_LOAD:
      let newUsers = {}
      _.each(action.users, user => {
        newUsers[user.address] = user
      })
      return { ...state, ...newUsers }
    case ROLE_ADDED:
      let updatedUser = { ...state[address] }
      updatedUser.role = updatedUser.role | action.role
      return { ...state, [address]: updatedUser }
    case ROLE_REMOVED:
      let roleRemovedUser = { ...state[address] }
      if ((roleRemovedUser.role & action.role) === 0) return state // if user doesn't have role
      roleRemovedUser.role = roleRemovedUser.role - action.role
      return { ...state, [address]: roleRemovedUser }
    case SET_DISPLAY:
      let renamedUser = state[address]
        ? { ...state[address] }
        : { address: action.address, role: 0, display: '', balance: 0 }
      renamedUser.display = action.display
      return { ...state, [address]: renamedUser }
    default:
      return state
  }
}

export const usersInitialLoad = ethereumClient => {
  return dispatch => {
    dispatch({
      type: FETCHING_USERS,
    })

    ethereumClient.userCount().then(userCount => {
      ethereumClient
        .getUsers({ startIndex: 0, count: userCount })
        .then(users => {
          dispatch({ type: USERS_INITIAL_LOAD, users })
        })
        .catch(error => {
          console.error('Error fetching users', error)
        })
    })
  }
}

export const setDisplay = (address, display) => {
  return { address, display, type: SET_DISPLAY }
}

export const roleAdded = (address, roleName) => {
  let role = numberForRoleString(roleName)
  return { address, role, type: ROLE_ADDED }
}

export const roleRemoved = (address, roleName) => {
  let role = numberForRoleString(roleName)
  return { address, role, type: ROLE_REMOVED }
}
