import 'source-map-support/register'
import { test } from 'purple-tape'
import { promisify } from 'util'
import { cache } from '../index'

const sleep = promisify(setTimeout)

let counter = 0
function init_expensive_count() {
    counter = 0
}

async function expensive_count() {
    await sleep(100)
    return counter++
}

test('calls original function once', async (t) => {
    const cached = cache(expensive_count, 1000)
    init_expensive_count()
    t.equal(await cached(), 0)
    t.equal(await cached(), 0)
})

test('calls original function again after timeout', async (t) => {
    const cached = cache(expensive_count, 500)
    init_expensive_count()
    t.equal(await cached(), 0)
    t.equal(await cached(), 0)
    await sleep(1000)
    t.equal(await cached(), 1)
})

test('calls original function once for concurrent requests', async (t) => {
    const cached = cache(expensive_count, 500)
    init_expensive_count()
    t.deepEqual(await Promise.all([cached(), cached(), cached()]), [0, 0, 0])
    await sleep(1000)
    t.deepEqual(await Promise.all([cached(), cached(), cached()]), [1, 1, 1])
})
