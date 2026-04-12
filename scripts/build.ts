import { rm } from 'node:fs/promises'
import Bun from 'bun'

const outdir = 'dist'

await rm(outdir, { recursive: true, force: true })

const result = await Bun.build({
  entrypoints: ['src/cli.ts'],
  outdir,
  target: 'node',
  format: 'esm',
  minify: true,
  // compile: true,
  // banner,
})

if (!result.success) {
  console.error('Build failed:')
  for (const log of result.logs) {
    console.error(log)
  }
  process.exit(1)
}

// eslint-disable-next-line no-console
console.info('Build success!', result.outputs)
