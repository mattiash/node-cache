import { test } from 'purple-tape'
import { promisify } from 'util'
import { cache } from '../index'

const sleep = promisify(setTimeout)

async function expensive1() {
    await sleep(100)
    return 1
}

test('calls original function', async (t) => {
    const cached = cache(expensive1, 1000)
    t.equal(await cached(), 1)
    t.equal(await cached(), 1)
})

let counter = 0
async function expensive_count() {
    await sleep(100)
    return counter++
}

test('calls original function once', async (t) => {
    const cached = cache(expensive_count, 1000)
    t.equal(await cached(), 0)
    t.equal(await cached(), 0)
})
