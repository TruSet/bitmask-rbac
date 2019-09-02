import React, { Component, Fragment } from 'react'
import { css, StyleSheet } from 'aphrodite'
import {
  Paper,
  TextField,
} from '@material-ui/core'
import { connect } from 'react-redux'
import { Subject } from 'rxjs'
import { debounceTime } from 'rxjs/operators'
import NewUserModal from '../components/modals/NewUserModal'
import { ADMIN } from '../services/UserService'
import { simpleTextFilter } from '../lib/utils'
import { layoutStyles } from '../components/App'
import UserTable from '../components/UserTable'

import Spinner from '../components/Spinner'

const styles = StyleSheet.create({
  controls: {
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
})

class UserIndexScreen extends Component {
  state = {
    filterString: '',
  }
  searchText$ = new Subject()

  componentDidMount() {
    this.subscription = this.searchText$
      .pipe(debounceTime(250))
      .subscribe(filterString => this.setState({ filterString }))
  }
  componentWillUnmount() {
    this.subscription.unsubscribe()
  }

  handleKey = ({ target }) => this.searchText$.next(target.value)

  render() {
    const { handleKey } = this
    const { filterString } = this.state
    const { registry, users_fetching: usersFetching } = this.props.users
    const userRole = this.props.userRole
    const filterFunc = simpleTextFilter(filterString)

    let content
    if (usersFetching) {
      content = <Spinner />
    } else {
      const users = Object.values(registry).filter(filterFunc)

      content = (
        <Fragment>
          <Paper>
            <UserTable users={users} userRole={userRole} />
          </Paper>
        </Fragment>
      )
    }

    return (
      <div>
        <h1>All Users</h1>
        <div className={css(layoutStyles.content)}>
          <div className={css(styles.controls)}>
            <TextField
              style={{ marginBottom: 8 }}
              placeholder="Search"
              onChange={handleKey}
            />
            {(userRole & ADMIN) > 0 && <NewUserModal {...this.props} />}
          </div>
          {content}
        </div>
      </div>
    )
  }
}

export default connect(state => ({
  userRole: state.user.user.role,
  users: state.users,
}))(UserIndexScreen)
