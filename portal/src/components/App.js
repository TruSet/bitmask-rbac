import { css, StyleSheet } from 'aphrodite'
import React from 'react'
import { connect } from 'react-redux'
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import UserIndexScreen from '../screens/UserIndexScreen'
import MiningOverlay from './MiningOverlay'
import { GUEST } from '../services/UserService'
import { withStyles } from '@material-ui/core/styles'

export const headerHeight = 64

export const layoutStyles = StyleSheet.create({
  root: {
    display: 'flex',
  },
  content: {
    padding: 20,
    paddingBottom: 80,
  },
})

const styles = theme => ({
  viewContainer: {
    alignItems: 'stretch',
    display: 'flex',
    flexGrow: 1,
    flexDirection: 'column',
    height: '100%',
    justifyContent: 'flex-start',
    minHeight: '100vh',
    right: 0,
    zIndex: 0,
  },
})

const App = ({
  userIsAuthenticated,
  classes,
}) => (
  <BrowserRouter>
    <span className={css(layoutStyles.root)}>
      <div className={classes.viewContainer}>
        <Switch>
          <Route exact path="/" component={UserIndexScreen} />
        </Switch>
      </div>
      <MiningOverlay />
    </span>
  </BrowserRouter>
)

export default withStyles(styles)(
  connect(({ user }) => {
    const userIsAuthenticated = (user.user.role || 0) > GUEST
    return {
      userIsAuthenticated,
    }
  })(App)
)
