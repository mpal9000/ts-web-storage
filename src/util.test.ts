import test from 'ava'
import { wrapIs, isType } from './test.js'
import { ensureError } from './util.js'

test('ensureError()', (t) => {
  const is: ReturnType<typeof wrapIs> = wrapIs(t)

  is('BOOM', isType<string>()(ensureError('BAM', new Error('BOOM')).message))
  is('BOOM', isType<string>()(ensureError('BAM', 'BOOM').message))
  is('BOOM', isType<string>()(ensureError('BAM', { message: 'BOOM' }).message))
  is('BAM', isType<string>()(ensureError('BAM', null).message))
})
