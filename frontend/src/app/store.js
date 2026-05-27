const initialState = {
    auth: {
      isAuthenticated: false,
      token: null,
      user: null,
    },
    cart: {
      items: [],
    },
  }
  
  let state = structuredClone(initialState)
  const listeners = new Set()
  
  export const getState = () => state
  
  export const setState = (updater) => {
    const nextState = typeof updater === 'function' ? updater(state) : updater
    state = nextState
    listeners.forEach((listener) => listener(state))
  }
  
  export const subscribe = (listener) => {
    listeners.add(listener)
    return () => listeners.delete(listener)
  }
  
  export const resetState = () => {
    state = structuredClone(initialState)
    listeners.forEach((listener) => listener(state))
  }