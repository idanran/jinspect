import { promiseState } from '../src/promise'
import assert from 'assert'
import { test } from 'mocha'

test('promiseStateIsFunction', () => {
    assert(promiseState instanceof Function)
})

test('promiseStateResolvePendingState', async () => {
    const state = await promiseState(new Promise(() => { }))
    assert.deepEqual(state, { status: 'pending' })
})

test('promiseStateResolveResolvedState', async () => {
    const value = { some: 'value' }
    const state = await promiseState(Promise.resolve(value))

    assert.deepEqual(state, { status: "fulfilled", result: value })
    assert.equal(state.result, value)
})

test('promiseStateResolveRejectedState', async () => {
    const reason = { some: 'reason' }
    const state = await promiseState(Promise.reject(reason))

    assert.deepEqual(state, { status: "rejected", result: reason })
    assert.equal(state.result, reason)
})