import React, { Component, Fragment } from 'react'
import { css, StyleSheet } from 'aphrodite'
import {
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Input,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@material-ui/core'
import { parse } from 'qs'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { supportedRoles, composeBitmask } from '../../services/UserService'
import { createUser } from '../../reducers/actions/users'

const styles = StyleSheet.create({
  root: {},
  dialogContentRoot: {
    display: 'flex',
    flexDirection: 'column',
    height: 200,
    justifyContent: 'space-around',
  },
  formControl: {
    minWidth: 120,
  },
  chips: {
    display: 'flex',
    flexWrap: 'wrap',
  },
})

const initialState = {
  address: '',
  display: '',
  roleNumbers: [],
  open: false,
}

class NewNodeModal extends Component {
  state = initialState

  componentDidMount() {
    const query = parse(this.props.location.search, { ignoreQueryPrefix: true })
    const { address, fullName, username } = query
    if (address && (username || fullName)) {
      this.setState({
        address,
        display: username || fullName,
        open: true,
      })
    }
  }

  handleOpen = () => {
    this.setState({ open: true })
  }

  handleClose = () => {
    this.setState({ open: false })
  }

  handleKeyPress = e => {
    if (e.key === 'Enter') {
      this.onSubmit()
    }
  }

  onSubmit = () => {
    let roles = composeBitmask(this.state.roleNumbers)
    const { address, display } = this.state
    this.props.createUser({
      address,
      display,
      roles,
    })
    this.setState(initialState)
  }

  handleChange = key => event => this.setState({ [key]: event.target.value })

  render() {
    const displayRoles = supportedRoles.map(([id, text]) => (
      <MenuItem key={id} value={id}>
        <Checkbox checked={this.state.roleNumbers.indexOf(id) > -1} />
        {text}
      </MenuItem>
    ))

    return (
      <Fragment>
        <Button color="primary" variant="contained" onClick={this.handleOpen}>
          Add New User
        </Button>
        <Dialog
          fullWidth={true}
          onClose={this.handleClose}
          open={this.state.open}
        >
          <DialogTitle>Add New User</DialogTitle>
          <DialogContent
            classes={{
              root: css(styles.dialogContentRoot),
            }}
          >
            <FormControl>
              <InputLabel>Select Roles</InputLabel>
              <Select
                multiple
                value={this.state.roleNumbers}
                onChange={this.handleChange('roleNumbers')}
                input={<Input />}
                renderValue={selected => (
                  <div className={css(styles.chips)}>
                    {selected.map(value => (
                      <Chip
                        key={value}
                        label={supportedRoles[Math.log2(value)][1]}
                        className={css(styles.chip)}
                      />
                    ))}
                  </div>
                )}
                MenuProps={{
                  PaperProps: {
                    style: { maxHeight: 48 * 4.5 + 8, width: 250 },
                  },
                }}
              >
                {displayRoles}
              </Select>
            </FormControl>
            <TextField
              classes={{ root: css(styles.input) }}
              value={this.state.address}
              placeholder="User's Ethereum Address"
              label="Address"
              onChange={this.handleChange('address')}
              onKeyPress={this.handleKeyPress}
            />
            <TextField
              classes={{ root: css(styles.input) }}
              value={this.state.display}
              placeholder="User's name or identifier"
              label="Display Name"
              onChange={this.handleChange('display')}
              onKeyPress={this.handleKeyPress}
            />
          </DialogContent>
          <DialogActions>
            <Button color="primary" onClick={this.handleClose}>
              Cancel
            </Button>
            <Button color="primary" variant="contained" onClick={this.onSubmit}>
              Add User
            </Button>
          </DialogActions>
        </Dialog>
      </Fragment>
    )
  }
}

export default connect(
  () => ({}),
  dispatch =>
    bindActionCreators(
      {
        createUser,
      },
      dispatch
    )
)(NewNodeModal)
