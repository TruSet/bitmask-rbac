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
  Select,
  IconButton,
  TextField,
  MenuItem,
} from '@material-ui/core'
import Create from '@material-ui/icons/Create'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import {
  supportedRoles,
  composeBitmask,
  decomposeBitmask,
} from '../../services/UserService'
import { setUser } from '../../reducers/actions/users'

const styles = StyleSheet.create({
  dialogContentRoot: {
    display: 'flex',
    flexDirection: 'column',
    height: 150,
    justifyContent: 'space-around',
  },
  formControl: {
    minWidth: 120,
  },
  chips: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  chip: {
    margin: '3px'
  },
})

class EditNodeModal extends Component {
  state = {
    nodeDisplay: this.props.node.display,
    roleNumbers: decomposeBitmask(this.props.node.role), // split up into number roles
    open: false,
  }

  handleOpen = () => {
    this.setState({
      open: true,
      roleNumbers: decomposeBitmask(this.props.node.role), // split up into number roles
    })
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
    this.props.setUser(
      {
        address: this.props.node.address,
        display: this.state.nodeDisplay,
        roles,
      },
      () => this.setState({ open: false })
    )
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
        <IconButton onClick={this.handleOpen}>
          <Create />
        </IconButton>
        <Dialog
          fullWidth={true}
          open={this.state.open}
          onClose={this.handleClose}
        >
          <DialogTitle>Edit User</DialogTitle>
          <DialogContent
            classes={{
              root: css(styles.dialogContentRoot),
            }}
          >
            <TextField
              placeholder="Rename User"
              value={this.state.nodeDisplay}
              disabled={!process.env.DISPLAY_USERNAMES}
              onChange={this.handleChange('nodeDisplay')}
              onKeyPress={this.handleKeyPress}
            />
            <br />
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
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleClose} color="primary">
              Cancel
            </Button>
            <Button color="primary" variant="contained" onClick={this.onSubmit}>
              Edit User
            </Button>
          </DialogActions>
        </Dialog>
      </Fragment>
    )
  }
}

export default connect(
  state => ({
    metamaskStatus: state.metamaskStatus,
  }),
  dispatch =>
    bindActionCreators(
      {
        setUser,
      },
      dispatch
    )
)(EditNodeModal)
