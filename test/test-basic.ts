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
    const cached = cache(expensive_count, () => 1000)
    init_expensive_count()
    t.equal(await cached(), 0)
    t.equal(await cached(), 0)
})

test('calls original function again after timeout', async (t) => {
    const cached = cache(expensive_count, () => 500)
    init_expensive_count()
    t.equal(await cached(), 0)
    t.equal(await cached(), 0)
    await sleep(1000)
    t.equal(await cached(), 1)
})

test('calls original function once for concurrent requests', async (t) => {
    const cached = cache(expensive_count, () => 500)
    init_expensive_count()
    t.deepEqual(await Promise.all([cached(), cached(), cached()]), [0, 0, 0])
    await sleep(1000)
    t.deepEqual(await Promise.all([cached(), cached(), cached()]), [1, 1, 1])
})

test('caches rejects', async (t) => {
    let calls = 0
    const cached = cache(
        () => Promise.reject(`reject ${calls++}`),
        () => 500
    )
    init_expensive_count()
    t.equal(await cached().catch((e) => `caught 1 ${e}`), 'caught 1 reject 0')
    t.equal(await cached().catch((e) => `caught 2 ${e}`), 'caught 2 reject 0')
    await sleep(1000)
    t.equal(await cached().catch((e) => `caught 3 ${e}`), 'caught 3 reject 1')
})

test('does not clone responses', async (t) => {
    const fn = async () => {
        sleep(100)
        return { a: 1 }
    }

    const cached = cache(fn, () => 500)

    {
        const res1 = await fn()
        const res2 = await fn()
        res1.a = 2
        t.deepEqual(res2, { a: 1 })
    }

    {
        const res1 = await cached()
        const res2 = await cached()
        res1.a = 2
        t.deepEqual(res2, { a: 2 })
    }
})

test('timeout starts after resolve', async (t) => {
    let calls = 0
    async function count() {
        await sleep(500)
        return calls++
    }

    const cached = cache(count, () => 300)
    t.equal(await cached(), 0)
    await sleep(200)
    t.equal(await cached(), 0)
    await sleep(1000)
    t.equal(await cached(), 1)
})

test('different timeouts for resolve and reject', async (t) => {
    let calls = 0
    async function count() {
        await sleep(500)
        if (++calls % 2) {
            return calls
        } else {
            throw `reject ${calls}`
        }
    }
    const cached = cache(count, (success) => (success ? 500 : 100))
    const tryCached = () => cached().catch((e) => `caught ${e}`)

    t.equal(await tryCached(), 1)
    await sleep(300)
    t.equal(await tryCached(), 1)
    await sleep(300)
    t.equal(await tryCached(), 'caught reject 2')
    await sleep(300)
    t.equal(await tryCached(), 3)
})
