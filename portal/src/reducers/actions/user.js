import _ from 'lodash'

export const SET_USER = 'SET_USER'
export const FETCHING_USER = 'FETCHING_USER'
export const GUEST = 0


export const setUser = user => ({
  type: SET_USER,
  user: user,
})

export const userInitialLoad = (
  ethereumClient,
  address,
  onCorrectNetwork = true
) => async (dispatch, getState) => {
  dispatch({ type: FETCHING_USER })

  return ethereumClient.getUser(address).then(user => {
    if (!_.isUndefined(user.address)) {
      dispatch(setUser(user))
    } else {
      dispatch(
        setUser({
          address,
          display: 'Guest',
          role: GUEST,
        })
      )
    }
  })
}
