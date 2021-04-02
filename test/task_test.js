import { test } from 'uvu'
import * as assert from 'uvu/assert'
import { Task } from '../src/task.js'

test('Task map valid', () => {
  Task.of(1)
    .map(v => v + 1)
    .fork(
      () => assert.equal(false, true),
      (v) => assert.equal(v, 2)
    )
})

test('Task map invalid', () => {
  Task.of(1)
    .map(v => {
      throw new Error('foo bar')
    })
    .fork(
      (e) => assert.equal(e, 'foo bar'),
      () => assert.equal(false, true)
    )
})

test('Task chain invalid', () => {
  Task.of(1) 
    .chain(v => 2)
    .fork(
      e => assert.equal(e, 'chain must return a Task type'),
      r => assert.equal(r, 3)
    )
})

test.run()
