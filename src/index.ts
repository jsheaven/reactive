import { observed, defineProp } from '@jsheaven/observed'

export const reactiveScopeSymbol = Symbol('reactiveScope')

let currentReactiveFunctionScope: Function | undefined = undefined
let currentReactiveGetScope: any = undefined

/** marks a value to be reactively dependent to the currently active reactive function scope */
export const on = <T>(value: T): T => {
  if (typeof currentReactiveFunctionScope === 'undefined' || typeof currentReactiveGetScope === 'undefined')
    return value

  defineProp(currentReactiveGetScope, reactiveScopeSymbol, [
    ...(currentReactiveGetScope[reactiveScopeSymbol] || []),
    currentReactiveFunctionScope,
  ])

  currentReactiveGetScope = undefined
  return value
}

/** turns functions into reactive functions, runs them and turns objects into reactive ones */
export const reactive = <T>(value: T): T => {
  if (typeof currentReactiveFunctionScope !== 'undefined') {
    throw new Error("Don't use reactive() inside of reactive()")
  }

  if (typeof value === 'function') {
    // set the current reactive scope for getter interceptors to track dependencies
    currentReactiveFunctionScope = value

    // run the function for the first time
    // and thus tracks all [[get]] reads on reactively observed() datastrctures
    value()

    // reset the current reactive scope for getter interceptor to be numbed
    currentReactiveFunctionScope = undefined

    return value
  }

  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    return observed(value, {
      onGet: (prop, value, target, receiver) => {
        if (typeof currentReactiveFunctionScope === 'undefined') return
        currentReactiveGetScope = receiver
      },

      onSet: (prop, value, valueBefore, receiver) => {
        if (!Array.isArray(receiver[reactiveScopeSymbol])) return
        // re-run dependent (tracked) reactive functions
        receiver[reactiveScopeSymbol].forEach((fn) => fn())
      },
    })
  }
  throw new Error('This datatype cannot be turned reactive.')
}

export * from '@jsheaven/observed'
