import React from 'react'
import { css, StyleSheet } from 'aphrodite'

const styles = StyleSheet.create({
  spinner: {
    margin: '100px auto 0',
    width: 70,
    textAlign: 'center',
  },
  bounce: {
    width: 18,
    height: 18,
    backgroundColor: '#bbb',
    borderRadius: '100%',
    display: 'inline-block',
    animationName: {
      '0%': { transform: 'scale(0)' },
      '40%': { transform: 'scale(1.0)' },
      '80%': { transform: 'scale(0)' },
      '100%': { transform: 'scale(0)' },
    },
    animationDuration: '1.4s',
    animationTimingFunction: 'ease-in-out',
    animationIterationCount: 'infinite',
    animationFillMode: 'both',
  },
  bounce1: {
    animationDelay: '-320ms',
  },
  bounce2: {
    animationDelay: '-160ms',
  },
})

export default () => (
  <div className={css(styles.spinner)}>
    <div className={css(styles.bounce, styles.bounce1)} />
    <div className={css(styles.bounce, styles.bounce2)} />
    <div className={css(styles.bounce)} />
  </div>
)
