<h1 align="center">@jsheaven/reactive</h1>

> Nano library for functional, opt-in reactive programming

<h2 align="center">User Stories</h2>

1. As a developer, I (sometimes) want a function to be re-run when the data that it depends on, changes

<h2 align="center">Features</h2>

- ✅ Makes `Function`s reactive so that they re-run when data in reactive objects they use, changes
- ✅ Makes `Object`s reactive so that when values in them are changed, reactive `Functions` re-run
- ✅ Available as a simple API
- ✅ Just `357 byte` nano sized (ESM, gizpped)
- ✅ Tree-shakable and side-effect free
- ✅ One `@jsheaeven` dependency: `@jsheaven/observed`
- ✅ First class TypeScript support
- ✅ 100% Unit Test coverage

<h2 align="center">Example usage</h2>

<h3 align="center">Setup</h3>

- yarn: `yarn add @jsheaven/reactive`
- npm: `npm install @jsheaven/reactive`

<h3 align="center">ESM</h3>

```ts
import { reactive, on } from '@jsheaven/reactive'

const state = reactive({ rand: 0 })
const otherState = reactive({ rand: 0 })

reactive(() => {
  // using state.rand makes this function re-run when setInterval changes it
  console.log('Next random value', on(state.rand))

  // but using a state like otherState.rand, that isn't maked for reactivity, will never trigger
  console.log('Prev random value (lags behind)', otherState.rand)
})

let i = 0
const interval = setInterval(() => {
  state.rand = otherState.rand // this mutation causes the reactive function to re-run
  otherState.rand = Math.random() // this however, is numb

  if (i === 9) {
    clearInterval(interval) // stops re-running the reactive function
  }
}, 1000)
```

<h3 align="center">CommonJS</h3>

```ts
const { reactive, on } = require('@jsheaven/reactive')

// same API like ESM variant
```
