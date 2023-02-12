import { observed, defineProp } from '@jsheaven/observed'

const reactiveScopeSymbol = Symbol('reactiveScope')

let currentReactiveFunctionScope: Function | undefined = undefined
let currentReactiveGetScope: any = undefined

export const on = (value: any) => {
  if (typeof currentReactiveFunctionScope === 'undefined' || typeof currentReactiveGetScope === 'undefined')
    return value

  defineProp(currentReactiveGetScope, reactiveScopeSymbol, [
    ...(currentReactiveGetScope[reactiveScopeSymbol] || []),
    currentReactiveFunctionScope,
  ])

  currentReactiveGetScope = undefined
  return value
}

export const reactive = <T>(value: T): T => {
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
      /*
      onGet: (prop, value, target, receiver) => {
        if (typeof currentReactiveFunctionScope === 'undefined') return

        // rewind after numb()

        //if (_currentReactiveGetScope) {
        //  currentReactiveGetScope = _currentReactiveGetScope
        //  _currentReactiveGetScope = undefined
        //}


        if (currentReactiveGetScope === receiver) {
          // if it's not  a x or y in a x.y.z access
          // it's the x.y.z in an x.y.z access
          defineProp(receiver, reactiveScopeSymbol, [
            ...(Reflect.get(target, reactiveScopeSymbol, receiver) || []),
            currentReactiveFunctionScope,
          ])
        }

        // track the depth of an x.y.z access (recursively, this is deep)
        currentReactiveGetScope = value
      },
      */

      onSet: (prop, value, valueBefore, receiver) => {
        //if (!Array.isArray(receiver[reactiveScopeSymbol])) return
        // re-run dependent (tracked) reactive functions
        //receiver[reactiveScopeSymbol].forEach((fn) => fn())
        if (!Array.isArray(receiver[reactiveScopeSymbol])) return
        // re-run dependent (tracked) reactive functions
        receiver[reactiveScopeSymbol].forEach((fn) => fn())
      },
    })
  }
  throw new Error('This datatype cannot be made reactive.')
}

export * from '@jsheaven/observed'
