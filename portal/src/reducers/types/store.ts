import { UsersState} from './users'

export interface AppState {
  users: UsersState,
  [key: string]: object
}
