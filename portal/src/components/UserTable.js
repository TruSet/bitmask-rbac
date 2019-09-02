import React, { Fragment } from 'react'
import { css, StyleSheet } from 'aphrodite'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
} from '@material-ui/core'
import Group from '@material-ui/icons/Group'
import Build from '@material-ui/icons/Build'
import ThumbsUpDown from '@material-ui/icons/ThumbsUpDown'
import CreateNewFolder from '@material-ui/icons/CreateNewFolder'
import Description from '@material-ui/icons/Description'
import EditUserModal from '../components/modals/EditUserModal'
import EthereumIdenticon from 'ethereum-identicon'
import {
  ADMIN,
  DATA_ADMIN,
  PUBLISH,
  VALIDATE,
  CREATE_INSTRUMENT,
  supportedRoles,
} from '../services/UserService'


const styles = StyleSheet.create({
  activeRoleIcon: {
    color: 'black',
  },
  inactiveRoleIcon: {
    color: '#dddddd',
  },
})


const hideTokens = () => true

const UserHeading = (
  <TableRow>
    <TableCell style={{ width: '40px' }} />
    <TableCell style={{ width: '12em' }}>Display</TableCell>
    <TableCell style={{ width: '14em' }}>Access</TableCell>
    <TableCell>Address</TableCell>
    {!hideTokens() && (
      <Fragment>
        <TableCell>Token Balance</TableCell>
        <TableCell>Staked Token</TableCell>
        <TableCell>Total Balance</TableCell>
      </Fragment>
    )}
    <TableCell style={{ width: '3em' }} />
  </TableRow>
)

const iconTuples =  
  [
    [ADMIN, Group],
    [DATA_ADMIN, Build],
    [PUBLISH, Description],
    [VALIDATE, ThumbsUpDown],
    [CREATE_INSTRUMENT, CreateNewFolder],
  ]

const stringForRole = Object.assign(
  ...supportedRoles.map(d => ({ [d[0]]: d[1] }))
)

const rowIcons = role =>
  iconTuples.map(([roleType, RoleIconComponentName]) => {
    return (
      <Tooltip title={stringForRole[roleType]}>
        <RoleIconComponentName
          className={
            role & roleType
              ? css(styles.activeRoleIcon)
              : css(styles.inactiveRoleIcon)
          }
        />
      </Tooltip>
    )
  })

const UserRow = ({ user, userRole }) => (
  <TableRow key={user.address}>
    <TableCell style={{ width: '40px' }}>
      <EthereumIdenticon address={user.address} diameter={40} />
    </TableCell>
    <TableCell style={{ width: '12em' }}>{user.display}</TableCell>
    <TableCell style={{ width: '14em' }}>{rowIcons(user.role)}</TableCell>
    <TableCell style={{ fontFamily: 'monospace' }}>{user.address}</TableCell>
    {!hideTokens() && (
      <Fragment>
        <TableCell>{(user.balance / 1000).toFixed(3)}</TableCell>
        <TableCell>{(user.stakedBalance / 1000).toFixed(3)}</TableCell>
        <TableCell>
          {((user.balance + user.stakedBalance) / 1000).toFixed(3)}
        </TableCell>
      </Fragment>
    )}
    <TableCell style={{ width: '3em' }}>
      {(userRole & ADMIN) > 0 && <EditUserModal node={user} />}
    </TableCell>
  </TableRow>
)

const UserTable = ({users, userRole}) =>
{
  const UserRows = users.map(usr => (
    <UserRow key={usr.address} user={usr} userRole={userRole} />
    ))

  return <Table>
    <TableHead>{UserHeading}</TableHead>
    <TableBody>{UserRows}</TableBody>
  </Table>
  }

export default UserTable
