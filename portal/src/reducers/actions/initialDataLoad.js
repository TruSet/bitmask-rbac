import { usersInitialLoad } from '../users'

export const initializeState = (ethereumClient, defaultAccount) => (
  dispatch
) => async () => {
  console.log("LOADING USERS")
  dispatch(usersInitialLoad(ethereumClient))
}
