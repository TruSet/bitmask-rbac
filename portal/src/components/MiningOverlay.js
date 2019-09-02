import React from 'react'
import { css, StyleSheet } from 'aphrodite'
import { connect } from 'react-redux'
import Particles from 'react-particles-js'

export const overlayStyles = StyleSheet.create({
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    height: '100%',
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: '2000',
  },
  overlayContent: {
    margin: 'auto',
    width: '50%',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    color: 'white',
    position: 'absolute',
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'column',
    alignItems: 'center',
  },
})

const miningOverlay = ({ open, message }) => (
  <span>
    {open && (
      <div className={css(overlayStyles.overlay)}>
        <Particles
          params={{
            particles: {
              line_linked: {
                shadow: { enable: true, color: '#ffffff' },
                width: 2,
              },
            },
          }}
        />
        <div className={css(overlayStyles.overlayContent)}>
          <h2>{message}</h2>
          <h3>Please wait while transaction is added to the blockchain</h3>
        </div>
      </div>
    )}
  </span>
)

export default connect(({ miningStatus }) => ({
  open: miningStatus.blockingUnminedTransactions.length > 0,
  message: miningStatus.message,
}))(miningOverlay)
