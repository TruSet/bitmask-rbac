import {
  SET_USER,
} from './actions/user'

export const initialState = {
  tokenBalance: 0,
  user: { address: null, display: '', role: 0 },
}

export default (state = initialState, action) => {
  if (!action) return state
  switch (action.type) {
    case SET_USER:
      return { ...state, user: action.user }
    default:
      return state
  }
}
