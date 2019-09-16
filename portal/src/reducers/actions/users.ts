interface UserParameters {
  address: string,
    display: string,
    roles: number
}

export const setUser = (
  { address, display, roles } : UserParameters,
  transactionHashCallback : any
) => ({
  metamaskClientFunction: 'setUser',
  metamaskClientFunctionArgs: [
    {
      address,
      display,
      roles,
    },
  ],
  humanWaitPrompt: 'Updating User...',
  transactionHashCallback,
})

export const createUser = (
  { address, display, roles } : UserParameters,
  transactionHashCallback : any
) => ({
  metamaskClientFunction: 'createUser',
  metamaskClientFunctionArgs: [{ address, display, roles }],
  humanWaitPrompt: 'Adding User...',
})
