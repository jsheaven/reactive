import { buildForNode } from '@jsheaven/easybuild'

await buildForNode({
  entryPoint: './src/index.ts',
  outfile: './dist/index.js',
  //debug: true,
  esBuildOptions: {
    logLevel: 'error',
  },
})
