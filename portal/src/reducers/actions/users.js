export const setUser = (
  { nodeAddress, display, roles },
  transactionHashCallback
) => ({
  metamaskClientFunction: 'setUser',
  metamaskClientFunctionArgs: [
    {
      nodeAddress,
      display,
      roles,
    },
  ],
  humanWaitPrompt: 'Updating User...',
  transactionHashCallback,
})

export const createUser = (
  { address, display, roles },
  transactionHashCallback
) => ({
  metamaskClientFunction: 'createUser',
  metamaskClientFunctionArgs: [{ address, display, roles }],
  humanWaitPrompt: 'Adding User...',
})
