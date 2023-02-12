import { jest } from '@jest/globals'
import { reactive, on } from '../dist/index.esm'

describe('reactive', () => {
  it('can call reactive', () => {
    reactive({
      foo: 'X',
    })

    expect(reactive).toBeDefined()
  })

  it('runs a reactive function initially', () => {
    const spy = jest.fn(() => {})
    reactive(spy)
    expect(spy).toHaveBeenCalledTimes(1)
  })

  it('runs a reactive function as often as a reactive value that it [[get]]s, is changed', () => {
    const spy = jest.fn(() => {})

    reactive(() => {
      const myBar = reactive({ bar: { foo: { value: 'Y' } } })
      const myBar2 = reactive({ bar2: { foo2: { value2: 'Y2' } } })

      reactive(() => {
        console.log('reading myBar.bar', myBar.bar.foo.value)

        // react on changes of this
        console.log('reading myBar2.bar2', on(myBar2.bar2.foo2.value2))
        spy()
      })

      myBar.bar.foo.value = 'X'
      myBar.bar.foo.value = 'Z'

      // here it is changed, so this will trigger a re-run
      myBar2.bar2.foo2.value2 = 'Z'
    })
    expect(spy).toHaveBeenCalledTimes(2 /** initial call + one change */)
  })

  it('does not work with null', () => {
    expect(() => reactive(null)).toThrowError('This datatype cannot be made reactive.')
  })

  it('does not work with non-object', () => {
    expect(() => reactive([])).toThrowError('This datatype cannot be made reactive.')
  })

  it('returns the input value when no reactive scope is set', () => {
    const state = { test: 123 }
    expect(on(state)).toBe(state)
    expect(on('foo')).toEqual('foo')
  })

  it('covers the readme example', (done) => {
    const spy = jest.fn(() => {})
    const state = reactive({ rand: 0 })
    const otherState = reactive({ rand: 0 })

    reactive(() => {
      // using state.rand makes this function re-run when setInterval changes it
      console.log('Next random value', on(state.rand))

      // but using a state like otherState.rand, that isn't maked for reactivity, will never trigger
      console.log('Prev random value (lags behind)', otherState.rand)

      spy()
    })

    let i = 0
    const interval = setInterval(() => {
      state.rand = otherState.rand // makes the reactive function re-run
      otherState.rand = Math.random() // doesn't, because the usage of otherState.rand is not "on"

      i++
      if (i === 9) {
        clearInterval(interval) // stops re-running the reactive function

        // testing
        expect(i).toEqual(9)
        expect(spy).toBeCalledTimes(10) // initial call plus 9 mutations
        done()
      }
    }, 1)
  })
})
